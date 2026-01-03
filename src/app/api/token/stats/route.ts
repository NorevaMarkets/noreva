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
    console.error("[TokenStats] MORALIS_API_KEY not configured");
    return NextResponse.json(
      { success: false, error: "Moralis API not configured" },
      { status: 503 }
    );
  }

  try {
    // Clean mint address
    const cleanMint = mint.startsWith("svm:") ? mint.slice(4) : mint;
    console.log("[TokenStats] Fetching stats for:", cleanMint);

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

    let metadata: any = {};
    if (metadataResponse.ok) {
      metadata = await metadataResponse.json();
      console.log("[TokenStats] Metadata response:", JSON.stringify(metadata).slice(0, 200));
    } else {
      console.error("[TokenStats] Metadata fetch failed:", metadataResponse.status, await metadataResponse.text());
    }

    // Try to get holder count - Moralis might return this in different ways
    let holderCount = 0;

    // Method 1: Try /owners endpoint
    try {
      const holdersResponse = await fetch(
        `${MORALIS_SOLANA_API}/${cleanMint}/owners?limit=1`,
        {
          headers: {
            "X-API-Key": MORALIS_API_KEY,
            "Accept": "application/json",
          },
        }
      );

      if (holdersResponse.ok) {
        const holdersData = await holdersResponse.json();
        console.log("[TokenStats] Holders response:", JSON.stringify(holdersData).slice(0, 300));
        
        // Try different possible field names
        holderCount = holdersData.total 
          || holdersData.totalOwners 
          || holdersData.count
          || (Array.isArray(holdersData) ? holdersData.length : 0)
          || (holdersData.result?.length || 0);
      } else {
        console.log("[TokenStats] Owners endpoint returned:", holdersResponse.status);
      }
    } catch (e) {
      console.log("[TokenStats] Owners fetch error:", e);
    }

    // Method 2: If owners didn't work, try to get from metadata or price endpoint
    if (holderCount === 0 && metadata.holders) {
      holderCount = metadata.holders;
    }

    const stats: TokenStats = {
      mint: cleanMint,
      holders: holderCount,
      totalSupply: metadata.supply || metadata.totalSupply || "0",
      decimals: parseInt(metadata.decimals) || 9,
    };

    console.log("[TokenStats] Final stats:", stats);

    return NextResponse.json({
      success: true,
      data: stats,
      name: metadata.name || null,
      symbol: metadata.symbol || null,
      // Include raw data for debugging
      _debug: {
        hasMetadata: !!metadata,
        metadataKeys: Object.keys(metadata || {}),
      }
    });
  } catch (error) {
    console.error("[TokenStats] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
