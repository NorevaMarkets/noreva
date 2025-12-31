"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAnalystData, useEarningsData, useInsiderData } from "@/hooks";

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

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    analyst: false,
    earnings: false,
    insider: false,
  });

  // Copy to clipboard state
  const [copied, setCopied] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyMintAddress = async () => {
    if (!mintAddress) return;
    const addressToCopy = mintAddress.startsWith("svm:") ? mintAddress.slice(4) : mintAddress;
    try {
      await navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="p-3 flex flex-col">
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
      <div className="mb-3">
        <div className="text-[9px] text-[var(--foreground-subtle)] uppercase mb-2">
          Market Statistics
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--background-tertiary)] rounded text-[10px]">
            <span className="text-[var(--foreground-muted)]">24h Change</span>
            <span className={cn("font-mono tabular-nums font-semibold", changeColor)}>
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--background-tertiary)] rounded text-[10px]">
            <span className="text-[var(--foreground-muted)]">24h Range</span>
            <span className="font-mono tabular-nums text-[var(--foreground)]">
              ${low24h.toFixed(2)} - ${high24h.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--background-tertiary)] rounded text-[10px]">
            <span className="text-[var(--foreground-muted)]">Volume (est.)</span>
            <span className="font-mono tabular-nums text-[var(--foreground)]">
              {volume24h.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--background-tertiary)] rounded text-[10px]">
            <span className="text-[var(--foreground-muted)]">Market Cap (est.)</span>
            <span className="font-mono tabular-nums text-[var(--foreground)]">
              ${(marketCap / 1_000_000).toFixed(1)}M
            </span>
          </div>
        </div>
      </div>

      {/* Network Info */}
      <div className="mb-3 pb-3 border-b border-[var(--border)]">
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
            <button
              onClick={copyMintAddress}
              className={cn(
                "font-mono truncate max-w-[120px] transition-all duration-200 cursor-pointer",
                "hover:text-[var(--accent)] active:scale-95",
                copied 
                  ? "text-[var(--positive)]" 
                  : "text-[var(--foreground-subtle)]"
              )}
              title={`Click to copy: ${mintAddress.startsWith("svm:") ? mintAddress.slice(4) : mintAddress}`}
            >
              {copied ? (
                <span className="flex items-center gap-1">
                  <CheckIcon className="w-3 h-3" />
                  Copied!
                </span>
              ) : (
                <>
                  {mintAddress.startsWith("svm:") ? mintAddress.slice(4, 12) : mintAddress.slice(0, 8)}...
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-2">
        {/* Analyst Section */}
        <CollapsibleSection
          title="Analyst Ratings"
          icon={<TargetIcon className="w-3.5 h-3.5" />}
          expanded={expandedSections.analyst}
          onToggle={() => toggleSection("analyst")}
        >
          <AnalystContent symbol={symbol} />
        </CollapsibleSection>

        {/* Earnings Section */}
        <CollapsibleSection
          title="Earnings"
          icon={<CalendarIcon className="w-3.5 h-3.5" />}
          expanded={expandedSections.earnings}
          onToggle={() => toggleSection("earnings")}
        >
          <EarningsContent symbol={symbol} />
        </CollapsibleSection>

        {/* Insider Section */}
        <CollapsibleSection
          title="Insider Trading"
          icon={<UsersIcon className="w-3.5 h-3.5" />}
          expanded={expandedSections.insider}
          onToggle={() => toggleSection("insider")}
        >
          <InsiderContent symbol={symbol} />
        </CollapsibleSection>
      </div>
    </div>
  );
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon, expanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="bg-[var(--background-tertiary)] rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--background-elevated)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[var(--foreground-muted)]">{icon}</span>
          <span className="text-[10px] font-semibold text-[var(--foreground)]">{title}</span>
        </div>
        <ChevronIcon className={cn(
          "w-4 h-4 text-[var(--foreground-subtle)] transition-transform duration-200",
          expanded && "rotate-180"
        )} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-[var(--border)]">
          {children}
        </div>
      )}
    </div>
  );
}

