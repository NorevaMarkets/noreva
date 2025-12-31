import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

interface FinnhubRecommendation {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string;
}

interface FinnhubPriceTarget {
  lastUpdated: string;
  symbol: string;
  targetHigh: number;
  targetLow: number;
  targetMean: number;
  targetMedian: number;
}

interface RecommendationData {
  recommendations: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
    total: number;
    consensus: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell" | "N/A";
    period: string;
  } | null;
  priceTarget: {
    high: number;
    low: number;
    mean: number;
    median: number;
    currentPrice?: number;
    upside?: number;
    lastUpdated: string;
  } | null;
}

/**
 * Fetch analyst recommendations from Finnhub
 */
async function fetchRecommendations(symbol: string): Promise<FinnhubRecommendation[]> {
  if (!FINNHUB_API_KEY) return [];

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Fetch price targets from Finnhub
 */
async function fetchPriceTarget(symbol: string): Promise<FinnhubPriceTarget | null> {
  if (!FINNHUB_API_KEY) return null;

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/price-target?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;
    const data = await response.json();
    
    // Check if we got valid data
    if (!data.targetMean && !data.targetMedian) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetch current stock price for upside calculation
 */
async function fetchCurrentPrice(symbol: string): Promise<number | null> {
  if (!FINNHUB_API_KEY) return null;

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.c || null; // Current price
  } catch {
    return null;
  }
}

/**
 * Calculate consensus rating
 */
function calculateConsensus(rec: FinnhubRecommendation): "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell" | "N/A" {
  const total = rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell;
  if (total === 0) return "N/A";

  // Weighted score: Strong Buy = 5, Buy = 4, Hold = 3, Sell = 2, Strong Sell = 1
  const score = (
    rec.strongBuy * 5 +
    rec.buy * 4 +
    rec.hold * 3 +
    rec.sell * 2 +
    rec.strongSell * 1
  ) / total;

  if (score >= 4.5) return "Strong Buy";
  if (score >= 3.5) return "Buy";
  if (score >= 2.5) return "Hold";
  if (score >= 1.5) return "Sell";
  return "Strong Sell";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  try {
    // Fetch all data in parallel
    const [recommendations, priceTarget, currentPrice] = await Promise.all([
      fetchRecommendations(upperSymbol),
      fetchPriceTarget(upperSymbol),
      fetchCurrentPrice(upperSymbol),
    ]);

    const result: RecommendationData = {
      recommendations: null,
      priceTarget: null,
    };

    // Process recommendations (use most recent)
    if (recommendations.length > 0) {
      const latest = recommendations[0];
      const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;
      
      result.recommendations = {
        strongBuy: latest.strongBuy,
        buy: latest.buy,
        hold: latest.hold,
        sell: latest.sell,
        strongSell: latest.strongSell,
        total,
        consensus: calculateConsensus(latest),
        period: latest.period,
      };
    }

    // Process price targets
    if (priceTarget) {
      const upside = currentPrice && priceTarget.targetMean
        ? ((priceTarget.targetMean - currentPrice) / currentPrice) * 100
        : undefined;

      result.priceTarget = {
        high: priceTarget.targetHigh,
        low: priceTarget.targetLow,
        mean: priceTarget.targetMean,
        median: priceTarget.targetMedian,
        currentPrice: currentPrice || undefined,
        upside,
        lastUpdated: priceTarget.lastUpdated,
      };
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch analyst data",
      data: { recommendations: null, priceTarget: null },
    });
  }
}

