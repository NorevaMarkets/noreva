import { NextResponse } from "next/server";

const MORALIS_API_KEY = process.env.MORALIS_API_KEY || "";
const MORALIS_SOLANA_API = "https://solana-gateway.moralis.io/token/mainnet";

interface TokenStats {
  mint: string;
  holders: number;
  totalSupply: string;
  decimals: number;
}

/**
 * GET /api/token/stats?mint=<mint_address>
 * 
 * Fetches token statistics from Moralis including holder count.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mint = searchParams.get("mint");

  if (!mint) {
    return NextResponse.json(
      { success: false, error: "Missing mint address" },
      { status: 400 }
    );
  }

  if (!MORALIS_API_KEY) {
    return NextResponse.json(
      { success: false, error: "Moralis API not configured" },
      { status: 503 }
    );
  }

  try {
    // Clean mint address
    const cleanMint = mint.startsWith("svm:") ? mint.slice(4) : mint;

    // Fetch token metadata from Moralis
    const metadataResponse = await fetch(
      `${MORALIS_SOLANA_API}/${cleanMint}/metadata`,
      {
        headers: {
          "X-API-Key": MORALIS_API_KEY,
          "Accept": "application/json",
        },
      }
    );

    if (!metadataResponse.ok) {
      console.error("[TokenStats] Metadata fetch failed:", metadataResponse.status);
      return NextResponse.json(
        { success: false, error: "Failed to fetch token metadata" },
        { status: metadataResponse.status }
      );
    }

    const metadata = await metadataResponse.json();

    // Fetch holder count from Moralis
    // Note: Moralis provides this via the /owners endpoint with pagination
    const holdersResponse = await fetch(
      `${MORALIS_SOLANA_API}/${cleanMint}/owners?limit=1`,
      {
        headers: {
          "X-API-Key": MORALIS_API_KEY,
          "Accept": "application/json",
        },
      }
    );

    let holderCount = 0;
    if (holdersResponse.ok) {
      const holdersData = await holdersResponse.json();
      // Moralis returns total count in the response
      holderCount = holdersData.total || holdersData.length || 0;
    }

    const stats: TokenStats = {
      mint: cleanMint,
      holders: holderCount,
      totalSupply: metadata.supply || "0",
      decimals: parseInt(metadata.decimals) || 9,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      name: metadata.name || null,
      symbol: metadata.symbol || null,
    });
  } catch (error) {
    console.error("[TokenStats] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

