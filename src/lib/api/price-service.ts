/**
 * Price Service
 * Handles fetching real-time prices from various APIs
 * 
 * In production, this would:
 * 1. Fetch token prices from Birdeye API (Solana token prices)
 * 2. Fetch stock prices from a financial data API (Alpha Vantage, Finnhub, etc.)
 * 3. Calculate spreads between token and underlying prices
 */

import { siteConfig } from "@/config/site";
import type { StockWithPrice, StockPrice } from "@/types";

// API Keys (in production, these would be environment variables)
const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || "";
const STOCK_API_KEY = process.env.NEXT_PUBLIC_STOCK_API_KEY || "";

interface BirdeyeTokenPrice {
  value: number;
  updateUnixTime: number;
  updateHumanTime: string;
  priceChange24h: number;
}

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

/**
 * Fetch token price from Birdeye API
 */
export async function fetchTokenPrice(mintAddress: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${siteConfig.api.birdeye}/defi/price?address=${mintAddress}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("Birdeye API error:", response.status);
      return null;
    }

    const data = await response.json();
    return data.data?.value || null;
  } catch (error) {
    console.error("Failed to fetch token price:", error);
    return null;
  }
}

/**
 * Fetch stock quote from financial API
 * Using Finnhub as an example (free tier available)
 */
export async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    // Example using Finnhub API
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${STOCK_API_KEY}`
    );

    if (!response.ok) {
      console.error("Stock API error:", response.status);
      return null;
    }

    const data = await response.json();
    
    return {
      symbol,
      price: data.c, // Current price
      change: data.d, // Change
      changePercent: data.dp, // Change percent
      volume: data.v || 0, // Volume (if available)
    };
  } catch (error) {
    console.error("Failed to fetch stock quote:", error);
    return null;
  }
}

/**
 * Calculate spread between token and stock prices
 */
export function calculateSpread(tokenPrice: number, stockPrice: number): {
  spread: number;
  spreadDirection: "premium" | "discount" | "parity";
} {
  const spread = ((tokenPrice - stockPrice) / stockPrice) * 100;
  
  let spreadDirection: "premium" | "discount" | "parity";
  if (Math.abs(spread) < 0.05) {
    spreadDirection = "parity";
  } else if (spread > 0) {
    spreadDirection = "premium";
  } else {
    spreadDirection = "discount";
  }

  return {
    spread: Number(spread.toFixed(2)),
    spreadDirection,
  };
}

/**
 * Fetch complete price data for a tokenized stock
 */
export async function fetchStockPriceData(
  mintAddress: string,
  underlyingSymbol: string
): Promise<StockPrice | null> {
  // Fetch both prices in parallel
  const [tokenPrice, stockQuote] = await Promise.all([
    fetchTokenPrice(mintAddress),
    fetchStockQuote(underlyingSymbol),
  ]);

  if (!tokenPrice || !stockQuote) {
    return null;
  }

  const { spread, spreadDirection } = calculateSpread(tokenPrice, stockQuote.price);

  return {
    tokenPrice,
    tradFiPrice: stockQuote.price,
    spread,
    spreadDirection,
    volume24h: stockQuote.volume,
    marketCap: 0, // Would need additional API call for market cap
    lastUpdated: new Date(),
  };
}

/**
 * Batch fetch prices for multiple stocks
 * More efficient for loading the stock list
 */
export async function fetchMultipleStockPrices(
  stocks: Array<{ mintAddress: string; underlyingSymbol: string }>
): Promise<Map<string, StockPrice | null>> {
  const results = new Map<string, StockPrice | null>();

  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(({ mintAddress, underlyingSymbol }) =>
        fetchStockPriceData(mintAddress, underlyingSymbol)
      )
    );

    batch.forEach((stock, index) => {
      results.set(stock.mintAddress, batchResults[index]);
    });

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < stocks.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

/**
 * Check if US markets are currently open
 */
export function isMarketOpen(): boolean {
  const now = new Date();
  const nyTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  
  const day = nyTime.getDay();
  const hour = nyTime.getHours();
  const minute = nyTime.getMinutes();
  
  // Markets are closed on weekends
  if (day === 0 || day === 6) return false;
  
  // Regular trading hours: 9:30 AM - 4:00 PM ET
  const marketOpenMinutes = 9 * 60 + 30;
  const marketCloseMinutes = 16 * 60;
  const currentMinutes = hour * 60 + minute;
  
  return currentMinutes >= marketOpenMinutes && currentMinutes < marketCloseMinutes;
}

/**
 * Get market status message
 */
export function getMarketStatus(): {
  isOpen: boolean;
  message: string;
  nextEvent: string;
} {
  const open = isMarketOpen();
  
  if (open) {
    return {
      isOpen: true,
      message: "US Markets Open",
      nextEvent: "Closes at 4:00 PM ET",
    };
  }
  
  return {
    isOpen: false,
    message: "US Markets Closed",
    nextEvent: "Opens at 9:30 AM ET",
  };
}

