"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TradeDisplay } from "@/types/trade";
import { useTradeStatistics } from "@/hooks/use-trade-statistics";
import { PnLOverview } from "./pnl-overview";
import { TradeCalendar } from "./trade-calendar";
import { PerformanceChart } from "./performance-chart";
import { StockBreakdown } from "./stock-breakdown";
import { cn } from "@/lib/utils";

interface TradeDashboardProps {
  trades: TradeDisplay[];
  isLoading?: boolean;
}

type DashboardTab = "overview" | "stocks" | "calendar";

export function TradeDashboard({ trades, isLoading }: TradeDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const stats = useTradeStatistics(trades);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (trades.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl p-8 text-center"
      >
        <EmptyIcon className="w-12 h-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          No Trading History
        </h3>
        <p className="text-sm text-[var(--foreground-muted)] mb-4">
          Start trading to see your performance dashboard here.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg text-sm font-medium hover:bg-[var(--accent-light)] transition-colors"
        >
          <TrendUpIcon className="w-4 h-4" />
          Start Trading
        </a>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-[var(--background-tertiary)] rounded-lg w-fit">
        <TabButton 
          active={activeTab === "overview"} 
          onClick={() => setActiveTab("overview")}
          icon={<ChartIcon className="w-4 h-4" />}
        >
          Overview
        </TabButton>
        <TabButton 
          active={activeTab === "stocks"} 
          onClick={() => setActiveTab("stocks")}
          icon={<StackIcon className="w-4 h-4" />}
        >
          Stocks
        </TabButton>
        <TabButton 
          active={activeTab === "calendar"} 
          onClick={() => setActiveTab("calendar")}
          icon={<CalendarIcon className="w-4 h-4" />}
        >
          Calendar
        </TabButton>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* PnL Overview Cards */}
            <PnLOverview stats={stats} />
            
            {/* Performance Chart */}
            <PerformanceChart 
              dailyPnL={stats.dailyPnL} 
              monthlyVolume={stats.monthlyVolume} 
            />
          </motion.div>
        )}

        {activeTab === "stocks" && (
          <motion.div
            key="stocks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <StockBreakdown stockStats={stats.stockStats} />
          </motion.div>
        )}

        {activeTab === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TradeCalendar tradesByDate={stats.tradesByDate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
        active
          ? "bg-[var(--accent)] text-[var(--background)] shadow-sm"
          : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tab skeleton */}
      <div className="h-10 w-64 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
      
      {/* Cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 bg-[var(--background-card)] border border-[var(--border)] rounded-xl animate-pulse" />
        ))}
      </div>
      
      {/* Chart skeleton */}
      <div className="h-64 bg-[var(--background-card)] border border-[var(--border)] rounded-xl animate-pulse" />
    </div>
  );
}

// Icons
function EmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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

function StackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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

