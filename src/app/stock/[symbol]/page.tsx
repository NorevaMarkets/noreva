"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/utils/format";
import { TradingChart } from "@/components/features/stock-detail/trading-chart";
import { LiquidityPanel } from "@/components/features/stock-detail/liquidity-panel";
import { TradingPanel } from "@/components/features/stock-detail/trading-panel";
import { FundamentalsPanel } from "@/components/features/stock-detail/fundamentals-panel";
import { NewsFeed } from "@/components/features/stock-detail/news-feed";
import { useRealStocks } from "@/hooks";

// Tab types for the right panel
type RightPanelTab = "market" | "fundamentals" | "news";

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;
  const [activeTab, setActiveTab] = useState<RightPanelTab>("market");

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

          {/* Chart Area - Responsive height */}
          <div className="flex-1 p-2 sm:p-4 bg-[var(--background)] min-h-[280px] sm:min-h-[350px] lg:min-h-0 max-h-[300px] sm:max-h-none">
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
        <div className="w-full lg:w-[320px] flex flex-col bg-[var(--background-card)] min-h-0 lg:overflow-hidden border-t lg:border-t-0 border-[var(--border)]">
          {/* Tab Navigation */}
          <div className="flex border-b border-[var(--border)] bg-[var(--background-secondary)] shrink-0">
            <TabButton
              active={activeTab === "market"}
              onClick={() => setActiveTab("market")}
              icon={<ChartBarIcon className="w-3.5 h-3.5" />}
            >
              Market
            </TabButton>
            <TabButton
              active={activeTab === "fundamentals"}
              onClick={() => setActiveTab("fundamentals")}
              icon={<DocumentIcon className="w-3.5 h-3.5" />}
            >
              Fundamentals
            </TabButton>
            <TabButton
              active={activeTab === "news"}
              onClick={() => setActiveTab("news")}
              icon={<NewspaperIcon className="w-3.5 h-3.5" />}
            >
              News
            </TabButton>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {activeTab === "market" && (
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
            )}
            {activeTab === "fundamentals" && (
              <FundamentalsPanel symbol={underlying} />
            )}
            {activeTab === "news" && (
              <NewsFeed symbol={underlying} />
            )}
          </div>

          {/* Trading Panel - Always visible */}
          <div className="shrink-0 border-t border-[var(--border)]">
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

// Tab Button Component
interface TabButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

function TabButton({ children, active, onClick, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[10px] sm:text-xs font-medium transition-all relative",
        active
          ? "text-[var(--accent)]"
          : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      )}
    >
      {icon}
      <span>{children}</span>
      {active && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--accent)] rounded-full" />
      )}
    </button>
  );
}

// Icons for tabs
function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function NewspaperIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}
