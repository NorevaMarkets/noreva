import { useState, useEffect, useCallback } from "react";

interface NextEarnings {
  date: string;
  hour: string;
  quarter: number;
  year: number;
  epsEstimate: number | null;
  revenueEstimate: number | null;
  daysUntil: number;
}

interface EarningsHistoryItem {
  date: string;
  quarter: number;
  year: number;
  epsActual: number | null;
  epsEstimate: number | null;
  epsSurprise: number | null;
  epsSurprisePercent: number | null;
  beat: boolean | null;
}

interface EarningsData {
  nextEarnings: NextEarnings | null;
  history: EarningsHistoryItem[];
}

interface UseEarningsDataReturn {
  data: EarningsData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEarningsData(symbol: string): UseEarningsDataReturn {
  const [data, setData] = useState<EarningsData>({
    nextEarnings: null,
    history: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stocks/${symbol}/earnings`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch earnings data");
      }
    } catch {
      setError("Failed to fetch earnings data");
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

