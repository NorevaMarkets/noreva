import { useState, useEffect, useCallback } from "react";

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface UseCandleDataOptions {
  symbol: string;
  resolution?: string;
  from?: number;
  to?: number;
  refreshInterval?: number;
}

interface UseCandleDataReturn {
  candles: CandleData[];
  isLoading: boolean;
  isError: boolean;
  source: string | null;
  refresh: () => Promise<void>;
}

export function useCandleData({
  symbol,
  resolution = "D",
  from,
  to,
  refreshInterval = 60000, // 1 minute default
}: UseCandleDataOptions): UseCandleDataReturn {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  const fetchCandles = useCallback(async () => {
    if (!symbol) return;

    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      params.set("resolution", resolution);
      if (from) params.set("from", String(from));
      if (to) params.set("to", String(to));

      const response = await fetch(
        `/api/stocks/${encodeURIComponent(symbol)}/candles?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch candle data");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setCandles(result.data);
        setSource(result.source);
        setIsError(false);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching candle data:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, resolution, from, to]);

  // Initial fetch
  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  // Auto refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchCandles, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchCandles, refreshInterval]);

  return {
    candles,
    isLoading,
    isError,
    source,
    refresh: fetchCandles,
  };
}

