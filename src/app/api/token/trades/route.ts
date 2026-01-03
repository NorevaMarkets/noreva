import { NextResponse } from "next/server";

const MORALIS_API_KEY = process.env.MORALIS_API_KEY || "";
const MORALIS_SOLANA_API = "https://solana-gateway.moralis.io/token/mainnet";

interface TokenSwap {
  signature: string;
  blockTime: number;
  type: "buy" | "sell";
  tokenAmount: number;
  tokenSymbol: string;
  usdValue: number;
  walletAddress: string;
}

/**
 * GET /api/token/trades?mint=<mint_address>&limit=<number>
 * 
 * Fetches recent swaps/trades for a token from Moralis.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mint = searchParams.get("mint");
  const limit = parseInt(searchParams.get("limit") || "10");

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

    // Fetch token swaps from Moralis
    const swapsResponse = await fetch(
      `${MORALIS_SOLANA_API}/${cleanMint}/swaps?limit=${limit}`,
      {
        headers: {
          "X-API-Key": MORALIS_API_KEY,
          "Accept": "application/json",
        },
      }
    );

    if (!swapsResponse.ok) {
      // If swaps endpoint fails, try transfers as fallback
      console.log("[TokenTrades] Swaps endpoint failed, trying transfers...");
      
      const transfersResponse = await fetch(
        `${MORALIS_SOLANA_API}/${cleanMint}/transfers?limit=${limit}`,
        {
          headers: {
            "X-API-Key": MORALIS_API_KEY,
            "Accept": "application/json",
          },
        }
      );

      if (!transfersResponse.ok) {
        return NextResponse.json(
          { success: false, error: "Failed to fetch token trades" },
          { status: transfersResponse.status }
        );
      }

      const transfersData = await transfersResponse.json();
      
      // Transform transfers to trade-like format
      const trades = (transfersData.result || transfersData || []).slice(0, limit).map((transfer: any) => ({
        signature: transfer.signature || transfer.transactionHash || "",
        blockTime: transfer.blockTime || Math.floor(Date.now() / 1000),
        type: "transfer" as const,
        tokenAmount: parseFloat(transfer.amount) || 0,
        tokenSymbol: transfer.symbol || "",
        usdValue: 0, // Transfers don't have USD value
        walletAddress: transfer.toAddress || transfer.to || "",
        fromAddress: transfer.fromAddress || transfer.from || "",
      }));

      return NextResponse.json({
        success: true,
        trades,
        count: trades.length,
        source: "transfers",
      });
    }

    const swapsData = await swapsResponse.json();

    // Transform swaps to our format
    const trades: TokenSwap[] = (swapsData.result || swapsData || []).slice(0, limit).map((swap: any) => {
      // Determine if it's a buy or sell based on the swap direction
      const isBuy = swap.tokenOutMint === cleanMint || swap.bought?.mint === cleanMint;
      
      return {
        signature: swap.signature || swap.transactionHash || "",
        blockTime: swap.blockTime || swap.blockTimestamp || Math.floor(Date.now() / 1000),
        type: isBuy ? "buy" : "sell",
        tokenAmount: parseFloat(isBuy ? (swap.tokenOutAmount || swap.bought?.amount || 0) : (swap.tokenInAmount || swap.sold?.amount || 0)),
        tokenSymbol: swap.tokenOutSymbol || swap.tokenInSymbol || "",
        usdValue: parseFloat(swap.usdValue || swap.valueUsd || 0),
        walletAddress: swap.walletAddress || swap.owner || "",
      };
    });

    return NextResponse.json({
      success: true,
      trades,
      count: trades.length,
      source: "swaps",
    });
  } catch (error) {
    console.error("[TokenTrades] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

