"use client";

import { useState, useEffect, useCallback } from "react";

interface TokenStats {
  mint: string;
  holders: number;
  totalSupply: string;
  decimals: number;
  name?: string;
  symbol?: string;
}

interface UseTokenStatsResult {
  stats: TokenStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch token statistics (holder count, supply, etc.)
 */
export function useTokenStats(mintAddress: string | undefined): UseTokenStatsResult {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!mintAddress) {
      setStats(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/token/stats?mint=${encodeURIComponent(mintAddress)}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch token stats");
      }

      setStats({
        ...data.data,
        name: data.name,
        symbol: data.symbol,
      });
    } catch (err) {
      console.error("Failed to fetch token stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [mintAddress]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

