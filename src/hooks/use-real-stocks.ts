"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockWithPrice } from "@/types";

interface UseRealStocksOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface ApiError {
  error: string;
  instructions?: {
    twelveData?: string;
    finnhub?: string;
  };
  missingKeys?: string[];
}

interface ApiStats {
  totalTokensAvailable?: number;
  tradableTokens?: number;
  tokensWithPrices?: number;
  tokensWithTradFiData?: number;
  tokensOnSolana?: number;
}

interface UseRealStocksReturn {
  stocks: StockWithPrice[];
  isLoading: boolean;
  isError: boolean;
  errorDetails: ApiError | null;
  lastUpdated: Date | null;
  source: string | null;
  sources: { tokenPrices: string; stockPrices: string; tokenList?: string } | null;
  hasRealTokenPrices: boolean;
  stats: ApiStats | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch real stock prices
 * Requires API key configuration - no fallback to mock data
 */
export function useRealStocks(options: UseRealStocksOptions = {}): UseRealStocksReturn {
  const { refreshInterval = 30000, enabled = true } = options;
  
  const [stocks, setStocks] = useState<StockWithPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<ApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [sources, setSources] = useState<{ tokenPrices: string; stockPrices: string; tokenList?: string } | null>(null);
  const [hasRealTokenPrices, setHasRealTokenPrices] = useState(false);
  const [stats, setStats] = useState<ApiStats | null>(null);

  const fetchStocks = useCallback(async () => {
    if (!enabled) return;
    
    try {
      const response = await fetch("/api/stocks");
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        // Transform API data to match StockWithPrice type
        const transformedStocks: StockWithPrice[] = result.data.map((stock: any) => ({
          ...stock,
          price: {
            ...stock.price,
            lastUpdated: new Date(stock.price.lastUpdated),
          },
        }));
        
        setStocks(transformedStocks);
        setLastUpdated(new Date(result.timestamp));
        setSource(result.sources?.stockPrices || result.source);
        setSources(result.sources || null);
        setHasRealTokenPrices(result.sources?.tokenPrices === "backed_finance");
        setStats(result.stats || null);
        setIsError(false);
        setErrorDetails(null);
      } else {
        // API returned error
        setIsError(true);
        setErrorDetails({
          error: result.error || "Failed to fetch stock data",
          instructions: result.instructions,
          missingKeys: result.missingKeys,
        });
        setStocks([]);
      }
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
      setIsError(true);
      setErrorDetails({
        error: "Network error - could not connect to API",
      });
      setStocks([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Initial fetch
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Auto-refresh (only if not in error state)
  useEffect(() => {
    if (!enabled || refreshInterval <= 0 || isError) return;

    const interval = setInterval(fetchStocks, refreshInterval);
    return () => clearInterval(interval);
  }, [enabled, refreshInterval, fetchStocks, isError]);

  return {
    stocks,
    isLoading,
    isError,
    errorDetails,
    lastUpdated,
    source,
    sources,
    hasRealTokenPrices,
    stats,
    refresh: fetchStocks,
  };
}
