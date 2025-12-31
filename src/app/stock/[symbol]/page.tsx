"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/utils/format";
import { TradingChart } from "@/components/features/stock-detail/trading-chart";
import { LiquidityPanel } from "@/components/features/stock-detail/liquidity-panel";
import { TradingPanel } from "@/components/features/stock-detail/trading-panel";
import { useRealStocks } from "@/hooks";

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;

  // Fetch real stock data
  const { stocks, isLoading } = useRealStocks({
    refreshInterval: 30000,
  });

  // Find stock by symbol (case-insensitive)
  const stock = useMemo(() => {
    return stocks.find(
      (s) => s.symbol.toLowerCase() === symbol?.toLowerCase() ||
             s.underlying.toLowerCase() === symbol?.toLowerCase()
    );
  }, [symbol, stocks]);

  // Show loading state
  if (isLoading && !stock) {
    return (
      <div className="min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[var(--foreground-muted)]">Loading stock data...</p>
        </div>
      </div>
    );
  }

  // Show not found if stock doesn't exist
  if (!stock) {
    return (
      <div className="min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">
            Stock Not Found
          </h1>
          <p className="text-[var(--foreground-muted)] mb-4">
            The stock "{symbol}" could not be found.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg font-medium hover:bg-[var(--accent-light)] transition-colors"
          >
            Back to Stocks
          </button>
        </div>
      </div>
    );
  }

  const { price, underlying } = stock;
  const priceChangePercent = (price as any).change24h ?? 1.2;
  const isPositive = priceChangePercent >= 0;
  const otherStocks = stocks.filter((s) => s.id !== stock.id).slice(0, 4);

  return (
    <div className="min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] flex flex-col lg:overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left: Chart Section */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 lg:border-r border-[var(--border)]">
          {/* Price Header - Responsive */}
          <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-[var(--border)] bg-[var(--background-secondary)] shrink-0">
            <div className="flex items-start justify-between gap-2">
              {/* Price Info - Stacked on mobile, horizontal on desktop */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 flex-1 min-w-0">
                {/* Token Price (Solana) */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[var(--accent)] font-semibold text-sm sm:text-lg truncate">
                      {underlying}/SOL
                    </span>
                    <span className="px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] text-[8px] sm:text-[9px] font-semibold uppercase rounded shrink-0">
                      Token
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[var(--foreground)]">
                      {formatUsd(price.tokenPrice)}
                    </span>
                  </div>
                </div>

                {/* Mobile: Show stock price and spread inline */}
                <div className="flex items-center gap-3 sm:gap-6 sm:contents">
                  {/* Divider - hidden on smallest screens */}
                  <div className="hidden sm:block h-10 w-px bg-[var(--border)]" />

                  {/* Stock Price (TradFi) */}
                  <div>
                    <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
                      <span className="text-[var(--foreground-muted)] font-medium text-xs sm:text-sm">
                        {underlying}
                      </span>
                      <span className="hidden sm:inline px-1.5 py-0.5 bg-[var(--foreground-subtle)]/10 text-[var(--foreground-subtle)] text-[9px] font-semibold uppercase rounded">
                        Stock
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm sm:text-lg font-semibold font-mono tabular-nums text-[var(--foreground-muted)]">
                        {formatUsd(price.tradFiPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Divider - hidden on smallest screens */}
                  <div className="hidden sm:block h-10 w-px bg-[var(--border)]" />

                  {/* Spread */}
                  <div>
                    <div className="text-[var(--foreground-subtle)] text-[10px] sm:text-xs mb-0.5">
                      Spread
                    </div>
                    <div className={cn(
                      "text-sm sm:text-lg font-semibold font-mono tabular-nums",
                      price.spread >= 0 ? "text-[#4ade80]" : "text-[#f87171]"
                    )}>
                      {price.spread >= 0 ? "+" : ""}{price.spread.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <div className="hidden sm:block border border-[var(--accent)] text-[var(--accent)] text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
                  24/7 Market
                </div>
                <button
                  onClick={() => router.push("/")}
                  className="p-1.5 sm:p-2 text-[var(--foreground-subtle)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] rounded-lg transition-colors"
                  title="Back to Stocks"
                >
                  <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-1 p-2 sm:p-4 bg-[var(--background)] min-h-[300px] sm:min-h-[400px] lg:min-h-0">
            <TradingChart
              symbol={underlying}
              fullscreen
            />
          </div>

          {/* Stock Ticker - Horizontal scroll on mobile */}
          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-[var(--background-secondary)] border-t border-[var(--border)] text-xs overflow-x-auto shrink-0 scrollbar-hide">
            {otherStocks.map((s) => {
              const change = (
                ((s.price.tokenPrice - s.price.tradFiPrice) /
                  s.price.tradFiPrice) *
                  100 +
                0.5
              ).toFixed(1);
              const positive = parseFloat(change) >= 0;
              return (
                <button
                  key={s.id}
                  onClick={() => router.push(`/stock/${s.underlying}`)}
                  className="flex items-center gap-1 sm:gap-1.5 hover:bg-[var(--background-tertiary)] px-2 py-1 rounded transition-colors shrink-0"
                >
                  <span className="text-[var(--foreground)] font-medium text-[11px] sm:text-xs">
                    {s.underlying}:
                  </span>
                  <span className="font-mono tabular-nums text-[var(--foreground)] text-[11px] sm:text-xs">
                    {formatUsd(s.price.tokenPrice)}
                  </span>
                  <span
                    className={cn(
                      "font-mono tabular-nums text-[10px] sm:text-xs",
                      positive ? "text-[#4ade80]" : "text-[#f87171]"
                    )}
                  >
                    {positive ? "+" : ""}{change}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Panels - Full width on mobile, fixed width on desktop */}
        <div className="w-full lg:w-[280px] flex flex-col bg-[var(--background-card)] min-h-0 lg:overflow-hidden border-t lg:border-t-0 border-[var(--border)]">
          {/* Market Data Panel */}
          <div className="border-b border-[var(--border)] lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <LiquidityPanel 
              symbol={underlying}
              tokenPrice={price.tokenPrice}
              stockPrice={price.tradFiPrice}
              spread={price.spread}
              mintAddress={(stock as any).mintAddress || null}
              hasSolana={(stock as any).hasSolana ?? false}
              volume24h={price.volume24h}
              marketCap={price.marketCap}
              change24h={price.change24h}
              high24h={price.high24h}
              low24h={price.low24h}
            />
          </div>

          {/* Trading Panel */}
          <div className="shrink-0">
            <TradingPanel stock={stock} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}
