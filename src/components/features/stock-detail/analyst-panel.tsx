"use client";

import { useAnalystData } from "@/hooks";
import { cn } from "@/lib/utils";

interface AnalystPanelProps {
  symbol: string;
}

export function AnalystPanel({ symbol }: AnalystPanelProps) {
  const { data, isLoading, error } = useAnalystData(symbol);
  const { recommendations, priceTarget } = data;

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--background-tertiary)] rounded w-1/3" />
          <div className="h-20 bg-[var(--background-tertiary)] rounded" />
          <div className="h-4 bg-[var(--background-tertiary)] rounded w-1/2" />
          <div className="h-16 bg-[var(--background-tertiary)] rounded" />
        </div>
      </div>
    );
  }

  if (error || (!recommendations && !priceTarget)) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-[var(--foreground-subtle)]">
          {error || "No analyst data available"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      {/* Analyst Recommendations */}
      {recommendations && recommendations.total > 0 && (
        <div className="bg-[var(--background-tertiary)] rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                Analyst Ratings
              </span>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded",
                recommendations.consensus === "Strong Buy" && "bg-[var(--positive)]/20 text-[var(--positive)]",
                recommendations.consensus === "Buy" && "bg-[var(--positive)]/10 text-[var(--positive)]",
                recommendations.consensus === "Hold" && "bg-yellow-500/10 text-yellow-500",
                recommendations.consensus === "Sell" && "bg-[var(--negative)]/10 text-[var(--negative)]",
                recommendations.consensus === "Strong Sell" && "bg-[var(--negative)]/20 text-[var(--negative)]",
              )}>
                {recommendations.consensus}
              </span>
            </div>
          </div>

          <div className="p-3">
            {/* Rating Bar */}
            <div className="mb-3">
              <div className="flex h-3 rounded-full overflow-hidden bg-[var(--background-secondary)]">
                {recommendations.strongBuy > 0 && (
                  <div 
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${(recommendations.strongBuy / recommendations.total) * 100}%` }}
                    title={`Strong Buy: ${recommendations.strongBuy}`}
                  />
                )}
                {recommendations.buy > 0 && (
                  <div 
                    className="bg-green-400 transition-all"
                    style={{ width: `${(recommendations.buy / recommendations.total) * 100}%` }}
                    title={`Buy: ${recommendations.buy}`}
                  />
                )}
                {recommendations.hold > 0 && (
                  <div 
                    className="bg-yellow-400 transition-all"
                    style={{ width: `${(recommendations.hold / recommendations.total) * 100}%` }}
                    title={`Hold: ${recommendations.hold}`}
                  />
                )}
                {recommendations.sell > 0 && (
                  <div 
                    className="bg-orange-400 transition-all"
                    style={{ width: `${(recommendations.sell / recommendations.total) * 100}%` }}
                    title={`Sell: ${recommendations.sell}`}
                  />
                )}
                {recommendations.strongSell > 0 && (
                  <div 
                    className="bg-red-500 transition-all"
                    style={{ width: `${(recommendations.strongSell / recommendations.total) * 100}%` }}
                    title={`Strong Sell: ${recommendations.strongSell}`}
                  />
                )}
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="grid grid-cols-5 gap-1 text-center">
              <RatingItem label="Strong Buy" count={recommendations.strongBuy} color="text-emerald-500" />
              <RatingItem label="Buy" count={recommendations.buy} color="text-green-400" />
              <RatingItem label="Hold" count={recommendations.hold} color="text-yellow-400" />
              <RatingItem label="Sell" count={recommendations.sell} color="text-orange-400" />
              <RatingItem label="Strong Sell" count={recommendations.strongSell} color="text-red-500" />
            </div>

            <p className="text-[8px] text-[var(--foreground-subtle)] text-center mt-2">
              Based on {recommendations.total} analyst{recommendations.total !== 1 ? "s" : ""} · {recommendations.period}
            </p>
          </div>
        </div>
      )}

      {/* Price Targets */}
      {priceTarget && (
        <div className="bg-[var(--background-tertiary)] rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Price Targets
            </span>
          </div>

          <div className="p-3">
            {/* Price Target Range */}
            <div className="relative mb-4">
              <div className="flex justify-between text-[9px] text-[var(--foreground-subtle)] mb-1">
                <span>${priceTarget.low.toFixed(2)}</span>
                <span>${priceTarget.high.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-gradient-to-r from-[var(--negative)] via-[var(--accent)] to-[var(--positive)] rounded-full" />
              
              {/* Mean marker */}
              {priceTarget.mean && (
                <div 
                  className="absolute top-5 transform -translate-x-1/2"
                  style={{ 
                    left: `${((priceTarget.mean - priceTarget.low) / (priceTarget.high - priceTarget.low)) * 100}%` 
                  }}
                >
                  <div className="w-0.5 h-3 bg-white rounded" />
                  <span className="text-[9px] font-mono text-[var(--foreground)] whitespace-nowrap">
                    ${priceTarget.mean.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Price Target Stats */}
            <div className="grid grid-cols-2 gap-2 mt-6">
              <div className="text-center p-2 bg-[var(--background-secondary)] rounded">
                <p className="text-[9px] text-[var(--foreground-subtle)]">Average Target</p>
                <p className="text-sm font-bold font-mono text-[var(--foreground)]">
                  ${priceTarget.mean.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-2 bg-[var(--background-secondary)] rounded">
                <p className="text-[9px] text-[var(--foreground-subtle)]">Potential Upside</p>
                <p className={cn(
                  "text-sm font-bold font-mono",
                  priceTarget.upside && priceTarget.upside >= 0 
                    ? "text-[var(--positive)]" 
                    : "text-[var(--negative)]"
                )}>
                  {priceTarget.upside 
                    ? `${priceTarget.upside >= 0 ? "+" : ""}${priceTarget.upside.toFixed(1)}%`
                    : "—"
                  }
                </p>
              </div>
            </div>

            {priceTarget.currentPrice && (
              <p className="text-[8px] text-[var(--foreground-subtle)] text-center mt-2">
                Current price: ${priceTarget.currentPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface RatingItemProps {
  label: string;
  count: number;
  color: string;
}

function RatingItem({ label, count, color }: RatingItemProps) {
  return (
    <div>
      <p className={cn("text-sm font-bold font-mono", color)}>{count}</p>
      <p className="text-[7px] text-[var(--foreground-subtle)] leading-tight">{label}</p>
    </div>
  );
}

