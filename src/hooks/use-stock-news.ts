import { useState, useEffect, useCallback } from "react";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  imageUrl: string | null;
  publishedAt: string;
  relatedSymbols: string[];
}

interface UseNewsReturn {
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStockNews(symbol: string): UseNewsReturn {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stocks/${symbol}/news`);
      const result = await response.json();

      if (result.success) {
        setNews(result.data);
      } else {
        setError(result.error || "Failed to fetch news");
      }
    } catch (err) {
      setError("Network error fetching news");
      console.error("News fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    isLoading,
    error,
    refetch: fetchNews,
  };
}