// Analyst Content
function AnalystContent({ symbol }: { symbol: string }) {
  const { data, isLoading } = useAnalystData(symbol);
  const { recommendations, priceTarget } = data;

  if (isLoading) {
    return <div className="py-2 text-[9px] text-[var(--foreground-subtle)]">Loading...</div>;
  }

  if (!recommendations && !priceTarget) {
    return <div className="py-2 text-[9px] text-[var(--foreground-subtle)]">No analyst data available</div>;
  }

  return (
    <div className="pt-2 space-y-2">
      {recommendations && recommendations.total > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[var(--foreground-subtle)]">Consensus</span>
            <span className={cn(
              "text-[9px] font-bold px-1.5 py-0.5 rounded",
              recommendations.consensus === "Strong Buy" && "bg-[var(--positive)]/20 text-[var(--positive)]",
              recommendations.consensus === "Buy" && "bg-[var(--positive)]/10 text-[var(--positive)]",
              recommendations.consensus === "Hold" && "bg-yellow-500/10 text-yellow-500",
              recommendations.consensus === "Sell" && "bg-[var(--negative)]/10 text-[var(--negative)]",
              recommendations.consensus === "Strong Sell" && "bg-[var(--negative)]/20 text-[var(--negative)]",
            )}>
              {recommendations.consensus}
            </span>
          </div>
          
          {/* Rating Bar */}
          <div className="flex h-2 rounded-full overflow-hidden bg-[var(--background-secondary)]">
            {recommendations.strongBuy > 0 && (
              <div className="bg-emerald-500" style={{ width: `${(recommendations.strongBuy / recommendations.total) * 100}%` }} />
            )}
            {recommendations.buy > 0 && (
              <div className="bg-green-400" style={{ width: `${(recommendations.buy / recommendations.total) * 100}%` }} />
            )}
            {recommendations.hold > 0 && (
              <div className="bg-yellow-400" style={{ width: `${(recommendations.hold / recommendations.total) * 100}%` }} />
            )}
            {recommendations.sell > 0 && (
              <div className="bg-orange-400" style={{ width: `${(recommendations.sell / recommendations.total) * 100}%` }} />
            )}
            {recommendations.strongSell > 0 && (
              <div className="bg-red-500" style={{ width: `${(recommendations.strongSell / recommendations.total) * 100}%` }} />
            )}
          </div>

          <div className="grid grid-cols-5 gap-1 text-center text-[8px]">
            <div><span className="font-bold text-emerald-500">{recommendations.strongBuy}</span><br/>SB</div>
            <div><span className="font-bold text-green-400">{recommendations.buy}</span><br/>B</div>
            <div><span className="font-bold text-yellow-400">{recommendations.hold}</span><br/>H</div>
            <div><span className="font-bold text-orange-400">{recommendations.sell}</span><br/>S</div>
            <div><span className="font-bold text-red-500">{recommendations.strongSell}</span><br/>SS</div>
          </div>
        </>
      )}

      {priceTarget && (
        <div className="pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-[var(--foreground-subtle)]">Price Target</span>
            <span className="font-mono font-bold text-[var(--foreground)]">${priceTarget.mean.toFixed(2)}</span>
          </div>
          {priceTarget.upside !== undefined && (
            <div className="flex items-center justify-between text-[9px] mt-1">
              <span className="text-[var(--foreground-subtle)]">Upside</span>
              <span className={cn(
                "font-mono font-bold",
                priceTarget.upside >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
              )}>
                {priceTarget.upside >= 0 ? "+" : ""}{priceTarget.upside.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Earnings Content
function EarningsContent({ symbol }: { symbol: string }) {
  const { data, isLoading } = useEarningsData(symbol);
  const { nextEarnings, history } = data;

  if (isLoading) {
    return <div className="py-2 text-[9px] text-[var(--foreground-subtle)]">Loading...</div>;
  }

  if (!nextEarnings && history.length === 0) {
    return <div className="py-2 text-[9px] text-[var(--foreground-subtle)]">No earnings data available</div>;
  }

  return (
    <div className="pt-2 space-y-2">
      {nextEarnings && (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] text-[var(--foreground-subtle)]">Next Earnings</div>
            <div className="text-[10px] font-semibold text-[var(--foreground)]">
              {new Date(nextEarnings.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-lg font-bold font-mono",
              nextEarnings.daysUntil <= 14 ? "text-[var(--accent)]" : "text-[var(--foreground)]"
            )}>
              {nextEarnings.daysUntil}
            </div>
            <div className="text-[8px] text-[var(--foreground-subtle)]">days</div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="pt-2 border-t border-[var(--border)]">
          <div className="text-[8px] text-[var(--foreground-subtle)] mb-1">Recent Quarters</div>
          <div className="space-y-1">
            {history.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px]",
                    item.beat === true && "bg-[var(--positive)]/20 text-[var(--positive)]",
                    item.beat === false && "bg-[var(--negative)]/20 text-[var(--negative)]",
                    item.beat === null && "bg-[var(--background-secondary)] text-[var(--foreground-subtle)]"
                  )}>
                    {item.beat === true ? "✓" : item.beat === false ? "✗" : "—"}
                  </span>
                  <span className="text-[var(--foreground-muted)]">Q{item.quarter} {item.year}</span>
                </div>
                {item.epsSurprisePercent !== null && (
                  <span className={cn(
                    "font-mono",
                    item.epsSurprisePercent >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
                  )}>
                    {item.epsSurprisePercent >= 0 ? "+" : ""}{item.epsSurprisePercent.toFixed(1)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Insider Content
function InsiderContent({ symbol }: { symbol: string }) {
  const { data: insiderData, isLoading: insiderLoading } = useInsiderData(symbol);

  if (insiderLoading) {
    return <div className="py-2 text-[9px] text-[var(--foreground-subtle)]">Loading...</div>;
  }

  const { summary, transactions } = insiderData;

  return (
    <div className="pt-2 space-y-2">
      {/* Insider Activity Summary */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-[var(--foreground-subtle)]">90-Day Activity</span>
        <span className={cn(
          "text-[8px] px-1.5 py-0.5 rounded font-medium",
          summary.last3Months === "Buying" && "bg-[var(--positive)]/20 text-[var(--positive)]",
          summary.last3Months === "Selling" && "bg-[var(--negative)]/20 text-[var(--negative)]",
          summary.last3Months === "Mixed" && "bg-yellow-500/20 text-yellow-500",
          summary.last3Months === "No Activity" && "bg-[var(--background-secondary)] text-[var(--foreground-subtle)]",
        )}>
          {summary.last3Months}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[var(--background-secondary)] rounded p-1.5">
          <div className="text-xs font-bold font-mono text-[var(--positive)]">{summary.totalBuys}</div>
          <div className="text-[7px] text-[var(--foreground-subtle)]">Buys</div>
        </div>
        <div className="bg-[var(--background-secondary)] rounded p-1.5">
          <div className="text-xs font-bold font-mono text-[var(--negative)]">{summary.totalSells}</div>
          <div className="text-[7px] text-[var(--foreground-subtle)]">Sells</div>
        </div>
        <div className="bg-[var(--background-secondary)] rounded p-1.5">
          <div className={cn(
            "text-xs font-bold font-mono",
            summary.netShares >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
          )}>
            {summary.netShares >= 0 ? "+" : ""}{formatShares(summary.netShares)}
          </div>
          <div className="text-[7px] text-[var(--foreground-subtle)]">Net</div>
        </div>
      </div>

      {/* Recent Transaction */}
      {transactions.length > 0 && (
        <div className="text-[8px] text-[var(--foreground-subtle)]">
          Latest: {transactions[0].name.split(" ")[0]} · {transactions[0].type} · {formatShares(transactions[0].shares)} shares
        </div>
      )}
    </div>
  );
}

// Helper function
function formatShares(num: number): string {
  if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Icons
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
