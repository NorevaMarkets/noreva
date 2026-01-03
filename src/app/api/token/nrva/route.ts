import { NextResponse } from "next/server";

/**
 * GET /api/token/nrva
 * 
 * Fetches $NRVA token data primarily from Helius API
 * Uses Jupiter Price API for real-time pricing
 * Token mint address stored in NEXT_PUBLIC_NRVA_TOKEN_MINT env variable
 */

interface TokenData {
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  supply: number;
  holders?: number;
  txns24h: {
    buys: number;
    sells: number;
  };
  mintAddress: string;
  decimals: number;
}

// Extract Helius API key from RPC URL or env variable
function getHeliusKey(): string | null {
  const heliusRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || process.env.SOLANA_RPC_ENDPOINT || "";
  const heliusKeyMatch = heliusRpc.match(/api-key=([^&]+)/);
  return heliusKeyMatch ? heliusKeyMatch[1] : process.env.HELIUS_API_KEY || null;
}

export async function GET() {
  const mintAddress = process.env.NEXT_PUBLIC_NRVA_TOKEN_MINT;

  if (!mintAddress) {
    return NextResponse.json(
      { 
        success: false, 
        error: "NRVA token mint address not configured",
        message: "Set NEXT_PUBLIC_NRVA_TOKEN_MINT in environment variables"
      },
      { status: 503 }
    );
  }

  const heliusKey = getHeliusKey();
  
  if (!heliusKey) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Helius API key not configured",
        message: "Set NEXT_PUBLIC_SOLANA_RPC_ENDPOINT or HELIUS_API_KEY"
      },
      { status: 503 }
    );
  }

  try {
    // Initialize token data with defaults
    const tokenData: TokenData = {
      name: "Noreva",
      symbol: "NRVA",
      price: 0,
      priceChange24h: 0,
      volume24h: 0,
      marketCap: 0,
      liquidity: 0,
      supply: 0,
      holders: 0,
      txns24h: { buys: 0, sells: 0 },
      mintAddress,
      decimals: 9,
    };

    // 1. Fetch token metadata from Helius (getAsset DAS API)
    try {
      const metadataResponse = await fetch(
        `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "metadata",
            method: "getAsset",
            params: { id: mintAddress },
          }),
        }
      );

      if (metadataResponse.ok) {
        const metadataData = await metadataResponse.json();
        if (metadataData.result) {
          const asset = metadataData.result;
          tokenData.name = asset.content?.metadata?.name || asset.content?.metadata?.symbol || "Noreva";
          tokenData.symbol = asset.content?.metadata?.symbol || "NRVA";
          
          // Get supply info
          if (asset.token_info) {
            tokenData.decimals = asset.token_info.decimals || 9;
            tokenData.supply = (asset.token_info.supply || 0) / Math.pow(10, tokenData.decimals);
          }
        }
      }
    } catch (e) {
      console.log("[NRVA] Helius getAsset failed:", e);
    }

    // 2. Fetch holder count from Helius (getTokenAccounts)
    try {
      const holdersResponse = await fetch(
        `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "holders",
            method: "getTokenAccounts",
            params: {
              mint: mintAddress,
              page: 1,
              limit: 1000,
            },
          }),
        }
      );

      if (holdersResponse.ok) {
        const holdersData = await holdersResponse.json();
        if (holdersData.result?.total !== undefined) {
          tokenData.holders = holdersData.result.total;
        } else if (holdersData.result?.token_accounts?.length) {
          tokenData.holders = holdersData.result.token_accounts.length;
        } else if (Array.isArray(holdersData.result) && holdersData.result.length > 0) {
          tokenData.holders = holdersData.result.length;
        }
      }
    } catch (e) {
      console.log("[NRVA] Helius getTokenAccounts failed:", e);
    }

    // 3. Fetch price from Jupiter Price API (free, no rate limits)
    try {
      const priceResponse = await fetch(
        `https://api.jup.ag/price/v2?ids=${mintAddress}`,
        {
          headers: { "Accept": "application/json" },
          next: { revalidate: 10 }, // Cache for 10 seconds
        }
      );

      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        if (priceData.data?.[mintAddress]) {
          const tokenPrice = priceData.data[mintAddress];
          tokenData.price = parseFloat(tokenPrice.price || "0");
          
          // Calculate market cap from supply * price
          if (tokenData.supply > 0 && tokenData.price > 0) {
            tokenData.marketCap = tokenData.supply * tokenData.price;
          }
        }
      }
    } catch (e) {
      console.log("[NRVA] Jupiter price fetch failed:", e);
    }

    // 4. Fetch volume, txns, price (if needed), and liquidity from DexScreener
    try {
      const dexStatsResponse = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
        {
          headers: { "Accept": "application/json" },
          next: { revalidate: 30 },
        }
      );

      if (dexStatsResponse.ok) {
        const dexStatsData = await dexStatsResponse.json();
        const pairs = dexStatsData.pairs || [];
        
        if (pairs.length > 0) {
          // Get main pair (highest liquidity) for price
          const mainPair = pairs.reduce((best: any, pair: any) => {
            const liquidity = parseFloat(pair.liquidity?.usd || "0");
            const bestLiquidity = parseFloat(best?.liquidity?.usd || "0");
            return liquidity > bestLiquidity ? pair : best;
          }, pairs[0]);

          // Aggregate stats from all pairs
          let totalBuys = 0;
          let totalSells = 0;
          let totalVolume = 0;
          let totalLiquidity = 0;

          pairs.forEach((pair: any) => {
            totalBuys += pair.txns?.h24?.buys || 0;
            totalSells += pair.txns?.h24?.sells || 0;
            totalVolume += parseFloat(pair.volume?.h24 || "0");
            totalLiquidity += parseFloat(pair.liquidity?.usd || "0");
          });

          tokenData.txns24h = { buys: totalBuys, sells: totalSells };
          tokenData.volume24h = totalVolume;
          tokenData.liquidity = totalLiquidity;
          
          // Get price from DexScreener if Jupiter didn't have it
          if (tokenData.price === 0) {
            tokenData.price = parseFloat(mainPair.priceUsd || "0");
          }
          
          // Get price change
          if (tokenData.priceChange24h === 0) {
            tokenData.priceChange24h = parseFloat(mainPair.priceChange?.h24 || "0");
          }
          
          // Calculate market cap from supply * price
          if (tokenData.supply > 0 && tokenData.price > 0) {
            tokenData.marketCap = tokenData.supply * tokenData.price;
          } else if (tokenData.marketCap === 0) {
            tokenData.marketCap = parseFloat(mainPair.marketCap || mainPair.fdv || "0");
          }
        }
      }
    } catch (e) {
      console.log("[NRVA] DexScreener stats fetch failed:", e);
    }

    // 5. If we still don't have volume/liquidity, try Birdeye as fallback (if key available)
    const birdeyeKey = process.env.BIRDEYE_API_KEY;
    if (birdeyeKey && (tokenData.volume24h === 0 || tokenData.liquidity === 0)) {
      try {
        const birdeyeResponse = await fetch(
          `https://public-api.birdeye.so/defi/token_overview?address=${mintAddress}`,
          {
            headers: {
              "X-API-KEY": birdeyeKey,
              "Accept": "application/json",
            },
          }
        );

        if (birdeyeResponse.ok) {
          const birdeyeData = await birdeyeResponse.json();
          if (birdeyeData.success && birdeyeData.data) {
            if (tokenData.volume24h === 0) {
              tokenData.volume24h = birdeyeData.data.v24hUSD || 0;
            }
            if (tokenData.liquidity === 0) {
              tokenData.liquidity = birdeyeData.data.liquidity || 0;
            }
            if (tokenData.priceChange24h === 0) {
              tokenData.priceChange24h = birdeyeData.data.priceChange24hPercent || 0;
            }
          }
        }
      } catch (e) {
        console.log("[NRVA] Birdeye fallback failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      data: tokenData,
      source: "helius",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("[NRVA] Error fetching token data:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
