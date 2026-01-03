import { NextResponse } from "next/server";

const MORALIS_API_KEY = process.env.MORALIS_API_KEY || "";

// Verified mint addresses for xStock tokens
const VERIFIED_MINT_ADDRESSES: Record<string, string> = {
  "NVDAx": "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
  "AAPLx": "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
  "MSFTx": "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
  "TSLAx": "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
  "AMZNx": "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
  "METAx": "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu",
  "GOOGLx": "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
  "NFLXx": "XsEH7wWfJJu2ZT3UCFeVfALnVA6CP5ur7Ee11KmzVpL",
  "ORCLx": "XsjFwUPiLofddX5cWFHW35GCbXcSu1BCUGfxoQAQjeL",
  "COINx": "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu",
  "MSTRx": "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ",
  "HOODx": "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg",
  "XOMx": "XsaHND8sHyfMfsWPj6kSdd5VwvCayZvjYgKmmcNL5qh",
  "KOx": "XsaBXg8dU5cPM6ehmVctMkVqoiRG2ZjMo1cyBJ3AykQ",
  "QQQx": "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
  "SPYx": "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
  "GLDx": "Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re",
};

// Reverse mapping: mint address -> symbol
const MINT_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(VERIFIED_MINT_ADDRESSES).map(([symbol, mint]) => [mint, symbol])
);

