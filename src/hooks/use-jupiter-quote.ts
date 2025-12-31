"use client";

import { useState, useEffect, useCallback } from "react";

export interface SwapQuote {
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  routes: string[];
  effectivePrice: number;
}

interface UseJupiterQuoteOptions {
  mintAddress: string | null; // Solana token mint address
  tokenPrice: number;
  refreshInterval?: number;
}

interface UseJupiterQuoteReturn {
  quotes: SwapQuote[];
  bestRoute: string | null;
  isLoading: boolean;
  isAvailable: boolean; // True if we have real Jupiter data
  error: string | null;
  lastUpdated: Date | null;
}

export function useJupiterQuote({
  mintAddress,
  tokenPrice,
  refreshInterval = 30000,
}: UseJupiterQuoteOptions): UseJupiterQuoteReturn {
  const [quotes, setQuotes] = useState<SwapQuote[]>([]);
  const [bestRoute, setBestRoute] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQuotes = useCallback(async () => {
    // No mint address = no Jupiter data possible
    if (!mintAddress || mintAddress === "N/A") {
      setIsLoading(false);
      setIsAvailable(false);
      setError("Token not deployed on Solana");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Test amounts in USDC (different trade sizes)
      const testAmounts = [100, 500, 1000, 5000, 10000]; // USD values
      const fetchedQuotes: SwapQuote[] = [];
      let foundRoute: string | null = null;

      for (const usdAmount of testAmounts) {
        try {
          // Convert USD to USDC amount (6 decimals)
          const inputAmount = Math.floor(usdAmount * 1_000_000);
          
          // Use our API route instead of calling Jupiter directly
          const response = await fetch(
            `/api/jupiter?mint=${encodeURIComponent(mintAddress)}&amount=${inputAmount}`
          );

          const data = await response.json();

          if (data.available && data.outAmount) {
            // Get token decimals (assume 8 for Backed tokens)
            const outputDecimals = 8;
            const outputAmount = parseFloat(data.outAmount) / Math.pow(10, outputDecimals);
            const priceImpact = (data.priceImpactPct || 0) * 100;
            const routes = data.routes || [];
            const effectivePrice = usdAmount / outputAmount;

            fetchedQuotes.push({
              inputAmount: usdAmount,
              outputAmount,
              priceImpact,
              routes,
              effectivePrice,
            });

            // Save first route found
            if (!foundRoute && routes.length > 0) {
              foundRoute = routes[0];
            }
          }
        } catch (err) {
          // Skip individual quote errors
          console.warn(`Quote error for $${usdAmount}:`, err);
        }
      }

      if (fetchedQuotes.length > 0) {
        setQuotes(fetchedQuotes);
        setBestRoute(foundRoute);
        setIsAvailable(true);
        setLastUpdated(new Date());
      } else {
        setQuotes([]);
        setBestRoute(null);
        setIsAvailable(false);
        setError("No liquidity found on Jupiter");
      }
    } catch (err) {
      console.error("Jupiter API error:", err);
      setError("Failed to fetch Jupiter quotes");
      setIsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, [mintAddress]);

  useEffect(() => {
    fetchQuotes();
    
    // Only set up interval if we have a valid mint address
    if (mintAddress && mintAddress !== "N/A") {
      const interval = setInterval(fetchQuotes, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchQuotes, refreshInterval, mintAddress]);

  return {
    quotes,
    bestRoute,
    isLoading,
    isAvailable,
    error,
    lastUpdated,
  };
}
