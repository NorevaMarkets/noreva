import { useState, useEffect, useCallback } from "react";

interface CompanyProfile {
  name: string;
  ticker: string;
  exchange: string;
  industry: string;
  country: string;
  currency: string;
  website: string;
  logo: string;
  ipo: string;
  marketCap: number;
  sharesOutstanding: number;
}

interface StockMetrics {
  // Valuation
  peRatio: number | null;
  peTTM: number | null;
  psRatio: number | null;
  pbRatio: number | null;
  
  // Profitability
  epsAnnual: number | null;
  epsTTM: number | null;
  epsGrowth: number | null;
  netProfitMargin: number | null;
  roe: number | null;
  roa: number | null;
  
  // Dividend
  dividendYield: number | null;
  payoutRatio: number | null;
  
  // Price Performance
  week52High: number | null;
  week52Low: number | null;
  week52Return: number | null;
  beta: number | null;
  
  // Financial Health
  currentRatio: number | null;
  debtToEquity: number | null;
}

interface FundamentalsData {
  profile: CompanyProfile | null;
  metrics: StockMetrics | null;
}

interface UseFundamentalsReturn {
  data: FundamentalsData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStockFundamentals(symbol: string): UseFundamentalsReturn {
  const [data, setData] = useState<FundamentalsData>({ profile: null, metrics: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFundamentals = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stocks/${symbol}/fundamentals`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch fundamentals");
      }
    } catch (err) {
      setError("Network error fetching fundamentals");
      console.error("Fundamentals fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchFundamentals();
  }, [fetchFundamentals]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchFundamentals,
  };
}

