"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockWithPrice } from "@/types";
import { siteConfig } from "@/config/site";

/**
 * Hook for fetching and refreshing stock prices
 * 
 * In a production app, this would:
 * 1. Fetch real prices from the API
 * 2. Set up polling for price updates
 * 3. Handle WebSocket connections for real-time updates
 */

interface UseStockPricesOptions {
  /** Initial stock data (can be mock data for SSR) */
  initialData: StockWithPrice[];
  /** Enable auto-refresh */
  autoRefresh?: boolean;
  /** Refresh interval in ms (default: 30s) */
  refreshInterval?: number;
}

interface UseStockPricesReturn {
  stocks: StockWithPrice[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useStockPrices({
  initialData,
  autoRefresh = true,
  refreshInterval = siteConfig.refreshIntervals.prices,
}: UseStockPricesOptions): UseStockPricesReturn {
  const [stocks, setStocks] = useState<StockWithPrice[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      // In production, this would fetch real data:
      // const prices = await fetchMultipleStockPrices(stocks.map(s => ({
      //   mintAddress: s.mintAddress,
      //   underlyingSymbol: s.underlying,
      // })));
      
      // For now, simulate price updates with small random changes
      const updatedStocks = stocks.map(stock => ({
        ...stock,
        price: {
          ...stock.price,
          tokenPrice: stock.price.tokenPrice * (1 + (Math.random() - 0.5) * 0.002),
          tradFiPrice: stock.price.tradFiPrice * (1 + (Math.random() - 0.5) * 0.001),
          lastUpdated: new Date(),
        },
      }));

      // Recalculate spreads
      updatedStocks.forEach(stock => {
        const spread = ((stock.price.tokenPrice - stock.price.tradFiPrice) / stock.price.tradFiPrice) * 100;
        stock.price.spread = Number(spread.toFixed(2));
        stock.price.spreadDirection = 
          Math.abs(spread) < 0.05 ? "parity" : 
          spread > 0 ? "premium" : "discount";
      });

      setStocks(updatedStocks);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to refresh prices"));
    } finally {
      setIsRefreshing(false);
    }
  }, [stocks]);

  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    stocks,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  };
}

/**
 * Hook for a single stock's price
 */
export function useStockPrice(stock: StockWithPrice | null) {
  const [price, setPrice] = useState(stock?.price || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (stock) {
      setPrice(stock.price);
    }
  }, [stock]);

  return {
    price,
    isLoading,
  };
}

