import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

// API Keys from environment
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || "";
const HELIUS_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || process.env.SOLANA_RPC_ENDPOINT || "";

// Moralis Solana API endpoint
const MORALIS_SOLANA_API = "https://solana-gateway.moralis.io/account/mainnet";

// Clean mint address - remove "svm:" prefix
function cleanMintAddress(mintAddress: string): string {
  return mintAddress.startsWith("svm:") ? mintAddress.slice(4) : mintAddress;
}

interface MoralisToken {
  mint: string;
  amount: string;
  decimals: string;
  name?: string;
  symbol?: string;
}

interface StockData {
  symbol: string;
  underlying: string;
  name: string;
  mintAddress: string;
  hasSolana: boolean;
  provider: string;
  price?: {
    tokenPrice: number;
    tradFiPrice: number;
    spread: number;
  };
}

/**
 * Fetch portfolio using Moralis API (fast, 1 request)
 */
async function fetchWithMoralis(
  walletAddress: string,
  stocksMap: Map<string, StockData>
): Promise<{ holdings: any[]; totalValue: number } | null> {
  if (!MORALIS_API_KEY) {
    console.log("[Portfolio] No Moralis API key, skipping");
    return null;
  }

  try {
    console.log("[Portfolio] Fetching with Moralis...");
    const startTime = Date.now();

    const response = await fetch(
      `${MORALIS_SOLANA_API}/${walletAddress}/tokens`,
      {
        headers: {
          "X-API-Key": MORALIS_API_KEY,
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("[Portfolio] Moralis API error:", response.status);
      return null;
    }

    const tokens: MoralisToken[] = await response.json();
    console.log(`[Portfolio] Moralis returned ${tokens.length} tokens in ${Date.now() - startTime}ms`);
    
    // Debug: Log all token mints from wallet
    console.log("[Portfolio] Wallet tokens:", tokens.map(t => ({
      mint: t.mint,
      symbol: t.symbol,
      amount: t.amount
    })));
    
    // Debug: Log all known stock mints
    console.log("[Portfolio] Known stock mints:", Array.from(stocksMap.keys()));

    const holdings: any[] = [];

    for (const token of tokens) {
      const stock = stocksMap.get(token.mint);
      console.log(`[Portfolio] Token ${token.mint} (${token.symbol}): ${stock ? 'MATCH FOUND' : 'no match'}`);
      if (stock) {
        const decimals = parseInt(token.decimals) || 9;
        const balance = parseInt(token.amount) / Math.pow(10, decimals);

        if (balance > 0) {
          const valueUsd = balance * (stock.price?.tokenPrice || 0);

          holdings.push({
            symbol: stock.symbol,
            underlying: stock.underlying,
            name: stock.name,
            mintAddress: token.mint,
            balance,
            tokenPrice: stock.price?.tokenPrice || 0,
            stockPrice: stock.price?.tradFiPrice || 0,
            spread: stock.price?.spread || 0,
            valueUsd,
            provider: stock.provider,
          });
        }
      }
    }

    // Sort by value
    holdings.sort((a, b) => b.valueUsd - a.valueUsd);
    const totalValue = holdings.reduce((sum, h) => sum + h.valueUsd, 0);

    console.log(`[Portfolio] Found ${holdings.length} stock holdings via Moralis`);
    return { holdings, totalValue };
  } catch (error) {
    console.error("[Portfolio] Moralis fetch failed:", error);
    return null;
  }
}

/**
 * Fetch portfolio using Helius RPC (fallback, slower)
 */
async function fetchWithHelius(
  walletAddress: string,
  solanaStocks: StockData[]
): Promise<{ holdings: any[]; totalValue: number }> {
  console.log("[Portfolio] Falling back to Helius RPC...");
  const startTime = Date.now();

  const publicKey = new PublicKey(walletAddress);
  const connection = new Connection(HELIUS_RPC, "confirmed");

  const holdings: any[] = [];

  for (const stock of solanaStocks) {
    const mintAddress = cleanMintAddress(stock.mintAddress);

    try {
      const mintPubkey = new PublicKey(mintAddress);
      const tokenAccounts = await connection.getTokenAccountsByOwner(
        publicKey,
        { mint: mintPubkey }
      );

      if (tokenAccounts.value.length > 0) {
        const accountInfo = await connection.getParsedAccountInfo(
          tokenAccounts.value[0].pubkey
        );

        if (accountInfo.value) {
          const data = accountInfo.value.data as any;
          if (data.parsed) {
            const balance = data.parsed.info.tokenAmount.uiAmount;

            if (balance > 0) {
              const valueUsd = balance * (stock.price?.tokenPrice || 0);

              holdings.push({
                symbol: stock.symbol,
                underlying: stock.underlying,
                name: stock.name,
                mintAddress,
                balance,
                tokenPrice: stock.price?.tokenPrice || 0,
                stockPrice: stock.price?.tradFiPrice || 0,
                spread: stock.price?.spread || 0,
                valueUsd,
                provider: stock.provider,
              });
            }
          }
        }
      }
    } catch {
      // Token account doesn't exist - skip
    }

    // Small delay between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Sort by value
  holdings.sort((a, b) => b.valueUsd - a.valueUsd);
  const totalValue = holdings.reduce((sum, h) => sum + h.valueUsd, 0);

  console.log(`[Portfolio] Found ${holdings.length} holdings via Helius in ${Date.now() - startTime}ms`);
  return { holdings, totalValue };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("wallet");

  if (!walletAddress) {
    return NextResponse.json({ success: false, error: "Missing wallet address" }, { status: 400 });
  }

  try {
    // Validate wallet address
    new PublicKey(walletAddress);

    // Build the base URL for internal API calls
    const { origin } = new URL(request.url);

    // Fetch all available stocks
    const stocksResponse = await fetch(`${origin}/api/stocks`);
    const stocksData = await stocksResponse.json();

    if (!stocksData.success || !stocksData.data) {
      return NextResponse.json({ success: false, error: "Failed to fetch stock data" }, { status: 500 });
    }

    // Get stocks with valid Solana mint addresses
    const solanaStocks: StockData[] = stocksData.data.filter((stock: any) => {
      const mint = cleanMintAddress(stock.mintAddress || "");
      return mint && mint !== "N/A" && stock.hasSolana;
    });

    // Create a map of mint address -> stock data for fast lookup
    const stocksMap = new Map<string, StockData>();
    for (const stock of solanaStocks) {
      const cleanMint = cleanMintAddress(stock.mintAddress);
      stocksMap.set(cleanMint, stock);
    }
    
    console.log(`[Portfolio] Loaded ${solanaStocks.length} Solana stocks, stocksMap has ${stocksMap.size} entries`);

    // Try Moralis first (fast), fall back to Helius (slower)
    let result = await fetchWithMoralis(walletAddress, stocksMap);
    let source = "moralis";

    if (!result) {
      // Fallback to Helius RPC
      result = await fetchWithHelius(walletAddress, solanaStocks);
      source = "helius";
    }

    return NextResponse.json({
      success: true,
      holdings: result.holdings,
      totalValue: result.totalValue,
      count: result.holdings.length,
      source, // For debugging
      debug: {
        knownStocks: solanaStocks.length,
        stocksMapSize: stocksMap.size,
        sampleMints: Array.from(stocksMap.keys()).slice(0, 3),
      }
    });
  } catch (error) {
    console.error("Portfolio API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
