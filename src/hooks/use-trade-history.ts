"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Trade, TradeDisplay } from "@/types/trade";
import { toTradeDisplay } from "@/types/trade";
import { useWalletAuth } from "./use-wallet-auth";

interface UseTradeHistoryOptions {
  symbol?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseTradeHistoryReturn {
  trades: TradeDisplay[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
  recordTrade: (trade: {
    type: "buy" | "sell";
    symbol: string;
    stockName?: string;
    tokenAmount: number;
    usdcAmount: number;
    pricePerToken: number;
    txSignature?: string;
  }) => Promise<Trade | null>;
  updateTrade: (id: string, updates: { status?: string; txSignature?: string }) => Promise<boolean>;
}

/**
 * Hook to manage trade history
 */
export function useTradeHistory(options: UseTradeHistoryOptions = {}): UseTradeHistoryReturn {
  const { symbol, limit = 50, autoFetch = true } = options;
  const { publicKey, connected } = useWallet();
  const { isAuthenticated, authenticate, getAuthHeaders } = useWalletAuth();
  const [trades, setTrades] = useState<TradeDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = publicKey?.toBase58() || null;

  // Fetch trade history
  const fetchTrades = useCallback(async () => {
    if (!walletAddress || !isAuthenticated) {
      setTrades([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (symbol) params.set("symbol", symbol);
      params.set("limit", limit.toString());

      const response = await fetch(`/api/trades?${params}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setTrades((data.data as Trade[]).map(toTradeDisplay));
      } else {
        setError(data.error || "Failed to fetch trades");
      }
    } catch (err) {
      console.error("useTradeHistory fetch error:", err);
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, isAuthenticated, symbol, limit, getAuthHeaders]);

  // Record a new trade
  const recordTrade = useCallback(
    async (trade: {
      type: "buy" | "sell";
      symbol: string;
      stockName?: string;
      tokenAmount: number;
      usdcAmount: number;
      pricePerToken: number;
      txSignature?: string;
    }): Promise<Trade | null> => {
      if (!walletAddress) {
        setError("Wallet not connected");
        return null;
      }

      // Auto-authenticate if needed
      if (!isAuthenticated) {
        const success = await authenticate();
        if (!success) {
          setError("Authentication required");
          return null;
        }
      }

      try {
        const response = await fetch("/api/trades", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(trade),
        });

        const data = await response.json();

        if (data.success) {
          // Add to local state
          setTrades((prev) => [toTradeDisplay(data.data), ...prev]);
          return data.data;
        } else {
          setError(data.error || "Failed to record trade");
          return null;
        }
      } catch (err) {
        console.error("useTradeHistory record error:", err);
        setError("Failed to connect to server");
        return null;
      }
    },
    [walletAddress, isAuthenticated, authenticate, getAuthHeaders]
  );

  // Update a trade (e.g., confirm status)
  const updateTrade = useCallback(
    async (id: string, updates: { status?: string; txSignature?: string }): Promise<boolean> => {
      if (!walletAddress || !isAuthenticated) {
        setError("Authentication required");
        return false;
      }

      try {
        const response = await fetch(`/api/trades/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (data.success) {
          // Update local state
          setTrades((prev) =>
            prev.map((t) =>
              t.id === id ? toTradeDisplay(data.data) : t
            )
          );
          return true;
        } else {
          setError(data.error || "Failed to update trade");
          return false;
        }
      } catch (err) {
        console.error("useTradeHistory update error:", err);
        setError("Failed to connect to server");
        return false;
      }
    },
    [walletAddress, isAuthenticated, getAuthHeaders]
  );

  // Auto-fetch on mount and when wallet connects and authenticates
  useEffect(() => {
    if (autoFetch && connected && walletAddress && isAuthenticated) {
      fetchTrades();
    } else if (!connected) {
      setTrades([]);
      setError(null);
    }
  }, [autoFetch, connected, walletAddress, isAuthenticated, fetchTrades]);

  return {
    trades,
    isLoading,
    error,
    isAuthenticated,
    refetch: fetchTrades,
    recordTrade,
    updateTrade,
  };
}

