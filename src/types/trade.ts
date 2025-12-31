/**
 * Trade types for the trading history
 */

export interface Trade {
  id: string;
  wallet_address: string;
  type: "buy" | "sell";
  symbol: string;
  stock_name: string | null;
  token_amount: number;
  usdc_amount: number;
  price_per_token: number;
  tx_signature: string | null;
  status: "pending" | "confirmed" | "failed";
  created_at: string;
  confirmed_at: string | null;
}

export interface TradeInsert {
  wallet_address: string;
  type: "buy" | "sell";
  symbol: string;
  stock_name?: string;
  token_amount: number;
  usdc_amount: number;
  price_per_token: number;
  tx_signature?: string;
  status?: "pending" | "confirmed" | "failed";
}

export interface TradeUpdate {
  status?: "pending" | "confirmed" | "failed";
  tx_signature?: string;
  confirmed_at?: string;
}

/**
 * Frontend-friendly trade format
 */
export interface TradeDisplay {
  id: string;
  type: "buy" | "sell";
  symbol: string;
  stockName: string;
  tokenAmount: number;
  usdcAmount: number;
  pricePerToken: number;
  txSignature: string | null;
  status: "pending" | "confirmed" | "failed";
  date: Date;
}

/**
 * Convert database trade to display format
 */
export function toTradeDisplay(trade: Trade): TradeDisplay {
  return {
    id: trade.id,
    type: trade.type,
    symbol: trade.symbol,
    stockName: trade.stock_name || trade.symbol,
    tokenAmount: trade.token_amount,
    usdcAmount: trade.usdc_amount,
    pricePerToken: trade.price_per_token,
    txSignature: trade.tx_signature,
    status: trade.status,
    date: new Date(trade.created_at),
  };
}

