"use client";

import { useState, useEffect, useCallback } from "react";

export interface TokenTrade {
  signature: string;
  blockTime: number;
  type: "buy" | "sell" | "transfer";
  tokenAmount: number;
  tokenSymbol: string;
  usdValue: number;
  walletAddress: string;
  fromAddress?: string;
}

interface UseTokenTradesResult {
  trades: TokenTrade[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseTokenTradesOptions {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Hook to fetch recent trades/swaps for a token
 */
export function useTokenTrades(
  mintAddress: string | undefined,
  options: UseTokenTradesOptions = {}
): UseTokenTradesResult {
  const { limit = 10, autoRefresh = false, refreshInterval = 30000 } = options;

  const [trades, setTrades] = useState<TokenTrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    if (!mintAddress) {
      setTrades([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/token/trades?mint=${encodeURIComponent(mintAddress)}&limit=${limit}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch trades");
      }

      setTrades(data.trades || []);
    } catch (err) {
      console.error("Failed to fetch token trades:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch trades");
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  }, [mintAddress, limit]);

  useEffect(() => {
    fetchTrades();

    // Auto-refresh if enabled
    if (autoRefresh && mintAddress) {
      const interval = setInterval(fetchTrades, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTrades, autoRefresh, refreshInterval, mintAddress]);

  return {
    trades,
    isLoading,
    error,
    refetch: fetchTrades,
  };
}

