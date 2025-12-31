"use client";

import { useEarningsData } from "@/hooks";
import { cn } from "@/lib/utils";

interface EarningsPanelProps {
  symbol: string;
}

export function EarningsPanel({ symbol }: EarningsPanelProps) {
  const { data, isLoading, error } = useEarningsData(symbol);
  const { nextEarnings, history } = data;

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--background-tertiary)] rounded w-1/3" />
          <div className="h-16 bg-[var(--background-tertiary)] rounded" />
          <div className="h-4 bg-[var(--background-tertiary)] rounded w-1/2" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-[var(--background-tertiary)] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || (!nextEarnings && history.length === 0)) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-[var(--foreground-subtle)]">
          {error || "No earnings data available"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      {/* Next Earnings */}
      {nextEarnings && (
        <div className="bg-[var(--background-tertiary)] rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                Next Earnings
              </span>
              {nextEarnings.daysUntil <= 14 && (
                <span className="text-[9px] px-2 py-0.5 bg-[var(--accent)]/20 text-[var(--accent)] rounded font-medium">
                  Coming Soon
                </span>
              )}
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-lg font-bold text-[var(--foreground)]">
                  {formatDate(nextEarnings.date)}
                </p>
                <p className="text-[9px] text-[var(--foreground-subtle)]">
                  {nextEarnings.hour}
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-2xl font-bold font-mono",
                  nextEarnings.daysUntil <= 7 ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                )}>
                  {nextEarnings.daysUntil}
                </p>
                <p className="text-[9px] text-[var(--foreground-subtle)]">days until</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-[var(--background-secondary)] rounded">
                <p className="text-[8px] text-[var(--foreground-subtle)]">EPS Estimate</p>
                <p className="text-xs font-mono font-semibold text-[var(--foreground)]">
                  {nextEarnings.epsEstimate !== null 
                    ? `$${nextEarnings.epsEstimate.toFixed(2)}` 
                    : "—"
                  }
                </p>
              </div>
              <div className="p-2 bg-[var(--background-secondary)] rounded">
                <p className="text-[8px] text-[var(--foreground-subtle)]">Quarter</p>
                <p className="text-xs font-mono font-semibold text-[var(--foreground)]">
                  Q{nextEarnings.quarter} {nextEarnings.year}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earnings History */}
      {history.length > 0 && (
        <div className="bg-[var(--background-tertiary)] rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Earnings History
            </span>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {history.slice(0, 6).map((item, index) => (
              <div key={index} className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Beat/Miss Indicator */}
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[9px]",
                    item.beat === true && "bg-[var(--positive)]/20 text-[var(--positive)]",
                    item.beat === false && "bg-[var(--negative)]/20 text-[var(--negative)]",
                    item.beat === null && "bg-[var(--background-secondary)] text-[var(--foreground-subtle)]"
                  )}>
                    {item.beat === true ? "✓" : item.beat === false ? "✗" : "—"}
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-[var(--foreground)]">
                      Q{item.quarter} {item.year}
                    </p>
                    <p className="text-[8px] text-[var(--foreground-subtle)]">
                      {item.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-[var(--foreground-subtle)]">
                      Est: {item.epsEstimate !== null ? `$${item.epsEstimate.toFixed(2)}` : "—"}
                    </span>
                    <span className="font-mono font-semibold text-[var(--foreground)]">
                      Act: {item.epsActual !== null ? `$${item.epsActual.toFixed(2)}` : "—"}
                    </span>
                  </div>
                  {item.epsSurprisePercent !== null && (
                    <p className={cn(
                      "text-[9px] font-mono",
                      item.epsSurprisePercent >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
                    )}>
                      {item.epsSurprisePercent >= 0 ? "+" : ""}{item.epsSurprisePercent.toFixed(1)}% surprise
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Beat Rate Summary */}
          {history.length >= 4 && (
            <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--background-secondary)]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[var(--foreground-subtle)]">Beat Rate (Last {Math.min(history.length, 8)} Quarters)</span>
                <span className={cn(
                  "text-[10px] font-bold font-mono",
                  calculateBeatRate(history) >= 75 ? "text-[var(--positive)]" :
                  calculateBeatRate(history) >= 50 ? "text-yellow-500" : "text-[var(--negative)]"
                )}>
                  {calculateBeatRate(history)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric",
    year: "numeric"
  });
}

function calculateBeatRate(history: Array<{ beat: boolean | null }>): number {
  const validResults = history.filter(h => h.beat !== null);
  if (validResults.length === 0) return 0;
  const beats = validResults.filter(h => h.beat === true).length;
  return Math.round((beats / validResults.length) * 100);
}

