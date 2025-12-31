import { NextResponse } from "next/server";

// Jupiter APIs
// New API (requires API key): https://api.jup.ag/swap/v1
// Legacy API (free, deprecated Jan 2026): https://quote-api.jup.ag/v6
const JUPITER_API_V1 = "https://api.jup.ag/swap/v1";
const JUPITER_API_LEGACY = "https://quote-api.jup.ag/v6";

// Clean mint address - remove "svm:" prefix
function cleanMintAddress(mintAddress: string): string {
  return mintAddress.startsWith("svm:") ? mintAddress.slice(4) : mintAddress;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const inputMint = searchParams.get("inputMint");
  const outputMint = searchParams.get("outputMint");
  const amount = searchParams.get("amount");
  const slippageBps = searchParams.get("slippageBps") || "50";
  const userPublicKey = searchParams.get("userPublicKey");

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json(
      { error: "Missing required parameters", available: false },
      { status: 400 }
    );
  }

  // Clean mint addresses
  const cleanInput = cleanMintAddress(inputMint);
  const cleanOutput = cleanMintAddress(outputMint);

  // Get API key from environment (optional)
  const apiKey = process.env.JUPITER_API_KEY;

  // Determine which API to use
  const useNewApi = !!apiKey;
  const baseUrl = useNewApi ? JUPITER_API_V1 : JUPITER_API_LEGACY;

  // Build headers
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const quoteUrl = 
    `${baseUrl}/quote?` +
    `inputMint=${cleanInput}` +
    `&outputMint=${cleanOutput}` +
    `&amount=${amount}` +
    `&slippageBps=${slippageBps}`;

  try {
    console.log(`Fetching Jupiter quote from: ${baseUrl} (${useNewApi ? "v1 with API key" : "legacy"})`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const quoteResponse = await fetch(quoteUrl, {
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text();
      console.error("Jupiter quote error:", quoteResponse.status, errorText);
      
      return NextResponse.json(
        { 
          error: "No route found", 
          details: errorText,
          available: false,
          apiUsed: useNewApi ? "v1" : "legacy",
        },
        { status: quoteResponse.status }
      );
    }

    const quote = await quoteResponse.json();

    // If we have a userPublicKey, also get the swap transaction
    let swapTransaction = null;
    let lastValidBlockHeight = null;
    
    if (userPublicKey && quote) {
      try {
        const swapBody = useNewApi 
          ? {
              userPublicKey,
              quoteResponse: quote,
              wrapAndUnwrapSol: true,
              dynamicComputeUnitLimit: true,
              prioritizationFeeLamports: {
                priorityLevelWithMaxLamports: {
                  priorityLevel: "medium",
                  maxLamports: 1000000,
                  global: false,
                },
              },
            }
          : {
              userPublicKey,
              quoteResponse: quote,
              wrapAndUnwrapSol: true,
              dynamicComputeUnitLimit: true,
              prioritizationFeeLamports: "auto",
            };

        const swapResponse = await fetch(`${baseUrl}/swap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "x-api-key": apiKey } : {}),
          },
          body: JSON.stringify(swapBody),
        });

        if (swapResponse.ok) {
          const swapData = await swapResponse.json();
          swapTransaction = swapData.swapTransaction;
          lastValidBlockHeight = swapData.lastValidBlockHeight;
        } else {
          const swapError = await swapResponse.text();
          console.error("Swap transaction error:", swapError);
        }
      } catch (swapError) {
        console.error("Failed to get swap transaction:", swapError);
      }
    }

    // Extract route labels
    const routes = quote.routePlan?.map((r: any) => r.swapInfo?.label).filter(Boolean) || [];

    return NextResponse.json({
      available: true,
      // Return the FULL quote object for swap requests
      quoteResponse: quote,
      // Also return simplified fields for UI display
      inputMint: quote.inputMint,
      outputMint: quote.outputMint,
      inAmount: quote.inAmount,
      outAmount: quote.outAmount,
      priceImpactPct: parseFloat(quote.priceImpactPct || "0"),
      routePlan: quote.routePlan,
      routes: [...new Set(routes)],
      swapTransaction,
      lastValidBlockHeight,
      apiUsed: useNewApi ? "v1" : "legacy",
    });
  } catch (error: any) {
    console.error("Jupiter API error:", error?.message || error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch Jupiter quote",
        available: false,
        details: error?.message || "Network error - Jupiter API unreachable",
        apiUsed: useNewApi ? "v1" : "legacy",
      },
      { status: 500 }
    );
  }
}
