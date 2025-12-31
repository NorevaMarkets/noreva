"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/providers/wallet-provider";
import { formatUsd } from "@/lib/utils/format";
import type { StockWithPrice } from "@/types";

interface TradePanelProps {
  stock: StockWithPrice;
  onTradeComplete?: () => void;
}

type TradeMode = "buy" | "sell";

export function TradePanel({ stock, onTradeComplete }: TradePanelProps) {
  const { isConnected, connect } = useWallet();
  const [mode, setMode] = useState<TradeMode>("buy");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const estimatedValue = numericAmount * stock.price.tokenPrice;
  const estimatedTokens = numericAmount / stock.price.tokenPrice;

  const handleSubmit = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    if (numericAmount <= 0) return;

    setIsSubmitting(true);
    
    // Simulate trade execution
    // In production, this would:
    // 1. Get quote from Jupiter
    // 2. Build and sign transaction
    // 3. Send transaction to Solana
    // 4. Wait for confirmation
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setAmount("");
    onTradeComplete?.();
  };

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Mode Toggle */}
      <div className="grid grid-cols-2">
        <button
          onClick={() => setMode("buy")}
          className={cn(
            "py-3 text-sm font-medium transition-colors",
            mode === "buy"
              ? "bg-[var(--positive)]/10 text-[var(--positive)] border-b-2 border-[var(--positive)]"
              : "text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)]"
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setMode("sell")}
          className={cn(
            "py-3 text-sm font-medium transition-colors",
            mode === "sell"
              ? "bg-[var(--negative)]/10 text-[var(--negative)] border-b-2 border-[var(--negative)]"
              : "text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)]"
          )}
        >
          Sell
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm text-[var(--foreground-muted)] mb-2">
            {mode === "buy" ? "Amount (USD)" : "Amount (Tokens)"}
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={cn(
                "w-full h-12 px-4 pr-16 text-lg font-mono rounded-lg border transition-colors",
                "bg-[var(--background-tertiary)] border-[var(--border)]",
                "text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)]",
                "focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">
              {mode === "buy" ? "USD" : stock.symbol}
            </span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {mode === "buy" ? (
            <>
              <QuickAmountButton onClick={() => setAmount("100")}>$100</QuickAmountButton>
              <QuickAmountButton onClick={() => setAmount("500")}>$500</QuickAmountButton>
              <QuickAmountButton onClick={() => setAmount("1000")}>$1K</QuickAmountButton>
              <QuickAmountButton onClick={() => setAmount("5000")}>$5K</QuickAmountButton>
            </>
          ) : (
            <>
              <QuickAmountButton onClick={() => setAmount("0.25")}>25%</QuickAmountButton>
              <QuickAmountButton onClick={() => setAmount("0.5")}>50%</QuickAmountButton>
              <QuickAmountButton onClick={() => setAmount("0.75")}>75%</QuickAmountButton>
              <QuickAmountButton onClick={() => setAmount("1")}>Max</QuickAmountButton>
            </>
          )}
        </div>

        {/* Estimate */}
        {numericAmount > 0 && (
          <div className="p-3 rounded-lg bg-[var(--background-tertiary)] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--foreground-muted)]">
                {mode === "buy" ? "You receive" : "You receive"}
              </span>
              <span className="font-mono text-[var(--foreground)]">
                {mode === "buy" 
                  ? `~${estimatedTokens.toFixed(4)} ${stock.symbol}`
                  : `~${formatUsd(estimatedValue)}`
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--foreground-muted)]">Price</span>
              <span className="font-mono text-[var(--foreground)]">
                {formatUsd(stock.price.tokenPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--foreground-muted)]">Spread</span>
              <Badge 
                variant={stock.price.spreadDirection === "premium" ? "negative" : 
                        stock.price.spreadDirection === "discount" ? "positive" : "muted"}
              >
                {stock.price.spread > 0 ? "+" : ""}{stock.price.spread.toFixed(2)}%
              </Badge>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!isConnected && false)}
          className={cn(
            "w-full h-12 rounded-lg font-medium transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            mode === "buy"
              ? "bg-[var(--positive)] hover:bg-[var(--positive)]/90 text-white"
              : "bg-[var(--negative)] hover:bg-[var(--negative)]/90 text-white"
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              Processing...
            </span>
          ) : !isConnected ? (
            "Connect Wallet to Trade"
          ) : numericAmount <= 0 ? (
            "Enter Amount"
          ) : mode === "buy" ? (
            `Buy ${stock.symbol}`
          ) : (
            `Sell ${stock.symbol}`
          )}
        </button>

        {/* Disclaimer */}
        <p className="text-xs text-[var(--foreground-subtle)] text-center">
          Trades are executed via Jupiter. Price may vary at execution time.
        </p>
      </div>
    </Card>
  );
}

function QuickAmountButton({ 
  children, 
  onClick 
}: { 
  children: React.ReactNode; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="py-2 text-xs font-medium rounded-md text-[var(--foreground-muted)] bg-[var(--background-tertiary)] hover:bg-[var(--border)] transition-colors"
    >
      {children}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

