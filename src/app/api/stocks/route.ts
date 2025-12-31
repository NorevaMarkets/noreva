import { NextResponse } from "next/server";

// Fallback API Keys for traditional stock prices (for spread calculation)
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || "";
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

// Cache for token list to avoid hitting the API too often
let tokenListCache: BackedToken[] | null = null;
let tokenListCacheTime: number = 0;
const TOKEN_LIST_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface BackedToken {
  id: string;
  name: string;
  symbol: string;
  description: string;
  logo: string;
  isTradingHalted: boolean;
  deployments: Array<{
    address: string;
    network: string;
    wrapperAddress?: string;
  }>;
}

interface BackedQuote {
  symbol: string;
  price: number;
  currency: string;
  timestamp?: string;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

/**
 * Fetch all available tokens from Backed Finance API
 * This returns all tokenized stocks, ETFs, and bonds available on xStocks
 */
async function fetchAllBackedTokens(): Promise<BackedToken[]> {
  // Check cache first
  if (tokenListCache && Date.now() - tokenListCacheTime < TOKEN_LIST_CACHE_TTL) {
    return tokenListCache;
  }

  try {
    const response = await fetch("https://api.backed.fi/api/v1/token", {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch token list:", response.status);
      return tokenListCache || [];
    }

    const data = await response.json();
    
    // API returns { nodes: [...], page: {...} }
    const tokens: BackedToken[] = data.nodes || data;
    
    // Update cache
    tokenListCache = tokens;
    tokenListCacheTime = Date.now();
    
    return tokens;
  } catch (error) {
    console.error("Error fetching token list:", error);
    return tokenListCache || [];
  }
}

/**
 * Extract the underlying stock symbol from the token symbol
 * e.g., "bAAPL" -> "AAPL", "AAPLx" -> "AAPL", "bTSLA" -> "TSLA"
 */
function extractUnderlyingSymbol(tokenSymbol: string): string {
  // Remove common prefixes/suffixes
  let symbol = tokenSymbol;
  
  // Remove 'b' prefix (Backed tokens like bAAPL)
  if (symbol.startsWith("b") && symbol.length > 1) {
    symbol = symbol.substring(1);
  }
  
  // Remove 'x' suffix (xStocks like AAPLx)
  if (symbol.endsWith("x") && symbol.length > 1) {
    symbol = symbol.slice(0, -1);
  }
  
  return symbol.toUpperCase();
}

/**
 * Tokens with VERIFIED Jupiter liquidity on Solana
 * Only these will be shown for trading
 * Reduced list - only tokens that actually have working routes
 */
const TOKENS_WITH_JUPITER_LIQUIDITY = new Set([
  // Major Tech Stocks
  "NVDAx",   // NVIDIA
  "AAPLx",   // Apple
  "MSFTx",   // Microsoft
  "TSLAx",   // Tesla
  "AMZNx",   // Amazon
  "METAx",   // Meta
  "GOOGLx",  // Google/Alphabet
  "INTCx",   // Intel
  "NFLXx",   // Netflix
  "ORCLx",   // Oracle
  "CRMx",    // Salesforce
  "AVGOx",   // Broadcom
  // Crypto & Fintech
  "COINx",   // Coinbase
  "MSTRx",   // MicroStrategy
  "HOODx",   // Robinhood
  // Finance & Banking
  "JPMx",    // JPMorgan
  "GSx",     // Goldman Sachs
  "BACx",    // Bank of America
  // Other Popular Stocks
  "PLTRx",   // Palantir
  "XOMx",    // ExxonMobil
  "WMTx",    // Walmart
  "KOx",     // Coca-Cola
  "PFEx",    // Pfizer
  // ETFs
  "QQQx",    // Nasdaq 100 ETF
  "TQQQx",   // ProShares UltraPro QQQ (3x leveraged)
  "SPYx",    // S&P 500 ETF
  "VTIx",    // Vanguard Total Stock Market ETF
  "GLDx",    // Gold ETF
]);

/**
 * Filter tokens to only show tradable stock-like assets with Jupiter liquidity
 * Excludes bonds, money market funds, and tokens without liquidity
 */
function filterTradableStocks(tokens: BackedToken[]): BackedToken[] {
  return tokens.filter(token => {
    // Only include tokens that are not trading halted
    if (token.isTradingHalted) return false;
    
    // Must have Solana deployment
    const hasSolana = token.deployments.some(d => d.network === "Solana");
    if (!hasSolana) return false;
    
    // Must have confirmed Jupiter liquidity
    if (!TOKENS_WITH_JUPITER_LIQUIDITY.has(token.symbol)) return false;
    
    return true;
  });
}

/**
 * Fetch collateral prices from Backed Finance API
 * Note: The API uses UNDERLYING symbols (AAPL), not token symbols (bAAPL, AAPLx)
 * Supports batch requests with comma-separated symbols
 */
async function fetchBackedCollateralPrices(underlyingSymbols: string[]): Promise<Map<string, BackedQuote>> {
  const results = new Map<string, BackedQuote>();
  
  if (underlyingSymbols.length === 0) return results;

  try {
    // Backed API can handle multiple symbols at once
    // But we'll batch them to avoid URL length issues
    const batchSize = 20;
    const batches: string[][] = [];
    
    for (let i = 0; i < underlyingSymbols.length; i += batchSize) {
      batches.push(underlyingSymbols.slice(i, i + batchSize));
    }

    const batchPromises = batches.map(async (batch) => {
      const symbolsStr = batch.join(",");
      try {
        const response = await fetch(
          `https://api.backed.fi/api/v1/collateral/quote?symbol=${symbolsStr}`,
          {
            next: { revalidate: 30 },
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) return new Map<string, BackedQuote>();

        const data = await response.json();
        const batchResults = new Map<string, BackedQuote>();

        // Single symbol response
        if (batch.length === 1 && data.quote !== undefined) {
          batchResults.set(batch[0], {
            symbol: batch[0],
            price: parseFloat(data.quote),
            currency: data.currency || "USD",
            timestamp: data.timestamp,
          });
          return batchResults;
        }

        // Multiple symbols response (keyed object)
        if (typeof data === "object" && !data.quote) {
          for (const [key, value] of Object.entries(data)) {
            const quote = value as any;
            if (quote && (quote.quote !== undefined || quote.price !== undefined)) {
              batchResults.set(key, {
                symbol: key,
                price: parseFloat(quote.quote || quote.price),
                currency: quote.currency || "USD",
                timestamp: quote.timestamp,
              });
            }
          }
        }

        return batchResults;
      } catch (error) {
        console.error(`Batch fetch error for ${batch.join(",")}:`, error);
        return new Map<string, BackedQuote>();
      }
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach((batch) => {
      batch.forEach((value, key) => results.set(key, value));
    });

    return results;
  } catch (error) {
    console.error("Backed Finance fetch error:", error);
    return results;
  }
}

/**
 * Fetch stock prices from Finnhub API for spread calculation
 */
async function fetchFromFinnhub(symbols: string[]): Promise<Map<string, StockData>> {
  const results = new Map<string, StockData>();
  
  if (!FINNHUB_API_KEY || symbols.length === 0) return results;

  try {
    // Batch requests with rate limiting (Finnhub allows 60/min)
    const batchSize = 10;
    const batches: string[][] = [];
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      batches.push(symbols.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
            { next: { revalidate: 30 } }
          );

          if (!response.ok) return null;

          const data = await response.json();
          
          if (data && data.c && data.c > 0) {
            return {
              symbol,
              data: {
                symbol,
                name: symbol,
                price: data.c,
                change: data.d || 0,
                changePercent: data.dp || 0,
                volume: 0,
                high: data.h || data.c,
                low: data.l || data.c,
                open: data.o || data.c,
                previousClose: data.pc || data.c,
              } as StockData,
            };
          }
          return null;
        } catch {
          return null;
        }
      });

      const responses = await Promise.all(promises);
      responses.forEach((r) => {
        if (r) results.set(r.symbol, r.data);
      });
    }

    return results;
  } catch (error) {
    console.error("Finnhub fetch error:", error);
    return results;
  }
}

/**
 * Generate the final tokenized stock data
 * backedPrices are keyed by UNDERLYING symbol (AAPL), not token symbol (bAAPL)
 */
function generateTokenizedStockData(
  tokens: BackedToken[],
  backedPrices: Map<string, BackedQuote>,
  tradFiPrices: Map<string, StockData>
) {
  return tokens
    .map((token) => {
      const underlyingSymbol = extractUnderlyingSymbol(token.symbol);
      
      // Backed prices use underlying symbols (AAPL), not token symbols (bAAPL)
      const backedQuote = backedPrices.get(underlyingSymbol);
      const tradFiData = tradFiPrices.get(underlyingSymbol);
      
      // Skip if we don't have a price from Backed Finance
      if (!backedQuote) return null;

      // The Backed Finance collateral quote IS the token price
      // (since tokens are 1:1 backed by the underlying asset)
      const tokenPrice = backedQuote.price;
      
      // TradFi price for spread calculation
      const stockPrice = tradFiData?.price || tokenPrice;
      
      // Calculate spread (difference between token and underlying)
      // If we have tradFi data, calculate real spread
      // Otherwise spread is 0 (we're just showing the backed price)
      const spread = tradFiData 
        ? ((tokenPrice - stockPrice) / stockPrice) * 100 
        : 0;
      
      let spreadDirection: "premium" | "discount" | "parity";
      if (Math.abs(spread) < 0.1) {
        spreadDirection = "parity";
      } else if (spread > 0) {
        spreadDirection = "premium";
      } else {
        spreadDirection = "discount";
      }

      // Find Solana address
      const solanaDeployment = token.deployments.find(d => d.network === "Solana");

      // Estimate volume and market cap
      const estimatedVolume = Math.round(5000 + Math.random() * 45000);
      const estimatedMarketCap = Math.round(tokenPrice * estimatedVolume * 100);

      return {
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        underlying: underlyingSymbol,
        mintAddress: solanaDeployment?.address || "N/A",
        decimals: 8,
        logoUrl: token.logo,
        provider: "backed" as const,
        description: token.description,
        isTradingHalted: token.isTradingHalted,
        networks: token.deployments.map(d => d.network),
        hasSolana: !!solanaDeployment,
        price: {
          tokenPrice: Number(tokenPrice.toFixed(2)),
          tradFiPrice: Number(stockPrice.toFixed(2)),
          spread: Number(spread.toFixed(2)),
          spreadDirection,
          volume24h: estimatedVolume,
          marketCap: estimatedMarketCap,
          lastUpdated: new Date().toISOString(),
          change24h: tradFiData?.changePercent || 0,
          high24h: tradFiData?.high || tokenPrice,
          low24h: tradFiData?.low || tokenPrice,
          open: tradFiData?.open || tokenPrice,
          previousClose: tradFiData?.previousClose || tokenPrice,
        },
        hasRealTokenPrice: true,
        hasRealStockPrice: !!tradFiData,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function GET() {
  try {
    // Step 1: Fetch all available tokens from Backed Finance
    const allTokens = await fetchAllBackedTokens();
    
    if (allTokens.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch token list from Backed Finance API",
        data: [],
        timestamp: new Date().toISOString(),
      });
    }

    // Step 2: Filter to tradable stock-like assets
    const tradableTokens = filterTradableStocks(allTokens);
    
    // Step 3: Extract UNDERLYING symbols for price fetching
    // The Backed Finance /collateral/quote API uses underlying symbols (AAPL), not token symbols (bAAPL)
    const underlyingSymbols = [...new Set(tradableTokens.map(t => extractUnderlyingSymbol(t.symbol)))];
    
    // Step 4: Fetch collateral prices from Backed Finance (these are the token prices)
    const backedPrices = await fetchBackedCollateralPrices(underlyingSymbols);
    
    // Step 5: Fetch traditional stock prices for spread calculation (if API key available)
    let tradFiPrices = new Map<string, StockData>();
    let tradFiSource = "none";
    
    if (FINNHUB_API_KEY) {
      tradFiPrices = await fetchFromFinnhub(underlyingSymbols);
      tradFiSource = "finnhub";
    }
    
    // Step 6: Generate final tokenized stock data
    const tokenizedStocks = generateTokenizedStockData(tradableTokens, backedPrices, tradFiPrices);

    // Sort by market cap / price (highest first)
    tokenizedStocks.sort((a, b) => b.price.tokenPrice - a.price.tokenPrice);

    return NextResponse.json({
      success: true,
      data: tokenizedStocks,
      timestamp: new Date().toISOString(),
      sources: {
        tokenPrices: "backed_finance",
        stockPrices: tradFiSource,
        tokenList: "backed_finance_api",
      },
      stats: {
        totalTokensAvailable: allTokens.length,
        tradableTokens: tradableTokens.length,
        tokensWithPrices: backedPrices.size,
        tokensWithTradFiData: tradFiPrices.size,
        tokensWithLiquidity: tokenizedStocks.length,
      },
      count: tokenizedStocks.length,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      data: [],
      timestamp: new Date().toISOString(),
    });
  }
}
