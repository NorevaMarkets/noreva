"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { formatUsd } from "@/lib/utils/format";
import type { StockStatistics } from "@/hooks/use-trade-statistics";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StockBreakdownProps {
  stockStats: Map<string, StockStatistics>;
}

export function StockBreakdown({ stockStats }: StockBreakdownProps) {
  // Convert map to sorted array
  const sortedStocks = useMemo(() => {
    return Array.from(stockStats.values())
      .sort((a, b) => b.totalBuyValue + b.totalSellValue - (a.totalBuyValue + a.totalSellValue));
  }, [stockStats]);

  if (sortedStocks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl p-6 text-center"
      >
        <EmptyIcon className="w-10 h-10 text-[var(--foreground-subtle)] mx-auto mb-3" />
        <p className="text-sm text-[var(--foreground-muted)]">
          No stock data to display yet
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-[var(--accent)]" />
          Stock Breakdown
        </h3>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">
          Average purchase price & realized P&L per stock
        </p>
      </div>

      {/* Stock List */}
      <div className="divide-y divide-[var(--border)]">
        {sortedStocks.map((stock, index) => (
          <StockRow key={stock.symbol} stock={stock} index={index} />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--background-tertiary)]">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-[10px] text-[var(--foreground-muted)] uppercase">Stocks Traded</div>
            <div className="font-semibold text-[var(--foreground)]">{sortedStocks.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--foreground-muted)] uppercase">Total Trades</div>
            <div className="font-semibold text-[var(--foreground)]">
              {sortedStocks.reduce((sum, s) => sum + s.tradeCount, 0)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--foreground-muted)] uppercase">Total P&L</div>
            <div className={cn(
              "font-semibold font-mono",
              sortedStocks.reduce((sum, s) => sum + s.realizedPnL, 0) >= 0
                ? "text-[var(--positive)]"
                : "text-[var(--negative)]"
            )}>
              {formatUsd(sortedStocks.reduce((sum, s) => sum + s.realizedPnL, 0))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface StockRowProps {
  stock: StockStatistics;
  index: number;
}

function StockRow({ stock, index }: StockRowProps) {
  const {
    symbol,
    stockName,
    totalBought,
    totalSold,
    avgBuyPrice,
    avgSellPrice,
    currentHolding,
    totalBuyValue,
    totalSellValue,
    realizedPnL,
    tradeCount,
  } = stock;

  const isProfitable = realizedPnL >= 0;
  const hasOpenPosition = currentHolding > 0.0001;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={`/stock/${symbol}`}
        className="block p-4 hover:bg-[var(--background-tertiary)] transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
              <span className="text-sm font-bold text-[var(--accent)]">
                {symbol.slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--foreground)]">{symbol}</span>
                {hasOpenPosition && (
                  <span className="px-1.5 py-0.5 text-[9px] font-medium bg-[var(--accent)]/20 text-[var(--accent)] rounded">
                    HOLDING
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--foreground-muted)]">{stockName}</span>
            </div>
          </div>
          
          {/* P&L Badge */}
          <div className={cn(
            "px-2 py-1 rounded-lg text-right",
            isProfitable ? "bg-[var(--positive)]/10" : "bg-[var(--negative)]/10"
          )}>
            <div className={cn(
              "text-sm font-bold font-mono",
              isProfitable ? "text-[var(--positive)]" : "text-[var(--negative)]"
            )}>
              {isProfitable ? "+" : ""}{formatUsd(realizedPnL)}
            </div>
            <div className="text-[9px] text-[var(--foreground-muted)]">
              Realized P&L
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCell 
            label="Avg Buy Price" 
            value={avgBuyPrice > 0 ? formatUsd(avgBuyPrice) : "—"} 
            highlight
          />
          <StatCell 
            label="Avg Sell Price" 
            value={avgSellPrice > 0 ? formatUsd(avgSellPrice) : "—"} 
          />
          <StatCell 
            label="Total Bought" 
            value={`${totalBought.toFixed(4)} tokens`}
            subValue={formatUsd(totalBuyValue)}
          />
          <StatCell 
            label="Total Sold" 
            value={`${totalSold.toFixed(4)} tokens`}
            subValue={formatUsd(totalSellValue)}
          />
        </div>

        {/* Bottom Stats */}
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="text-[var(--foreground-muted)]">
              <span className="font-medium text-[var(--foreground)]">{tradeCount}</span> trades
            </div>
            {hasOpenPosition && (
              <div className="text-[var(--foreground-muted)]">
                Holding: <span className="font-medium text-[var(--accent)]">{currentHolding.toFixed(4)}</span>
              </div>
            )}
          </div>
          <ChevronRightIcon className="w-4 h-4 text-[var(--foreground-subtle)]" />
        </div>
      </Link>
    </motion.div>
  );
}

interface StatCellProps {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
}

function StatCell({ label, value, subValue, highlight }: StatCellProps) {
  return (
    <div className="p-2 bg-[var(--background-tertiary)] rounded-lg">
      <div className="text-[9px] text-[var(--foreground-muted)] uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className={cn(
        "text-xs font-mono font-medium",
        highlight ? "text-[var(--accent)]" : "text-[var(--foreground)]"
      )}>
        {value}
      </div>
      {subValue && (
        <div className="text-[9px] text-[var(--foreground-subtle)] mt-0.5">
          {subValue}
        </div>
      )}
    </div>
  );
}

// Icons
function PieChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  );
}

function EmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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

