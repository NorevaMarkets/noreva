import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  imageUrl: string | null;
  publishedAt: string;
  relatedSymbols: string[];
}

interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  error?: string;
  timestamp: string;
  source: string;
}

/**
 * Fetch company news from Finnhub
 */
async function fetchFinnhubNews(symbol: string): Promise<FinnhubNewsItem[]> {
  if (!FINNHUB_API_KEY) return [];

  try {
    // Get news from the last 7 days
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);

    const fromStr = from.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];

    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromStr}&to=${toStr}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      console.error("Finnhub news API error:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching Finnhub news:", error);
    return [];
  }
}

/**
 * Parse RSS feed items from Yahoo Finance
 * This is a fallback if Finnhub doesn't return results
 */
async function fetchYahooRSSNews(symbol: string): Promise<NewsItem[]> {
  try {
    // Yahoo Finance RSS feed for company news
    const rssUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en-US`;
    
    const response = await fetch(rssUrl, {
      next: { revalidate: 300 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Noreva/1.0)",
      },
    });

    if (!response.ok) return [];

    const xmlText = await response.text();
    
    // Simple XML parsing for RSS items
    const items: NewsItem[] = [];
    const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      const itemXml = match[1];
      
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] || 
                    itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[2] || "";
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1] ||
                          itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[2] || "";

      if (title && link) {
        items.push({
          id: `yahoo-${Buffer.from(link).toString("base64").slice(0, 16)}`,
          title: title.trim(),
          summary: description.trim().slice(0, 200),
          url: link.trim(),
          source: "Yahoo Finance",
          imageUrl: null,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          relatedSymbols: [symbol],
        });
      }

      if (items.length >= 10) break;
    }

    return items;
  } catch (error) {
    console.error("Error fetching Yahoo RSS:", error);
    return [];
  }
}

/**
 * Fetch general market news from Finnhub as fallback
 */
async function fetchMarketNews(): Promise<FinnhubNewsItem[]> {
  if (!FINNHUB_API_KEY) return [];

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 600 } } // Cache for 10 minutes
    );

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data.slice(0, 5) : [];
  } catch (error) {
    console.error("Error fetching market news:", error);
    return [];
  }
}

/**
 * Transform Finnhub news item to our format
 */
function transformFinnhubNews(item: FinnhubNewsItem): NewsItem {
  return {
    id: `finnhub-${item.id}`,
    title: item.headline,
    summary: item.summary?.slice(0, 300) || "",
    url: item.url,
    source: item.source,
    imageUrl: item.image || null,
    publishedAt: new Date(item.datetime * 1000).toISOString(),
    relatedSymbols: item.related ? item.related.split(",").map((s) => s.trim()) : [],
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  try {
    let newsItems: NewsItem[] = [];
    let source = "none";

    // Try Finnhub first
    if (FINNHUB_API_KEY) {
      const finnhubNews = await fetchFinnhubNews(upperSymbol);
      
      if (finnhubNews.length > 0) {
        newsItems = finnhubNews.slice(0, 15).map(transformFinnhubNews);
        source = "finnhub";
      } else {
        // If no company-specific news, try market news
        const marketNews = await fetchMarketNews();
        if (marketNews.length > 0) {
          newsItems = marketNews.map(transformFinnhubNews);
          source = "finnhub_market";
        }
      }
    }

    // Fallback to Yahoo RSS if Finnhub didn't return results
    if (newsItems.length === 0) {
      newsItems = await fetchYahooRSSNews(upperSymbol);
      source = newsItems.length > 0 ? "yahoo_rss" : "none";
    }

    // Sort by date (newest first)
    newsItems.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const response: NewsResponse = {
      success: true,
      data: newsItems,
      timestamp: new Date().toISOString(),
      source,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch news",
      data: [],
      timestamp: new Date().toISOString(),
      source: "error",
    } as NewsResponse);
  }
}

