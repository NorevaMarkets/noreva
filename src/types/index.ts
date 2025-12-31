/**
 * Core type definitions for Noreva
 */

// Tokenized Stock representation
export interface TokenizedStock {
  id: string;
  symbol: string;           // e.g., "bAAPL"
  name: string;             // e.g., "Backed Apple"
  underlying: string;       // e.g., "AAPL"
  mintAddress: string;      // Solana token mint address
  decimals: number;
  logoUrl?: string;
  provider: StockProvider;
  hasSolana?: boolean;      // Whether deployed on Solana
  networks?: string[];      // Available networks
  description?: string;
  isTradingHalted?: boolean;
}

// Stock provider (issuer of tokenized stocks)
export type StockProvider = "backed" | "ondo" | "other";

// Price data for a tokenized stock
export interface StockPrice {
  tokenPrice: number;       // Price of the token in USD
  tradFiPrice: number;      // Price of the underlying stock in USD
  spread: number;           // Percentage difference (premium/discount)
  spreadDirection: "premium" | "discount" | "parity";
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
  change24h?: number;       // 24h price change percentage
  high24h?: number;         // 24h high price
  low24h?: number;          // 24h low price
}

// Combined stock with price data
export interface StockWithPrice extends TokenizedStock {
  price: StockPrice;
}

// Price history for charts
export interface PricePoint {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface PriceHistory {
  symbol: string;
  interval: ChartInterval;
  data: PricePoint[];
}

// Chart time intervals
export type ChartInterval = "1H" | "4H" | "1D" | "1W" | "1M";

// Portfolio types
export interface PortfolioHolding {
  stock: TokenizedStock;
  balance: number;
  valueUsd: number;
  pnl: number;
  pnlPercent: number;
}

export interface Portfolio {
  address: string;
  holdings: PortfolioHolding[];
  totalValue: number;
  totalPnl: number;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Sort options for stock list
export type SortField = "symbol" | "price" | "spread" | "volume" | "marketCap";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Filter options
export interface FilterConfig {
  provider?: StockProvider;
  minVolume?: number;
  searchQuery?: string;
}

