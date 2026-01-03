"use client";

import { useState, useEffect, useCallback } from "react";

export interface NrvaTokenData {
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  supply: number;
  holders?: number;
  decimals: number;
  txns24h: {
    buys: number;
    sells: number;
  };
  mintAddress: string;
}

interface UseNrvaTokenOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in ms
}

interface UseNrvaTokenReturn {
  data: NrvaTokenData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNrvaToken(options: UseNrvaTokenOptions = {}): UseNrvaTokenReturn {
  const { autoRefresh = true, refreshInterval = 30000 } = options;

  const [data, setData] = useState<NrvaTokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/token/nrva");
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || result.message || "Failed to fetch token data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

