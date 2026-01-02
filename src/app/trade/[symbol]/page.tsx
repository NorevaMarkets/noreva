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
import { useRealStocks, useFavorites } from "@/hooks";
import type { StockWithPrice } from "@/types";

// Tab types for the right panel
type RightPanelTab = "market" | "fundamentals" | "news";

export default function TradePage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;
  const [activeTab, setActiveTab] = useState<RightPanelTab>("market");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch real stock data
  const { stocks, isLoading } = useRealStocks({
    refreshInterval: 30000,
  });

  // Favorites
  const { favorites, isFavorite, toggleFavorite, canFavorite } = useFavorites();

  // Find stock by symbol (case-insensitive)
  const stock = useMemo(() => {
    return stocks.find(
      (s) => s.symbol.toLowerCase() === symbol?.toLowerCase() ||
             s.underlying.toLowerCase() === symbol?.toLowerCase()
    );
  }, [symbol, stocks]);

  // Filter and sort stocks for sidebar
  const filteredStocks = useMemo(() => {
    let filtered = stocks;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query) ||
          s.underlying.toLowerCase().includes(query)
      );
    }

    // Sort: favorites first, then alphabetically
    return filtered.sort((a, b) => {
      const aFav = favorites.includes(a.symbol);
      const bFav = favorites.includes(b.symbol);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.underlying.localeCompare(b.underlying);
    });
  }, [stocks, searchQuery, favorites]);

  // Show loading state
  if (isLoading && !stock) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[var(--foreground-muted)]">Loading trading terminal...</p>
        </div>
      </div>
    );
  }

  // Show not found if stock doesn't exist
  if (!stock) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">
            Stock Not Found
          </h1>
          <p className="text-[var(--foreground-muted)] mb-4">
            The stock "{symbol}" could not be found.
          </p>
          <button
            onClick={() => router.push("/trade/NVDA")}
            className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg font-medium hover:bg-[var(--accent-light)] transition-colors"
          >
            Go to NVDA
          </button>
        </div>
      </div>
    );
  }

  const { price, underlying } = stock;

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Left Sidebar - Stock List */}
      <div
        className={cn(
          "flex flex-col bg-[var(--background-secondary)] border-r border-[var(--border)] transition-all duration-300",
          sidebarCollapsed ? "w-12" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-2 border-b border-[var(--border)] shrink-0">
          {!sidebarCollapsed && (
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Stocks
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded hover:bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Search - only when expanded */}
        {!sidebarCollapsed && (
          <div className="p-2 border-b border-[var(--border)] shrink-0">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--foreground-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-8 pl-7 pr-2 text-xs rounded bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Stock List */}
        <div className="flex-1 overflow-y-auto">
          {filteredStocks.map((s) => (
            <StockSidebarItem
              key={s.id}
              stock={s}
              isActive={s.underlying.toLowerCase() === underlying.toLowerCase()}
              isCollapsed={sidebarCollapsed}
              isFavorite={isFavorite(s.symbol)}
              canFavorite={canFavorite}
              onFavoriteToggle={() => toggleFavorite(s.symbol)}
              onClick={() => router.push(`/trade/${s.underlying}`)}
            />
          ))}
        </div>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-2 border-t border-[var(--border)] shrink-0">
            <p className="text-[9px] text-[var(--foreground-subtle)] text-center">
              {stocks.length} stocks available
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Center: Chart Section */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Price Header */}
          <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background-secondary)] shrink-0">
            <div className="flex items-center justify-between gap-4">
              {/* Stock Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Token Price */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[var(--accent)] font-semibold text-base truncate">
                      {underlying}/SOL
                    </span>
                    <span className="px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] text-[9px] font-semibold uppercase rounded shrink-0">
                      Token
                    </span>
                  </div>
                  <span className="text-xl font-bold font-mono tabular-nums text-[var(--foreground)]">
                    {formatUsd(price.tokenPrice)}
                  </span>
                </div>

                <div className="h-10 w-px bg-[var(--border)] hidden sm:block" />

                {/* Stock Price */}
                <div className="hidden sm:block">
                  <div className="text-[var(--foreground-muted)] font-medium text-xs mb-0.5">
                    {underlying} Stock
                  </div>
                  <span className="text-lg font-semibold font-mono tabular-nums text-[var(--foreground-muted)]">
                    {formatUsd(price.tradFiPrice)}
                  </span>
                </div>

                <div className="h-10 w-px bg-[var(--border)] hidden sm:block" />

                {/* Spread */}
                <div className="hidden sm:block">
                  <div className="text-[var(--foreground-subtle)] text-xs mb-0.5">
                    Spread
                  </div>
                  <span className={cn(
                    "text-lg font-semibold font-mono tabular-nums",
                    price.spread >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
                  )}>
                    {price.spread >= 0 ? "+" : ""}{price.spread.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Market Badge */}
              <div className="hidden md:block border border-[var(--accent)] text-[var(--accent)] text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded shrink-0">
                24/7 Market
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 p-3 bg-[var(--background)] min-h-0">
            <TradingChart symbol={underlying} fullscreen />
          </div>
        </div>

        {/* Right: Panels */}
        <div className="w-full lg:w-[320px] flex flex-col bg-[var(--background-card)] border-t lg:border-t-0 lg:border-l border-[var(--border)] min-h-0 overflow-hidden">
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
            {activeTab === "news" && <NewsFeed symbol={underlying} />}
          </div>

          {/* Trading Panel */}
          <div className="shrink-0 border-t border-[var(--border)]">
            <TradingPanel stock={stock} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stock Sidebar Item Component
interface StockSidebarItemProps {
  stock: StockWithPrice;
  isActive: boolean;
  isCollapsed: boolean;
  isFavorite: boolean;
  canFavorite: boolean;
  onFavoriteToggle: () => void;
  onClick: () => void;
}

function StockSidebarItem({
  stock,
  isActive,
  isCollapsed,
  isFavorite,
  canFavorite,
  onFavoriteToggle,
  onClick,
}: StockSidebarItemProps) {
  const { underlying, price } = stock;
  const isPositive = price.spread >= 0;

  if (isCollapsed) {
    // Collapsed view - just symbol
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full p-2 flex items-center justify-center transition-colors",
          isActive
            ? "bg-[var(--accent)]/10 text-[var(--accent)]"
            : "text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]"
        )}
        title={`${underlying} - ${formatUsd(price.tokenPrice)}`}
      >
        <span className="text-[10px] font-bold">
          {underlying.slice(0, 4)}
        </span>
      </button>
    );
  }

  // Expanded view
  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors",
        isActive
          ? "bg-[var(--accent)]/10 border-l-2 border-[var(--accent)]"
          : "hover:bg-[var(--background-tertiary)] border-l-2 border-transparent"
      )}
      onClick={onClick}
    >
      {/* Favorite Star */}
      {canFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          className={cn(
            "p-0.5 rounded transition-colors shrink-0",
            isFavorite
              ? "text-[var(--accent)]"
              : "text-[var(--foreground-subtle)] opacity-0 group-hover:opacity-100"
          )}
        >
          <StarIcon className="w-3 h-3" filled={isFavorite} />
        </button>
      )}

      {/* Stock Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "font-semibold text-xs",
            isActive ? "text-[var(--accent)]" : "text-[var(--foreground)]"
          )}>
            {underlying}
          </span>
          {isFavorite && !canFavorite && (
            <StarIcon className="w-2.5 h-2.5 text-[var(--accent)]" filled />
          )}
        </div>
        <span className="text-[10px] text-[var(--foreground-muted)] truncate block">
          {stock.name}
        </span>
      </div>

      {/* Price & Spread */}
      <div className="text-right shrink-0">
        <div className="font-mono text-[10px] font-semibold text-[var(--foreground)]">
          {formatUsd(price.tokenPrice)}
        </div>
        <div className={cn(
          "font-mono text-[9px]",
          isPositive ? "text-[var(--positive)]" : "text-[var(--negative)]"
        )}>
          {isPositive ? "+" : ""}{price.spread.toFixed(2)}%
        </div>
      </div>
    </div>
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
        "flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-all relative",
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

// Icons
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

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

