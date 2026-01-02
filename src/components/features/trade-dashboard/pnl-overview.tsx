"use client";

import { motion } from "framer-motion";
import { formatUsd } from "@/lib/utils/format";
import type { TradeStatistics } from "@/hooks/use-trade-statistics";
import { cn } from "@/lib/utils";

interface PnLOverviewProps {
  stats: TradeStatistics;
}

export function PnLOverview({ stats }: PnLOverviewProps) {
  const {
    totalBuyValue,
    totalSellValue,
    realizedPnL,
    realizedPnLPercent,
    totalTrades,
    buyTrades,
    sellTrades,
    successRate,
    averageTradeSize,
    mostTradedStock,
  } = stats;

  const isProfitable = realizedPnL >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Realized PnL - Main Stat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
        className="col-span-2 sm:col-span-1 p-4 sm:p-5 bg-[var(--background-card)] border border-[var(--border)] rounded-xl relative overflow-hidden"
      >
        {/* Glow effect based on profit/loss */}
        <div 
          className={cn(
            "absolute inset-0 opacity-20 blur-xl",
            isProfitable ? "bg-[var(--positive)]" : "bg-[var(--negative)]"
          )} 
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isProfitable ? "bg-[var(--positive)]/20" : "bg-[var(--negative)]/20"
            )}>
              {isProfitable ? (
                <TrendUpIcon className="w-4 h-4 text-[var(--positive)]" />
              ) : (
                <TrendDownIcon className="w-4 h-4 text-[var(--negative)]" />
              )}
            </div>
            <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
              Realized P&L
            </span>
          </div>
          <div className={cn(
            "text-2xl sm:text-3xl font-bold font-mono tabular-nums",
            isProfitable ? "text-[var(--positive)]" : "text-[var(--negative)]"
          )}>
            {isProfitable ? "+" : ""}{formatUsd(realizedPnL)}
          </div>
          <div className={cn(
            "text-sm font-mono mt-1",
            isProfitable ? "text-[var(--positive)]" : "text-[var(--negative)]"
          )}>
            {isProfitable ? "+" : ""}{realizedPnLPercent.toFixed(2)}%
          </div>
        </div>
      </motion.div>

      {/* Total Volume */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="p-4 sm:p-5 bg-[var(--background-card)] border border-[var(--border)] rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
            <ChartIcon className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
            Volume
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-[var(--foreground)] font-mono tabular-nums">
          {formatUsd(totalBuyValue + totalSellValue)}
        </div>
        <div className="text-xs text-[var(--foreground-muted)] mt-1">
          All time
        </div>
      </motion.div>

      {/* Buy Volume */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-4 sm:p-5 bg-[var(--background-card)] border border-[var(--border)] rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--positive)]/20 flex items-center justify-center">
            <ArrowDownIcon className="w-4 h-4 text-[var(--positive)]" />
          </div>
          <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
            Bought
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-[var(--foreground)] font-mono tabular-nums">
          {formatUsd(totalBuyValue)}
        </div>
        <div className="text-xs text-[var(--foreground-muted)] mt-1">
          {buyTrades} trades
        </div>
      </motion.div>

      {/* Sell Volume */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="p-4 sm:p-5 bg-[var(--background-card)] border border-[var(--border)] rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--negative)]/20 flex items-center justify-center">
            <ArrowUpIcon className="w-4 h-4 text-[var(--negative)]" />
          </div>
          <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
            Sold
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-[var(--foreground)] font-mono tabular-nums">
          {formatUsd(totalSellValue)}
        </div>
        <div className="text-xs text-[var(--foreground-muted)] mt-1">
          {sellTrades} trades
        </div>
      </motion.div>

      {/* Total Trades */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="p-4 sm:p-5 bg-[var(--background-card)] border border-[var(--border)] rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--foreground-subtle)]/20 flex items-center justify-center">
            <StackIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
          </div>
          <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
            Trades
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-[var(--foreground)] font-mono tabular-nums">
          {totalTrades}
        </div>
        <div className="text-xs text-[var(--foreground-muted)] mt-1">
          Total executed
        </div>
      </motion.div>

      {/* Average Trade Size */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="p-4 sm:p-5 bg-[var(--background-card)] border border-[var(--border)] rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
            <AvgIcon className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
            Avg Size
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-[var(--foreground)] font-mono tabular-nums">
          {formatUsd(averageTradeSize)}
        </div>
        <div className="text-xs text-[var(--foreground-muted)] mt-1">
          Per trade
        </div>
      </motion.div>

      {/* Success Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="p-4 sm:p-5 bg-[var(--background-card)] border border-[var(--border)] rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--positive)]/20 flex items-center justify-center">
            <CheckIcon className="w-4 h-4 text-[var(--positive)]" />
          </div>
          <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
            Success
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-[var(--foreground)] font-mono tabular-nums">
          {successRate.toFixed(0)}%
        </div>
        <div className="text-xs text-[var(--foreground-muted)] mt-1">
          Confirmed trades
        </div>
      </motion.div>

      {/* Most Traded */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="p-4 sm:p-5 bg-[var(--background-card)] border border-[var(--border)] rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
            <StarIcon className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
            Favorite
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-[var(--accent)] font-mono">
          {mostTradedStock || "—"}
        </div>
        <div className="text-xs text-[var(--foreground-muted)] mt-1">
          Most traded
        </div>
      </motion.div>
    </div>
  );
}

// Icons
function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

function StackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function AvgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

