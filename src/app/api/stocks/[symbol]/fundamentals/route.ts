import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

interface BasicFinancials {
  metric: {
    "10DayAverageTradingVolume": number;
    "52WeekHigh": number;
    "52WeekLow": number;
    "52WeekPriceReturnDaily": number;
    beta: number;
    bookValuePerShareAnnual: number;
    bookValuePerShareQuarterly: number;
    currentRatioAnnual: number;
    currentRatioQuarterly: number;
    dividendYieldIndicatedAnnual: number;
    ebitdPerShareTTM: number;
    epsAnnual: number;
    epsBasicExclExtraItemsAnnual: number;
    epsGrowth3Y: number;
    epsGrowth5Y: number;
    epsGrowthTTMYoy: number;
    epsTTM: number;
    marketCapitalization: number;
    netIncomeEmployeeAnnual: number;
    netProfitMarginAnnual: number;
    netProfitMarginTTM: number;
    payoutRatioAnnual: number;
    peAnnual: number;
    peBasicExclExtraTTM: number;
    peExclExtraAnnual: number;
    peExclExtraTTM: number;
    peTTM: number;
    pfcfShareAnnual: number;
    pfcfShareTTM: number;
    priceRelativeToS500_4Week: number;
    priceRelativeToS500_13Week: number;
    priceRelativeToS500_26Week: number;
    priceRelativeToS500_52Week: number;
    priceRelativeToS500Ytd: number;
    psAnnual: number;
    psTTM: number;
    ptbvAnnual: number;
    ptbvQuarterly: number;
    revenuePerShareAnnual: number;
    revenuePerShareTTM: number;
    roaRfy: number;
    roaTTM: number;
    roeRfy: number;
    roeTTM: number;
    roiAnnual: number;
    roiTTM: number;
    tangibleBookValuePerShareAnnual: number;
    tangibleBookValuePerShareQuarterly: number;
    totalDebt_totalEquityAnnual: number;
    totalDebt_totalEquityQuarterly: number;
  };
}

interface FundamentalsResponse {
  success: boolean;
  data: {
    profile: {
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
    } | null;
    metrics: {
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
    } | null;
  };
  error?: string;
  timestamp: string;
}

/**
 * Fetch company profile from Finnhub
 */
async function fetchCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  if (!FINNHUB_API_KEY) return null;

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    // Check if we got valid data (Finnhub returns {} for invalid symbols)
    if (!data || !data.ticker) return null;
    
    return data;
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return null;
  }
}

/**
 * Fetch basic financials/metrics from Finnhub
 */
async function fetchBasicFinancials(symbol: string): Promise<BasicFinancials | null> {
  if (!FINNHUB_API_KEY) return null;

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    if (!data || !data.metric) return null;
    
    return data;
  } catch (error) {
    console.error("Error fetching basic financials:", error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  // Check API key
  if (!FINNHUB_API_KEY) {
    return NextResponse.json({
      success: false,
      error: "Finnhub API key not configured. Add FINNHUB_API_KEY to your .env.local file.",
      data: { profile: null, metrics: null },
      timestamp: new Date().toISOString(),
    } as FundamentalsResponse);
  }

  try {
    // Fetch both in parallel
    const [profile, financials] = await Promise.all([
      fetchCompanyProfile(upperSymbol),
      fetchBasicFinancials(upperSymbol),
    ]);

    const response: FundamentalsResponse = {
      success: true,
      data: {
        profile: profile ? {
          name: profile.name,
          ticker: profile.ticker,
          exchange: profile.exchange,
          industry: profile.finnhubIndustry,
          country: profile.country,
          currency: profile.currency,
          website: profile.weburl,
          logo: profile.logo,
          ipo: profile.ipo,
          marketCap: profile.marketCapitalization * 1_000_000, // Convert from millions
          sharesOutstanding: profile.shareOutstanding * 1_000_000,
        } : null,
        metrics: financials?.metric ? {
          // Valuation
          peRatio: financials.metric.peAnnual || null,
          peTTM: financials.metric.peTTM || null,
          psRatio: financials.metric.psAnnual || null,
          pbRatio: financials.metric.ptbvAnnual || null,
          
          // Profitability
          epsAnnual: financials.metric.epsAnnual || null,
          epsTTM: financials.metric.epsTTM || null,
          epsGrowth: financials.metric.epsGrowth5Y || null,
          netProfitMargin: financials.metric.netProfitMarginTTM || null,
          roe: financials.metric.roeTTM || null,
          roa: financials.metric.roaTTM || null,
          
          // Dividend
          dividendYield: financials.metric.dividendYieldIndicatedAnnual || null,
          payoutRatio: financials.metric.payoutRatioAnnual || null,
          
          // Price Performance
          week52High: financials.metric["52WeekHigh"] || null,
          week52Low: financials.metric["52WeekLow"] || null,
          week52Return: financials.metric["52WeekPriceReturnDaily"] || null,
          beta: financials.metric.beta || null,
          
          // Financial Health
          currentRatio: financials.metric.currentRatioQuarterly || null,
          debtToEquity: financials.metric.totalDebt_totalEquityQuarterly || null,
        } : null,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Fundamentals API error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch fundamental data",
      data: { profile: null, metrics: null },
      timestamp: new Date().toISOString(),
    } as FundamentalsResponse);
  }
}

