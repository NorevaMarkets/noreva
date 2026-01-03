"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

// Custom event name for auth state changes (must match use-wallet-auth.ts)
const AUTH_STATE_CHANGED_EVENT = "noreva_auth_state_changed";

interface StockHolding {
  symbol: string;
  underlying: string;
  name: string;
  mintAddress: string;
  balance: number;
  tokenPrice: number;
  stockPrice: number;
  spread: number;
  valueUsd: number;
  provider: string;
}

interface PortfolioData {
  holdings: StockHolding[];
  totalValue: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolioHoldings(): PortfolioData {
  const { publicKey, connected } = useWallet();
  
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldings = useCallback(async () => {
    if (!publicKey || !connected) {
      setHoldings([]);
      setTotalValue(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use server-side API to fetch portfolio (avoids CORS and rate limit issues)
      const response = await fetch(`/api/portfolio?wallet=${publicKey.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch portfolio");
      }

      setHoldings(data.holdings || []);
      setTotalValue(data.totalValue || 0);
    } catch (err) {
      console.error("Failed to fetch portfolio holdings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch holdings");
      setHoldings([]);
      setTotalValue(0);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected]);

  useEffect(() => {
    fetchHoldings();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchHoldings, 60000);
    return () => clearInterval(interval);
  }, [fetchHoldings]);

  // Listen for auth state changes and refetch
  useEffect(() => {
    const handleAuthChange = () => {
      console.log("[Portfolio] Auth state changed, refetching holdings...");
      fetchHoldings();
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthChange);
    };
  }, [fetchHoldings]);

  return {
    holdings,
    totalValue,
    isLoading,
    error,
    refetch: fetchHoldings,
  };
}
