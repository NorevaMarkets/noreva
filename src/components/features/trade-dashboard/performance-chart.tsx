"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { formatUsd } from "@/lib/utils/format";
import type { DailyPnL, MonthlyVolume } from "@/hooks/use-trade-statistics";
import { cn } from "@/lib/utils";

interface PerformanceChartProps {
  dailyPnL: DailyPnL[];
  monthlyVolume: MonthlyVolume[];
}

type ChartView = "pnl" | "volume";

export function PerformanceChart({ dailyPnL, monthlyVolume }: PerformanceChartProps) {
  const [view, setView] = useState<ChartView>("pnl");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
          <ChartIcon className="w-4 h-4 text-[var(--accent)]" />
          Performance
        </h3>
        
        {/* View Toggle */}
        <div className="flex p-0.5 bg-[var(--background-tertiary)] rounded-lg">
          <button
            onClick={() => setView("pnl")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              view === "pnl"
                ? "bg-[var(--accent)] text-[var(--background)]"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            )}
          >
            P&L
          </button>
          <button
            onClick={() => setView("volume")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              view === "volume"
                ? "bg-[var(--accent)] text-[var(--background)]"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            )}
          >
            Volume
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4">
        {view === "pnl" ? (
          <PnLChart data={dailyPnL} />
        ) : (
          <VolumeChart data={monthlyVolume} />
        )}
      </div>
    </motion.div>
  );
}

function PnLChart({ data }: { data: DailyPnL[] }) {
  // Take last 30 days
  const chartData = useMemo(() => data.slice(-30), [data]);
  
  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[var(--foreground-muted)]">
        No P&L data available yet
      </div>
    );
  }

  const maxPnL = Math.max(...chartData.map(d => Math.abs(d.cumulativePnL)), 1);
  const lastPnL = chartData[chartData.length - 1]?.cumulativePnL || 0;
  const isProfitable = lastPnL >= 0;

  // Calculate SVG path
  const width = 100;
  const height = 100;
  const padding = 5;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight / 2 - (d.cumulativePnL / (maxPnL * 2)) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  const areaPath = `M${padding},${padding + chartHeight / 2} L${points} L${width - padding},${padding + chartHeight / 2} Z`;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[var(--foreground-muted)]">Cumulative P&L (30d)</div>
          <div className={cn(
            "text-xl font-bold font-mono",
            isProfitable ? "text-[var(--positive)]" : "text-[var(--negative)]"
          )}>
            {isProfitable ? "+" : ""}{formatUsd(lastPnL)}
          </div>
        </div>
        <div className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          isProfitable ? "bg-[var(--positive)]/20 text-[var(--positive)]" : "bg-[var(--negative)]/20 text-[var(--negative)]"
        )}>
          {isProfitable ? "↑" : "↓"} {Math.abs(lastPnL / (chartData[0]?.cumulativePnL || 1) * 100 - 100).toFixed(1)}%
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-32">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <line
            x1={padding}
            y1={padding + chartHeight / 2}
            x2={width - padding}
            y2={padding + chartHeight / 2}
            stroke="var(--border)"
            strokeDasharray="2"
          />
          
          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill={isProfitable ? "var(--positive)" : "var(--negative)"}
            opacity={0.1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Line */}
          <motion.polyline
            points={points}
            fill="none"
            stroke={isProfitable ? "var(--positive)" : "var(--negative)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* End point */}
          {chartData.length > 0 && (
            <motion.circle
              cx={width - padding}
              cy={padding + chartHeight / 2 - (lastPnL / (maxPnL * 2)) * chartHeight}
              r="3"
              fill={isProfitable ? "var(--positive)" : "var(--negative)"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.2 }}
            />
          )}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-[var(--foreground-subtle)] font-mono">
          <span>+{formatUsd(maxPnL)}</span>
          <span>$0</span>
          <span>-{formatUsd(maxPnL)}</span>
        </div>
      </div>

      {/* X-axis */}
      <div className="flex justify-between text-[9px] text-[var(--foreground-subtle)]">
        <span>{chartData[0]?.date ? formatShortDate(chartData[0].date) : ""}</span>
        <span>{chartData[chartData.length - 1]?.date ? formatShortDate(chartData[chartData.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}

function VolumeChart({ data }: { data: MonthlyVolume[] }) {
  // Take last 6 months
  const chartData = useMemo(() => data.slice(-6), [data]);
  
  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[var(--foreground-muted)]">
        No volume data available yet
      </div>
    );
  }

  const maxVolume = Math.max(...chartData.map(d => d.totalVolume), 1);
  const totalVolume = chartData.reduce((sum, d) => sum + d.totalVolume, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[var(--foreground-muted)]">Total Volume (6mo)</div>
          <div className="text-xl font-bold font-mono text-[var(--foreground)]">
            {formatUsd(totalVolume)}
          </div>
        </div>
        <div className="text-xs text-[var(--foreground-muted)]">
          {chartData.reduce((sum, d) => sum + d.tradeCount, 0)} trades
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-32 flex items-end gap-1 sm:gap-2">
        {chartData.map((d, i) => {
          const buyHeight = (d.buyVolume / maxVolume) * 100;
          const sellHeight = (d.sellVolume / maxVolume) * 100;
          
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              {/* Bars */}
              <div className="w-full flex gap-0.5 h-24 items-end">
                {/* Buy bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${buyHeight}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex-1 bg-[var(--positive)] rounded-t-sm min-h-[2px]"
                  title={`Buy: ${formatUsd(d.buyVolume)}`}
                />
                {/* Sell bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${sellHeight}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.05 }}
                  className="flex-1 bg-[var(--negative)] rounded-t-sm min-h-[2px]"
                  title={`Sell: ${formatUsd(d.sellVolume)}`}
                />
              </div>
              
              {/* Month label */}
              <span className="text-[9px] text-[var(--foreground-muted)]">
                {formatMonthLabel(d.month)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-[var(--foreground-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-[var(--positive)]" />
          Buy Volume
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-[var(--negative)]" />
          Sell Volume
        </div>
      </div>
    </div>
  );
}

// Helpers
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}

// Icons
function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  );
}

