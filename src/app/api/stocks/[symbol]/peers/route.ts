import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

interface PeerData {
  peers: string[];
  count: number;
}

/**
 * Fetch peer companies from Finnhub
 */
async function fetchPeers(symbol: string): Promise<string[]> {
  if (!FINNHUB_API_KEY) return [];

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) return [];
    const data = await response.json();
    
    // Filter out the original symbol and limit to 10 peers
    return Array.isArray(data) 
      ? data.filter((p: string) => p !== symbol).slice(0, 10) 
      : [];
  } catch {
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  try {
    const peers = await fetchPeers(upperSymbol);

    const result: PeerData = {
      peers,
      count: peers.length,
    };

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching peers:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch peer companies",
      data: { peers: [], count: 0 },
    });
  }
}

