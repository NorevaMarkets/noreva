import { useState, useEffect, useCallback } from "react";

interface InsiderTransaction {
  name: string;
  date: string;
  filingDate: string;
  type: "Buy" | "Sell" | "Other";
  shares: number;
  price: number | null;
  value: number | null;
}

interface InsiderSentiment {
  netChange: number;
  buyCount: number;
  sellCount: number;
  trend: "Bullish" | "Bearish" | "Neutral";
}

interface InsiderSummary {
  totalBuys: number;
  totalSells: number;
  netShares: number;
  last3Months: "Buying" | "Selling" | "Mixed" | "No Activity";
}

interface InsiderData {
  transactions: InsiderTransaction[];
  sentiment: InsiderSentiment | null;
  summary: InsiderSummary;
}

interface UseInsiderDataReturn {
  data: InsiderData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInsiderData(symbol: string): UseInsiderDataReturn {
  const [data, setData] = useState<InsiderData>({
    transactions: [],
    sentiment: null,
    summary: {
      totalBuys: 0,
      totalSells: 0,
      netShares: 0,
      last3Months: "No Activity",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stocks/${symbol}/insiders`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch insider data");
      }
    } catch {
      setError("Failed to fetch insider data");
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

