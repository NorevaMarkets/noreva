import { useState, useEffect, useCallback } from "react";

interface Recommendations {
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  total: number;
  consensus: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell" | "N/A";
  period: string;
}

interface PriceTarget {
  high: number;
  low: number;
  mean: number;
  median: number;
  currentPrice?: number;
  upside?: number;
  lastUpdated: string;
}

interface AnalystData {
  recommendations: Recommendations | null;
  priceTarget: PriceTarget | null;
}

interface UseAnalystDataReturn {
  data: AnalystData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnalystData(symbol: string): UseAnalystDataReturn {
  const [data, setData] = useState<AnalystData>({
    recommendations: null,
    priceTarget: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stocks/${symbol}/recommendations`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch analyst data");
      }
    } catch {
      setError("Failed to fetch analyst data");
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

