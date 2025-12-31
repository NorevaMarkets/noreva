import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

interface FinnhubInsiderTransaction {
  change: number;
  filingDate: string;
  name: string;
  share: number;
  symbol: string;
  transactionCode: string;
  transactionDate: string;
  transactionPrice: number;
}

interface FinnhubInsiderSentiment {
  symbol: string;
  year: number;
  month: number;
  change: number;
  mspr: number; // Monthly Share Purchase Ratio
}

interface InsiderData {
  transactions: Array<{
    name: string;
    date: string;
    filingDate: string;
    type: "Buy" | "Sell" | "Other";
    shares: number;
    price: number | null;
    value: number | null;
  }>;
  sentiment: {
    netChange: number;
    buyCount: number;
    sellCount: number;
    trend: "Bullish" | "Bearish" | "Neutral";
  } | null;
  summary: {
    totalBuys: number;
    totalSells: number;
    netShares: number;
    last3Months: "Buying" | "Selling" | "Mixed" | "No Activity";
  };
}

/**
 * Fetch insider transactions from Finnhub
 */
async function fetchInsiderTransactions(symbol: string): Promise<FinnhubInsiderTransaction[]> {
  if (!FINNHUB_API_KEY) return [];

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/insider-transactions?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch insider sentiment from Finnhub
 */
async function fetchInsiderSentiment(symbol: string): Promise<FinnhubInsiderSentiment[]> {
  if (!FINNHUB_API_KEY) return [];

  try {
    // Get sentiment for last 6 months
    const to = new Date().toISOString().split("T")[0];
    const from = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const response = await fetch(
      `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

/**
 * Map transaction code to type
 */
function getTransactionType(code: string): "Buy" | "Sell" | "Other" {
  // P = Purchase, S = Sale, A = Award, etc.
  switch (code?.toUpperCase()) {
    case "P":
    case "A":
    case "M":
      return "Buy";
    case "S":
    case "F":
      return "Sell";
    default:
      return "Other";
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  try {
    // Fetch all data in parallel
    const [transactions, sentiment] = await Promise.all([
      fetchInsiderTransactions(upperSymbol),
      fetchInsiderSentiment(upperSymbol),
    ]);

    const result: InsiderData = {
      transactions: [],
      sentiment: null,
      summary: {
        totalBuys: 0,
        totalSells: 0,
        netShares: 0,
        last3Months: "No Activity",
      },
    };

    // Process transactions (last 20)
    if (transactions.length > 0) {
      result.transactions = transactions.slice(0, 20).map((t) => {
        const type = getTransactionType(t.transactionCode);
        return {
          name: t.name,
          date: t.transactionDate,
          filingDate: t.filingDate,
          type,
          shares: Math.abs(t.change),
          price: t.transactionPrice > 0 ? t.transactionPrice : null,
          value: t.transactionPrice > 0 ? Math.abs(t.change) * t.transactionPrice : null,
        };
      });

      // Calculate summary
      const last3Months = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const recentTransactions = transactions.filter(
        (t) => new Date(t.transactionDate) >= last3Months
      );

      let totalBuys = 0;
      let totalSells = 0;
      let netShares = 0;

      recentTransactions.forEach((t) => {
        const type = getTransactionType(t.transactionCode);
        if (type === "Buy") {
          totalBuys++;
          netShares += Math.abs(t.change);
        } else if (type === "Sell") {
          totalSells++;
          netShares -= Math.abs(t.change);
        }
      });

      result.summary = {
        totalBuys,
        totalSells,
        netShares,
        last3Months:
          totalBuys === 0 && totalSells === 0
            ? "No Activity"
            : totalBuys > totalSells * 1.5
            ? "Buying"
            : totalSells > totalBuys * 1.5
            ? "Selling"
            : "Mixed",
      };
    }

    // Process sentiment
    if (sentiment.length > 0) {
      const totalChange = sentiment.reduce((sum, s) => sum + s.change, 0);
      const avgMspr = sentiment.reduce((sum, s) => sum + s.mspr, 0) / sentiment.length;
      
      const buyCount = sentiment.filter((s) => s.change > 0).length;
      const sellCount = sentiment.filter((s) => s.change < 0).length;

      result.sentiment = {
        netChange: totalChange,
        buyCount,
        sellCount,
        trend: avgMspr > 0.1 ? "Bullish" : avgMspr < -0.1 ? "Bearish" : "Neutral",
      };
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching insider data:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch insider data",
      data: { transactions: [], sentiment: null, summary: { totalBuys: 0, totalSells: 0, netShares: 0, last3Months: "No Activity" } },
    });
  }
}