interface MoralisOHLCVResponse {
  timeframe: string;
  currency: string;
  result: Array<{
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

interface OHLCVCandle {
  time: number; // Unix timestamp in seconds (required by Lightweight Charts)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Get mint address from symbol
 */
function getMintAddress(symbol: string): string | null {
  // Direct lookup
  if (VERIFIED_MINT_ADDRESSES[symbol]) {
    return VERIFIED_MINT_ADDRESSES[symbol];
  }
  
  // Try with 'x' suffix
  const withX = symbol.endsWith("x") ? symbol : `${symbol}x`;
  if (VERIFIED_MINT_ADDRESSES[withX]) {
    return VERIFIED_MINT_ADDRESSES[withX];
  }
  
  // Try uppercase variations
  const upper = symbol.toUpperCase();
  for (const [key, value] of Object.entries(VERIFIED_MINT_ADDRESSES)) {
    if (key.toUpperCase() === upper || key.toUpperCase() === `${upper}X`) {
      return value;
    }
  }
  
  // Check if it's already a mint address
  if (symbol.length > 30) {
    return symbol;
  }
  
  return null;
}

/**
 * Fetch OHLCV data from Moralis API
 * Endpoint: GET /token/{network}/{address}/ohlcv
 */
async function fetchMoralisOHLCV(
  mintAddress: string,
  timeframe: string = "1d",
  limit: number = 100
): Promise<OHLCVCandle[]> {
  if (!MORALIS_API_KEY) {
    console.error("MORALIS_API_KEY not configured");
    return [];
  }

  try {
    // Moralis OHLCV endpoint for Solana
    // Timeframes: 1m, 5m, 15m, 30m, 1h, 4h, 1d
    const url = `https://solana-gateway.moralis.io/token/mainnet/${mintAddress}/ohlcv?timeframe=${timeframe}&limit=${limit}`;
    
    console.log(`[Moralis OHLCV] Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "X-API-Key": MORALIS_API_KEY,
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      console.error(`[Moralis OHLCV] Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[Moralis OHLCV] Response: ${errorText}`);
      return [];
    }

    const data: MoralisOHLCVResponse = await response.json();
    console.log(`[Moralis OHLCV] Got ${data.result?.length || 0} candles`);

    if (!data.result || data.result.length === 0) {
      console.log("[Moralis OHLCV] No data returned");
      return [];
    }

    // Convert to Lightweight Charts format
    const candles: OHLCVCandle[] = data.result.map((item) => ({
      time: Math.floor(new Date(item.timestamp).getTime() / 1000),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));

    // Sort by time ascending (required by Lightweight Charts)
    candles.sort((a, b) => a.time - b.time);

    return candles;
  } catch (error) {
    console.error("[Moralis OHLCV] Fetch error:", error);
    return [];
  }
}

/**
 * Generate mock OHLCV data for testing/fallback
 */
function generateMockOHLCV(basePrice: number, days: number = 90): OHLCVCandle[] {
  const candles: OHLCVCandle[] = [];
  const now = Math.floor(Date.now() / 1000);
  const dayInSeconds = 86400;
  
  let price = basePrice * 0.8; // Start lower
  
  for (let i = days; i >= 0; i--) {
    const time = now - (i * dayInSeconds);
    const volatility = 0.02; // 2% daily volatility
    const trend = 0.001; // Slight upward trend
    
    const change = (Math.random() - 0.5) * 2 * volatility + trend;
    const open = price;
    const close = price * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(1000 + Math.random() * 10000),
    });
    
    price = close;
  }
  
  return candles;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const mintAddress = searchParams.get("mintAddress");
  const timeframe = searchParams.get("timeframe") || "1d";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : 0; // 0 means use default for timeframe

  if (!symbol && !mintAddress) {
    return NextResponse.json({
      success: false,
      error: "Symbol or mintAddress is required",
    }, { status: 400 });
  }

  // Get mint address
  const mint = mintAddress || getMintAddress(symbol!);
  
  if (!mint) {
    return NextResponse.json({
      success: false,
      error: `Unknown symbol: ${symbol}`,
    }, { status: 404 });
  }

  // Map timeframe to Moralis format and adjust limits
  const timeframeConfig: Record<string, { moralisTimeframe: string; defaultLimit: number }> = {
    "1m": { moralisTimeframe: "1m", defaultLimit: 60 },      // 1 hour of 1m candles
    "5m": { moralisTimeframe: "5m", defaultLimit: 96 },      // 8 hours of 5m candles
    "15m": { moralisTimeframe: "15m", defaultLimit: 96 },    // 24 hours of 15m candles
    "30m": { moralisTimeframe: "30m", defaultLimit: 96 },    // 48 hours of 30m candles
    "1h": { moralisTimeframe: "1h", defaultLimit: 168 },     // 7 days of 1h candles
    "4h": { moralisTimeframe: "4h", defaultLimit: 180 },     // 30 days of 4h candles
    "1d": { moralisTimeframe: "1d", defaultLimit: 90 },      // 90 days
    "1D": { moralisTimeframe: "1d", defaultLimit: 90 },
    "D": { moralisTimeframe: "1d", defaultLimit: 90 },
    "1w": { moralisTimeframe: "1d", defaultLimit: 365 },     // 1 year of daily candles for weekly view
    "1W": { moralisTimeframe: "1d", defaultLimit: 365 },
    "1M": { moralisTimeframe: "1d", defaultLimit: 365 },     // 1 year of daily candles for monthly view
    "1MO": { moralisTimeframe: "1d", defaultLimit: 365 },
  };

  const config = timeframeConfig[timeframe] || { moralisTimeframe: "1d", defaultLimit: 100 };
  const moralisTimeframe = config.moralisTimeframe;
  const effectiveLimit = limit || config.defaultLimit;

  // Fetch OHLCV data from Moralis
  let candles = await fetchMoralisOHLCV(mint, moralisTimeframe, effectiveLimit);

  // If no data from Moralis, generate mock data for demo
  if (candles.length === 0) {
    console.log(`[OHLCV] No Moralis data, generating mock data for ${symbol || mint}`);
    // Use a base price based on the symbol (rough estimates)
    const basePrices: Record<string, number> = {
      "TSLAx": 450,
      "AAPLx": 270,
      "MSFTx": 480,
      "NVDAx": 190,
      "AMZNx": 230,
      "GOOGLx": 315,
      "METAx": 660,
      "COINx": 230,
      "QQQx": 620,
      "SPYx": 685,
    };
    const basePrice = basePrices[symbol || ""] || 100;
    candles = generateMockOHLCV(basePrice, effectiveLimit);
  }

  return NextResponse.json({
    success: true,
    symbol: symbol || MINT_TO_SYMBOL[mint] || mint,
    mintAddress: mint,
    timeframe: moralisTimeframe,
    count: candles.length,
    data: candles,
    source: candles.length > 0 ? "moralis" : "mock",
  });
}

