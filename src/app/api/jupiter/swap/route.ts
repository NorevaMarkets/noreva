import { NextResponse } from "next/server";

// Jupiter APIs
const JUPITER_API_V1 = "https://api.jup.ag/swap/v1";
const JUPITER_API_LEGACY = "https://quote-api.jup.ag/v6";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quote, userPublicKey } = body;

    if (!quote || !userPublicKey) {
      return NextResponse.json(
        { error: "Missing quote or userPublicKey" },
        { status: 400 }
      );
    }

    // Get API key from environment (optional)
    const apiKey = process.env.JUPITER_API_KEY;
    const useNewApi = !!apiKey;
    const baseUrl = useNewApi ? JUPITER_API_V1 : JUPITER_API_LEGACY;

    // Build headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    // Build swap body based on API version
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

    // Get swap transaction from Jupiter
    const response = await fetch(`${baseUrl}/swap`, {
      method: "POST",
      headers,
      body: JSON.stringify(swapBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Jupiter swap error:", errorText);
      return NextResponse.json(
        { error: "Failed to create swap transaction", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      swapTransaction: data.swapTransaction,
      lastValidBlockHeight: data.lastValidBlockHeight,
      prioritizationFeeLamports: data.prioritizationFeeLamports,
      apiUsed: useNewApi ? "v1" : "legacy",
    });
  } catch (error) {
    console.error("Swap API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
