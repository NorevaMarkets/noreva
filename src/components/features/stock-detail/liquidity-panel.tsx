"use client";

import { cn } from "@/lib/utils";

interface LiquidityPanelProps {
  symbol: string;
  tokenPrice: number;
  stockPrice: number;
  spread: number;
  mintAddress: string | null;
  hasSolana: boolean;
  volume24h?: number;
  marketCap?: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
}

export function LiquidityPanel({ 
  symbol, 
  tokenPrice, 
  stockPrice, 
  spread, 
  mintAddress,
  hasSolana,
  volume24h = 0,
  marketCap = 0,
  change24h = 0,
  high24h = 0,
  low24h = 0,
}: LiquidityPanelProps) {
  const spreadColor = spread >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]";
  const changeColor = change24h >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]";

  return (
    <div className="p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
            Market Data
          </div>
          <span className="px-1.5 py-0.5 bg-[var(--positive)]/10 text-[var(--positive)] text-[8px] font-medium rounded">
            Live
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-[var(--foreground-subtle)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)] animate-pulse" />
          Backed Finance
        </div>
      </div>

      {/* Price Comparison Card */}
      <div className="bg-[var(--background-tertiary)] rounded-lg p-3 mb-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] text-[var(--foreground-subtle)] uppercase mb-1">Token Price</div>
            <div className="text-sm font-bold font-mono tabular-nums text-[var(--accent)]">
              ${tokenPrice.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-[var(--foreground-subtle)] uppercase mb-1">Stock Price</div>
            <div className="text-sm font-bold font-mono tabular-nums text-[var(--foreground)]">
              ${stockPrice.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[var(--foreground-subtle)]">Spread</span>
            <span className={cn("text-sm font-bold font-mono tabular-nums", spreadColor)}>
              {spread >= 0 ? "+" : ""}{spread.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="flex-1 min-h-0">
        <div className="text-[9px] text-[var(--foreground-subtle)] uppercase mb-2">
          Market Statistics
        </div>
        
        <div className="space-y-2">
          {/* 24h Change */}
          <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--background-tertiary)] rounded text-[10px]">
            <span className="text-[var(--foreground-muted)]">24h Change</span>
            <span className={cn("font-mono tabular-nums font-semibold", changeColor)}>
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
            </span>
          </div>

          {/* 24h High/Low */}
          <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--background-tertiary)] rounded text-[10px]">
            <span className="text-[var(--foreground-muted)]">24h Range</span>
            <span className="font-mono tabular-nums text-[var(--foreground)]">
              ${low24h.toFixed(2)} - ${high24h.toFixed(2)}
            </span>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--background-tertiary)] rounded text-[10px]">
            <span className="text-[var(--foreground-muted)]">Volume (est.)</span>
            <span className="font-mono tabular-nums text-[var(--foreground)]">
              {volume24h.toLocaleString()}
            </span>
          </div>

          {/* Market Cap */}
          <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--background-tertiary)] rounded text-[10px]">
            <span className="text-[var(--foreground-muted)]">Market Cap (est.)</span>
            <span className="font-mono tabular-nums text-[var(--foreground)]">
              ${(marketCap / 1_000_000).toFixed(1)}M
            </span>
          </div>
        </div>
      </div>

      {/* Network Info */}
      <div className="mt-3 pt-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-[var(--foreground-subtle)]">Network</span>
          <span className="text-[var(--foreground-muted)] flex items-center gap-1">
            {hasSolana ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)]" />
                Solana
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--foreground-subtle)]" />
                Not on Solana
              </>
            )}
          </span>
        </div>
        {mintAddress && mintAddress !== "N/A" && (
          <div className="mt-1 flex items-center justify-between text-[8px]">
            <span className="text-[var(--foreground-subtle)]">Contract</span>
            <span className="text-[var(--foreground-subtle)] font-mono truncate max-w-[120px]" title={mintAddress}>
              {mintAddress.startsWith("svm:") ? mintAddress.slice(4, 12) : mintAddress.slice(0, 8)}...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
