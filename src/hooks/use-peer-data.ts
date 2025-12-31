import { useState, useEffect, useCallback } from "react";

interface PeerData {
  peers: string[];
  count: number;
}

interface UsePeerDataReturn {
  data: PeerData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePeerData(symbol: string): UsePeerDataReturn {
  const [data, setData] = useState<PeerData>({
    peers: [],
    count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stocks/${symbol}/peers`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch peer data");
      }
    } catch {
      setError("Failed to fetch peer data");
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

