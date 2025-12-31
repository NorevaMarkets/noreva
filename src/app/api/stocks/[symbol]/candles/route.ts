import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * GET /api/stocks/[symbol]/candles
 * Fetches historical price data for a stock symbol
 * 
 * Query params:
 * - resolution: 1, 5, 15, 30, 60, D, W, M (default: D)
 * - from: Unix timestamp (default: 30 days ago)
 * - to: Unix timestamp (default: now)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const { searchParams } = new URL(request.url);
  
  const resolution = searchParams.get("resolution") || "D";
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
  
  const from = parseInt(searchParams.get("from") || String(thirtyDaysAgo));
  const to = parseInt(searchParams.get("to") || String(now));

  // Extract underlying symbol (remove x, b prefix for xStocks/backed tokens)
  const underlyingSymbol = extractUnderlyingSymbol(symbol);

  try {
    // Try to fetch from Finnhub first
    if (FINNHUB_API_KEY) {
      const candles = await fetchFinnhubCandles(underlyingSymbol, resolution, from, to);
      if (candles && candles.length > 0) {
        return NextResponse.json({
          success: true,
          data: candles,
          symbol: underlyingSymbol,
          resolution,
          source: "finnhub",
        });
      }
    }

    // Fallback to simulated data if no API key or no data returned
    const simulatedCandles = generateSimulatedCandles(from, to, resolution);
    return NextResponse.json({
      success: true,
      data: simulatedCandles,
      symbol: underlyingSymbol,
      resolution,
      source: "simulated",
    });

  } catch (error) {
    console.error("Error fetching candles:", error);
    
    // Return simulated data on error
    const simulatedCandles = generateSimulatedCandles(from, to, resolution);
    return NextResponse.json({
      success: true,
      data: simulatedCandles,
      symbol: underlyingSymbol,
      resolution,
      source: "simulated",
    });
  }
}

function extractUnderlyingSymbol(tokenSymbol: string): string {
  // Remove common prefixes/suffixes used by tokenized stock providers
  let symbol = tokenSymbol.toUpperCase();
  
  // Remove 'x' suffix (xStocks format: AAPLx, TSLAx)
  if (symbol.endsWith("X") && symbol.length > 1) {
    symbol = symbol.slice(0, -1);
  }
  
  // Remove 'b' prefix (Backed format: bAAPL, bTSLA)
  if (symbol.startsWith("B") && symbol.length > 1 && !symbol.startsWith("BRK")) {
    const withoutB = symbol.slice(1);
    // Only strip if it looks like a valid stock symbol
    if (/^[A-Z]{2,5}$/.test(withoutB)) {
      symbol = withoutB;
    }
  }
  
  return symbol;
}

async function fetchFinnhubCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<CandleData[] | null> {
  try {
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      console.error("Finnhub candle API error:", response.status);
      return null;
    }

    const data = await response.json();
    
    // Finnhub returns { s: "ok", c: [...], h: [...], l: [...], o: [...], t: [...], v: [...] }
    if (data.s !== "ok" || !data.c || !data.t) {
      console.log("No candle data available for", symbol);
      return null;
    }

    const candles: CandleData[] = data.t.map((timestamp: number, i: number) => ({
      timestamp: timestamp * 1000, // Convert to milliseconds
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));

    return candles;
  } catch (error) {
    console.error("Error fetching Finnhub candles:", error);
    return null;
  }
}

function generateSimulatedCandles(
  from: number,
  to: number,
  resolution: string
): CandleData[] {
  const candles: CandleData[] = [];
  
  // Determine interval in seconds based on resolution
  let intervalSeconds: number;
  switch (resolution) {
    case "1": intervalSeconds = 60; break;
    case "5": intervalSeconds = 5 * 60; break;
    case "15": intervalSeconds = 15 * 60; break;
    case "30": intervalSeconds = 30 * 60; break;
    case "60": intervalSeconds = 60 * 60; break;
    case "D": intervalSeconds = 24 * 60 * 60; break;
    case "W": intervalSeconds = 7 * 24 * 60 * 60; break;
    case "M": intervalSeconds = 30 * 24 * 60 * 60; break;
    default: intervalSeconds = 24 * 60 * 60;
  }

  // Generate realistic price movement
  let price = 100 + Math.random() * 200; // Start between $100-$300
  const volatility = 0.02; // 2% daily volatility
  
  for (let timestamp = from; timestamp <= to; timestamp += intervalSeconds) {
    const change = (Math.random() - 0.48) * volatility * price; // Slight upward bias
    const open = price;
    price = price + change;
    const close = price;
    
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 1000000) + 100000;

    candles.push({
      timestamp: timestamp * 1000,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return candles;
}

