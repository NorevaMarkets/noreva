"use client";

import { useStockFundamentals } from "@/hooks";
import { cn } from "@/lib/utils";

interface FundamentalsPanelProps {
  symbol: string;
}

export function FundamentalsPanel({ symbol }: FundamentalsPanelProps) {
  const { data, isLoading, error } = useStockFundamentals(symbol);
  const { profile, metrics } = data;

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--background-tertiary)] rounded w-1/3" />
          <div className="h-3 bg-[var(--background-tertiary)] rounded w-full" />
          <div className="h-3 bg-[var(--background-tertiary)] rounded w-2/3" />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-[var(--background-tertiary)] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || (!profile && !metrics)) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-[var(--foreground-subtle)]">
          {error || "No fundamental data available"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Header with Company Info */}
      {profile && (
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-3">
            {profile.logo && (
              <img
                src={profile.logo}
                alt={profile.name}
                className="w-10 h-10 rounded-lg bg-[var(--background-tertiary)] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-[var(--foreground)] truncate">
                {profile.name}
              </h3>
              <p className="text-[10px] text-[var(--foreground-muted)]">
                {profile.exchange} · {profile.industry}
              </p>
            </div>
          </div>
          
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[var(--accent)] hover:underline truncate block"
            >
              {profile.website.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          )}
        </div>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="space-y-3">
          {/* Valuation Section */}
          <MetricSection title="Valuation">
            <MetricRow 
              label="P/E Ratio" 
              value={metrics.peTTM} 
              format="number"
              highlight={metrics.peTTM !== null && metrics.peTTM < 20}
            />
            <MetricRow 
              label="P/S Ratio" 
              value={metrics.psRatio} 
              format="number"
            />
            <MetricRow 
              label="P/B Ratio" 
              value={metrics.pbRatio} 
              format="number"
            />
          </MetricSection>

          {/* Profitability Section */}
          <MetricSection title="Profitability">
            <MetricRow 
              label="EPS (TTM)" 
              value={metrics.epsTTM} 
              format="currency"
            />
            <MetricRow 
              label="Profit Margin" 
              value={metrics.netProfitMargin} 
              format="percent"
              highlight={metrics.netProfitMargin !== null && metrics.netProfitMargin > 15}
            />
            <MetricRow 
              label="ROE" 
              value={metrics.roe} 
              format="percent"
              highlight={metrics.roe !== null && metrics.roe > 15}
            />
            <MetricRow 
              label="ROA" 
              value={metrics.roa} 
              format="percent"
            />
          </MetricSection>

          {/* Dividend Section */}
          {(metrics.dividendYield !== null || metrics.payoutRatio !== null) && (
            <MetricSection title="Dividend">
              <MetricRow 
                label="Dividend Yield" 
                value={metrics.dividendYield} 
                format="percent"
                highlight={metrics.dividendYield !== null && metrics.dividendYield > 2}
              />
              <MetricRow 
                label="Payout Ratio" 
                value={metrics.payoutRatio} 
                format="percent"
              />
            </MetricSection>
          )}

          {/* Price Performance */}
          <MetricSection title="52 Week Range">
            <div className="px-2 py-1.5">
              <div className="flex justify-between text-[9px] text-[var(--foreground-subtle)] mb-1">
                <span>${metrics.week52Low?.toFixed(2) || "—"}</span>
                <span>${metrics.week52High?.toFixed(2) || "—"}</span>
              </div>
              {metrics.week52Low && metrics.week52High && (
                <div className="h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--negative)] via-[var(--accent)] to-[var(--positive)]"
                    style={{ width: "100%" }}
                  />
                </div>
              )}
            </div>
            <MetricRow 
              label="52W Return" 
              value={metrics.week52Return} 
              format="percent"
              colorCode
            />
            <MetricRow 
              label="Beta" 
              value={metrics.beta} 
              format="number"
            />
          </MetricSection>

          {/* Financial Health */}
          <MetricSection title="Financial Health">
            <MetricRow 
              label="Current Ratio" 
              value={metrics.currentRatio} 
              format="number"
              highlight={metrics.currentRatio !== null && metrics.currentRatio > 1.5}
            />
            <MetricRow 
              label="Debt/Equity" 
              value={metrics.debtToEquity} 
              format="number"
              warning={metrics.debtToEquity !== null && metrics.debtToEquity > 2}
            />
          </MetricSection>
        </div>
      )}

    </div>
  );
}

interface MetricSectionProps {
  title: string;
  children: React.ReactNode;
}

function MetricSection({ title, children }: MetricSectionProps) {
  return (
    <div className="bg-[var(--background-tertiary)] rounded-lg overflow-hidden">
      <div className="px-2 py-1.5 border-b border-[var(--border)]">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          {title}
        </span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {children}
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: number | null;
  format: "number" | "currency" | "percent";
  highlight?: boolean;
  warning?: boolean;
  colorCode?: boolean;
}

function MetricRow({ label, value, format, highlight, warning, colorCode }: MetricRowProps) {
  const formatValue = (val: number | null): string => {
    if (val === null || val === undefined || isNaN(val)) return "—";
    
    switch (format) {
      case "currency":
        return `$${val.toFixed(2)}`;
      case "percent":
        return `${val.toFixed(2)}%`;
      case "number":
      default:
        return val.toFixed(2);
    }
  };

  const valueColor = colorCode && value !== null
    ? value >= 0 
      ? "text-[var(--positive)]" 
      : "text-[var(--negative)]"
    : highlight 
      ? "text-[var(--positive)]"
      : warning
        ? "text-[var(--negative)]"
        : "text-[var(--foreground)]";

  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <span className="text-[10px] text-[var(--foreground-muted)]">{label}</span>
      <span className={cn("text-[10px] font-mono tabular-nums font-medium", valueColor)}>
        {colorCode && value !== null && value > 0 ? "+" : ""}
        {formatValue(value)}
      </span>
    </div>
  );
}

