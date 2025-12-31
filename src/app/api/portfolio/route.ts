import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

// Helius RPC from environment variable (secure)
const HELIUS_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || process.env.SOLANA_RPC_ENDPOINT || "";

// Clean mint address - remove "svm:" prefix
function cleanMintAddress(mintAddress: string): string {
  return mintAddress.startsWith("svm:") ? mintAddress.slice(4) : mintAddress;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("wallet");

  if (!walletAddress) {
    return NextResponse.json({ success: false, error: "Missing wallet address" }, { status: 400 });
  }

  try {
    const publicKey = new PublicKey(walletAddress);
    const connection = new Connection(HELIUS_RPC, "confirmed");

    // Build the base URL for internal API calls
    const { origin } = new URL(request.url);
    
    // Fetch all available stocks
    const stocksResponse = await fetch(`${origin}/api/stocks`);
    const stocksData = await stocksResponse.json();

    if (!stocksData.success || !stocksData.data) {
      return NextResponse.json({ success: false, error: "Failed to fetch stock data" }, { status: 500 });
    }

    // Get stocks with valid Solana mint addresses
    const solanaStocks = stocksData.data.filter((stock: any) => {
      const mint = cleanMintAddress(stock.mintAddress || "");
      return mint && mint !== "N/A" && stock.hasSolana;
    });

    // Query token balances - process sequentially to avoid rate limits
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

    return NextResponse.json({
      success: true,
      holdings,
      totalValue,
      count: holdings.length,
    });
  } catch (error) {
    console.error("Portfolio API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

