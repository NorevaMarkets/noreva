"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StockTable } from "@/components/features/stock-list";
import { SearchInput } from "@/components/ui/search-input";
import { useRealStocks } from "@/hooks";
import { formatNumber } from "@/lib/utils/format";

// Asset type filter options
type AssetFilter = "all" | "stocks" | "etfs";

// ETF symbols for filtering
const ETF_SYMBOLS = ["SPY", "QQQ", "IWM", "DIA", "VTI"];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");

  // Fetch real stock data
  const { stocks, isLoading, isError, errorDetails, source, sources, hasRealTokenPrices, refresh } = useRealStocks({
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate stats from real data
  const totalVolume = useMemo(
    () => stocks.reduce((acc, s) => acc + s.price.volume24h, 0),
    [stocks]
  );
  const totalMarketCap = useMemo(
    () => stocks.reduce((acc, s) => acc + s.price.marketCap, 0),
    [stocks]
  );
  const avgSpread = useMemo(() => {
    if (stocks.length === 0) return 0;
    const totalSpread = stocks.reduce((acc, s) => acc + Math.abs(s.price.spread), 0);
    return totalSpread / stocks.length;
  }, [stocks]);

  // Filter stocks based on asset type and search query
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query) ||
          stock.underlying.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      // Asset type filter
      if (assetFilter === "all") return true;
      const isEtf = ETF_SYMBOLS.includes(stock.underlying);
      return assetFilter === "etfs" ? isEtf : !isEtf;
    });
  }, [stocks, searchQuery, assetFilter]);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Trading Terminal Style */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero2.png')" }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-[var(--background)]/70" />
        {/* Bottom fade gradient for seamless transition */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
            {/* Left: Text content */}
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="text-[var(--foreground)]">Trade stocks.</span>
                <br />
                <span className="text-gradient">24/7.</span>
              </h1>
              
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-[var(--foreground-muted)] leading-relaxed">
                Tokenized stocks on Solana. Compare real-time prices, 
                analyze spreads, and trade when traditional markets are closed.
              </p>

              {/* CTA Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => document.getElementById('stocks')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-6 py-3 bg-[var(--accent)] text-[var(--background)] font-semibold rounded-lg hover:bg-[var(--accent-light)] transition-all shadow-lg shadow-[var(--accent)]/20 text-center"
                >
                  Start Trading
                </button>
                <a 
                  href="https://docs.noreva.markets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 border border-[var(--border)] text-[var(--foreground)] font-medium rounded-lg hover:bg-[var(--background-tertiary)] hover:border-[var(--border-hover)] transition-all text-center"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right: Stats Panel */}
            <div className="w-full lg:w-[400px]">
              <div className="relative p-4 sm:p-6 bg-[var(--background-card)] border border-[var(--border)] rounded-xl sm:rounded-2xl shadow-xl">
                {/* Glow effect */}
                <div className="absolute -inset-px bg-gradient-to-b from-[var(--accent)]/20 to-transparent rounded-2xl opacity-50 pointer-events-none" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                      Market Overview
                    </span>
                    <span className="text-[10px] text-[var(--foreground-subtle)] flex items-center gap-1">
                      {isLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : isError ? (
                        <>
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--negative)]"></span>
                          </span>
                          <span className="text-[var(--negative)]">No API Key</span>
                        </>
                      ) : (
                        <>
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--positive)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--positive)]"></span>
                          </span>
                          Live
                        </>
                      )}
                    </span>
                  </div>

                  {/* Mini chart decoration */}
                  <div className="h-16 mb-4 relative">
                    <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="heroChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 50 Q50 45, 100 40 T200 35 T300 25 T400 15 L400 60 L0 60 Z"
                        fill="url(#heroChartGrad)"
                      />
                      <path
                        d="M0 50 Q50 45, 100 40 T200 35 T300 25 T400 15"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="400" cy="15" r="4" fill="var(--accent)" />
                    </svg>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-[var(--background-tertiary)] rounded-lg sm:rounded-xl">
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--foreground-subtle)] mb-0.5 sm:mb-1">
                        24h Volume
                      </div>
                      <div className="text-base sm:text-xl font-bold font-mono tabular-nums text-[var(--foreground)]">
                        ${formatNumber(totalVolume)}
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[var(--background-tertiary)] rounded-lg sm:rounded-xl">
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--foreground-subtle)] mb-0.5 sm:mb-1">
                        Market Cap
                      </div>
                      <div className="text-base sm:text-xl font-bold font-mono tabular-nums text-[var(--foreground)]">
                        ${formatNumber(totalMarketCap)}
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[var(--background-tertiary)] rounded-lg sm:rounded-xl">
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--foreground-subtle)] mb-0.5 sm:mb-1">
                        Stocks
                      </div>
                      <div className="text-base sm:text-xl font-bold font-mono tabular-nums text-[var(--foreground)]">
                        {stocks.length}
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[var(--background-tertiary)] rounded-lg sm:rounded-xl">
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--foreground-subtle)] mb-0.5 sm:mb-1">
                        Avg Spread
                      </div>
                      <div className="text-base sm:text-xl font-bold font-mono tabular-nums text-[var(--positive)]">
                        {avgSpread.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--foreground-subtle)]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--positive)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--positive)]"></span>
                    </span>
                    Markets: Open 24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom border with gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </section>

      {/* Stock List Section */}
      <section id="stocks" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                Tokenized Stocks
              </h2>
              <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1">
                Select a stock to view charts and trade
              </p>
            </div>
            
            {/* Filter pills - visible on all screens */}
            <div className="flex items-center p-1 bg-[var(--background-tertiary)] rounded-lg shrink-0 self-start sm:self-auto">
              <FilterPill 
                active={assetFilter === "all"} 
                onClick={() => setAssetFilter("all")}
              >
                All
              </FilterPill>
              <FilterPill 
                active={assetFilter === "stocks"} 
                onClick={() => setAssetFilter("stocks")}
              >
                Stocks
              </FilterPill>
              <FilterPill 
                active={assetFilter === "etfs"} 
                onClick={() => setAssetFilter("etfs")}
              >
                ETFs
              </FilterPill>
            </div>
          </div>
          
          {/* Search - full width on mobile */}
          <div className="w-full sm:w-64">
            <SearchInput 
              placeholder="Search stocks..."
              onSearch={setSearchQuery}
            />
          </div>
        </div>

        {/* API Key Configuration Error */}
        {isError && errorDetails && (
          <div className="mb-8 p-6 bg-[var(--background-card)] border border-[var(--negative)]/30 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[var(--negative)]/10 rounded-lg shrink-0">
                <svg className="w-5 h-5 text-[var(--negative)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--foreground)] mb-1">
                  API Configuration Required
                </h3>
                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                  {errorDetails.error}
                </p>
                
                {errorDetails.instructions && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[var(--foreground-subtle)] uppercase tracking-wider">
                      Get a free API key:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {errorDetails.instructions.twelveData && (
                        <a
                          href="https://twelvedata.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--background)] text-sm font-medium rounded-lg hover:bg-[var(--accent-light)] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Twelve Data (800 calls/day)
                        </a>
                      )}
                      {errorDetails.instructions.finnhub && (
                        <a
                          href="https://finnhub.io/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--foreground)] text-sm font-medium rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Finnhub (60 calls/min)
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-[var(--foreground-subtle)] mt-3">
                      Then add your key to <code className="px-1 py-0.5 bg-[var(--background-tertiary)] rounded text-[var(--accent)]">.env.local</code>:
                      <br />
                      <code className="text-[var(--foreground-muted)]">TWELVE_DATA_API_KEY=your_key</code> or <code className="text-[var(--foreground-muted)]">FINNHUB_API_KEY=your_key</code>
                    </p>
                  </div>
                )}
                
                <button
                  onClick={refresh}
                  className="mt-4 text-sm text-[var(--accent)] hover:underline"
                >
                  Retry →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stock table - only show if we have data */}
        {!isError && (
          <>
            <StockTable 
              stocks={filteredStocks} 
              searchQuery={searchQuery}
              onStockClick={(stock) => router.push(`/stock/${stock.underlying}`)}
            />
            
            {/* Footer note */}
            <p className="text-[10px] text-[var(--foreground-subtle)] text-center mt-8 opacity-60">
              Updates every 30 seconds
            </p>
          </>
        )}
      </section>
    </div>
  );
}

interface FilterPillProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function FilterPill({ children, active = false, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
        active
          ? "bg-[var(--accent)] text-[var(--background)] shadow-sm"
          : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}
