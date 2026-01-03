import { NextResponse } from "next/server";

const MORALIS_API_KEY = process.env.MORALIS_API_KEY || "";
const MORALIS_SOLANA_API = "https://solana-gateway.moralis.io/token/mainnet";

interface TokenSwap {
  signature: string;
  blockTime: number;
  type: "buy" | "sell" | "transfer";
  tokenAmount: number;
  tokenSymbol: string;
  usdValue: number;
  walletAddress: string;
}

/**
 * Parse timestamp from various formats
 */
function parseTimestamp(value: any): number {
  if (!value) return Math.floor(Date.now() / 1000);
  
  // If it's already a reasonable Unix timestamp (seconds)
  if (typeof value === "number" && value > 1000000000 && value < 10000000000) {
    return value;
  }
  
  // If it's a millisecond timestamp
  if (typeof value === "number" && value > 10000000000) {
    return Math.floor(value / 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof value === "string") {
    // ISO date string
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) {
      return Math.floor(parsed / 1000);
    }
    // Numeric string
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      return num > 10000000000 ? Math.floor(num / 1000) : num;
    }
  }
  
  return Math.floor(Date.now() / 1000);
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
    console.error("[TokenTrades] MORALIS_API_KEY not configured");
    return NextResponse.json(
      { success: false, error: "Moralis API not configured" },
      { status: 503 }
    );
  }

  try {
    // Clean mint address
    const cleanMint = mint.startsWith("svm:") ? mint.slice(4) : mint;
    console.log("[TokenTrades] Fetching trades for:", cleanMint);

    // Try swaps endpoint first (Moralis uses pageSize, not limit)
    const swapsResponse = await fetch(
      `${MORALIS_SOLANA_API}/${cleanMint}/swaps?pageSize=${limit}`,
      {
        headers: {
          "X-API-Key": MORALIS_API_KEY,
          "Accept": "application/json",
        },
      }
    );

    if (swapsResponse.ok) {
      const swapsData = await swapsResponse.json();
      console.log("[TokenTrades] Swaps response sample:", JSON.stringify(swapsData).slice(0, 500));

      // Handle different response structures
      const swapsArray = swapsData.result || swapsData.swaps || (Array.isArray(swapsData) ? swapsData : []);

      if (swapsArray.length > 0) {
        // Log first swap to understand structure
        console.log("[TokenTrades] First swap keys:", Object.keys(swapsArray[0]));
        console.log("[TokenTrades] First swap data:", JSON.stringify(swapsArray[0]).slice(0, 300));

        const trades: TokenSwap[] = swapsArray.slice(0, limit).map((swap: any) => {
          // Determine if it's a buy or sell - Moralis uses "transactionType"
          const isBuy = swap.transactionType === "buy" 
            || swap.side === "buy"
            || swap.bought?.mint === cleanMint;
          
          // Get amount from bought/sold objects (Moralis format)
          let amount = 0;
          if (isBuy && swap.bought?.amount) {
            amount = parseFloat(swap.bought.amount);
          } else if (!isBuy && swap.sold?.amount) {
            amount = parseFloat(swap.sold.amount);
          } else {
            // Fallback to other field names
            amount = parseFloat(
              swap.tokenOutAmount 
              || swap.tokenInAmount 
              || swap.amount
              || swap.baseAmount
              || "0"
            );
          }

          // Get token symbol from bought/sold
          const tokenSymbol = isBuy 
            ? (swap.bought?.symbol || swap.tokenOutSymbol || "")
            : (swap.sold?.symbol || swap.tokenInSymbol || "");

          return {
            signature: swap.transactionHash || swap.signature || swap.txHash || swap.hash || "",
            blockTime: parseTimestamp(swap.blockTimestamp || swap.blockTime || swap.timestamp || swap.time),
            type: isBuy ? "buy" : "sell",
            tokenAmount: amount,
            tokenSymbol,
            usdValue: parseFloat(swap.totalValueUsd || swap.usdValue || swap.valueUsd || "0"),
            walletAddress: swap.walletAddress || swap.owner || swap.maker || swap.user || "",
          };
        });

        return NextResponse.json({
          success: true,
          trades,
          count: trades.length,
          source: "swaps",
        });
      }
    } else {
      console.log("[TokenTrades] Swaps endpoint returned:", swapsResponse.status);
    }

    // Fallback to transfers
    console.log("[TokenTrades] Trying transfers endpoint...");
    const transfersResponse = await fetch(
      `${MORALIS_SOLANA_API}/${cleanMint}/transfers?pageSize=${limit}`,
      {
        headers: {
          "X-API-Key": MORALIS_API_KEY,
          "Accept": "application/json",
        },
      }
    );

    if (transfersResponse.ok) {
      const transfersData = await transfersResponse.json();
      console.log("[TokenTrades] Transfers response sample:", JSON.stringify(transfersData).slice(0, 500));

      const transfersArray = transfersData.result || transfersData.transfers || (Array.isArray(transfersData) ? transfersData : []);

      if (transfersArray.length > 0) {
        console.log("[TokenTrades] First transfer keys:", Object.keys(transfersArray[0]));

        const trades: TokenSwap[] = transfersArray.slice(0, limit).map((transfer: any) => ({
          signature: transfer.signature || transfer.transactionHash || transfer.txHash || "",
          blockTime: parseTimestamp(transfer.blockTime || transfer.blockTimestamp || transfer.timestamp),
          type: "transfer" as const,
          tokenAmount: parseFloat(transfer.amount || transfer.value || "0"),
          tokenSymbol: transfer.symbol || "",
          usdValue: parseFloat(transfer.usdValue || "0"),
          walletAddress: transfer.toAddress || transfer.to || transfer.destination || "",
        }));

        return NextResponse.json({
          success: true,
          trades,
          count: trades.length,
          source: "transfers",
        });
      }
    }

    // No data found
    console.log("[TokenTrades] No trades or transfers found");
    return NextResponse.json({
      success: true,
      trades: [],
      count: 0,
      source: "none",
    });

  } catch (error) {
    console.error("[TokenTrades] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
