import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

interface FinnhubEarningsCalendar {
  earningsCalendar: Array<{
    date: string;
    epsActual: number | null;
    epsEstimate: number | null;
    hour: string;
    quarter: number;
    revenueActual: number | null;
    revenueEstimate: number | null;
    symbol: string;
    year: number;
  }>;
}

interface FinnhubEarningsSurprise {
  actual: number;
  estimate: number;
  period: string;
  quarter: number;
  surprise: number;
  surprisePercent: number;
  symbol: string;
  year: number;
}

interface EarningsData {
  nextEarnings: {
    date: string;
    hour: string; // "bmo" (before market open), "amc" (after market close), "dmh" (during market hours)
    quarter: number;
    year: number;
    epsEstimate: number | null;
    revenueEstimate: number | null;
    daysUntil: number;
  } | null;
  history: Array<{
    date: string;
    quarter: number;
    year: number;
    epsActual: number | null;
    epsEstimate: number | null;
    epsSurprise: number | null;
    epsSurprisePercent: number | null;
    beat: boolean | null;
  }>;
}

/**
 * Fetch earnings calendar from Finnhub
 */
async function fetchEarningsCalendar(symbol: string): Promise<FinnhubEarningsCalendar | null> {
  if (!FINNHUB_API_KEY) return null;

  try {
    // Get earnings for the next year
    const from = new Date().toISOString().split("T")[0];
    const to = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const response = await fetch(
      `https://finnhub.io/api/v1/calendar/earnings?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Fetch earnings surprises (history) from Finnhub
 */
async function fetchEarningsSurprises(symbol: string): Promise<FinnhubEarningsSurprise[]> {
  if (!FINNHUB_API_KEY) return [];

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Calculate days until a date
 */
function daysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format hour string
 */
function formatHour(hour: string): string {
  switch (hour) {
    case "bmo": return "Before Market Open";
    case "amc": return "After Market Close";
    case "dmh": return "During Market Hours";
    default: return hour || "TBD";
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
    const [calendar, surprises] = await Promise.all([
      fetchEarningsCalendar(upperSymbol),
      fetchEarningsSurprises(upperSymbol),
    ]);

    const result: EarningsData = {
      nextEarnings: null,
      history: [],
    };

    // Process next earnings date
    if (calendar?.earningsCalendar && calendar.earningsCalendar.length > 0) {
      const next = calendar.earningsCalendar[0];
      result.nextEarnings = {
        date: next.date,
        hour: formatHour(next.hour),
        quarter: next.quarter,
        year: next.year,
        epsEstimate: next.epsEstimate,
        revenueEstimate: next.revenueEstimate,
        daysUntil: daysUntil(next.date),
      };
    }

    // Process earnings history
    if (surprises.length > 0) {
      result.history = surprises.slice(0, 8).map((s) => ({
        date: s.period,
        quarter: s.quarter,
        year: s.year,
        epsActual: s.actual,
        epsEstimate: s.estimate,
        epsSurprise: s.surprise,
        epsSurprisePercent: s.surprisePercent,
        beat: s.actual !== null && s.estimate !== null ? s.actual > s.estimate : null,
      }));
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching earnings:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch earnings data",
      data: { nextEarnings: null, history: [] },
    });
  }
}

