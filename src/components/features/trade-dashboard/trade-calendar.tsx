"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatUsd } from "@/lib/utils/format";
import { getCalendarDays, formatMonthName } from "@/hooks/use-trade-statistics";
import type { TradeDisplay } from "@/types/trade";
import { cn } from "@/lib/utils";

interface TradeCalendarProps {
  tradesByDate: Map<string, TradeDisplay[]>;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TradeCalendar({ tradesByDate }: TradeCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const selectedTrades = selectedDate ? tradesByDate.get(selectedDate) || [] : [];

  // Calculate total buy/sell for the month
  const monthlyStats = useMemo(() => {
    let buyCount = 0;
    let sellCount = 0;
    let totalVolume = 0;

    for (const day of calendarDays) {
      if (day) {
        const dateKey = formatDateKey(day);
        const trades = tradesByDate.get(dateKey) || [];
        for (const trade of trades) {
          if (trade.type === "buy") buyCount++;
          else sellCount++;
          totalVolume += trade.usdcAmount;
        }
      }
    }

    return { buyCount, sellCount, totalVolume };
  }, [calendarDays, tradesByDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[var(--accent)]" />
            Trade Calendar
          </h3>
          <button
            onClick={goToToday}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 hover:bg-[var(--background-tertiary)] rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-[var(--foreground-muted)]" />
          </button>
          
          <span className="text-sm font-medium text-[var(--foreground)]">
            {formatMonthName(year, month)}
          </span>
          
          <button
            onClick={goToNextMonth}
            className="p-1.5 hover:bg-[var(--background-tertiary)] rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-[var(--foreground-muted)]" />
          </button>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-b border-[var(--border)]">
        <div className="p-3 text-center">
          <div className="text-xs text-[var(--foreground-muted)]">Buys</div>
          <div className="font-semibold text-[var(--positive)]">{monthlyStats.buyCount}</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xs text-[var(--foreground-muted)]">Sells</div>
          <div className="font-semibold text-[var(--negative)]">{monthlyStats.sellCount}</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xs text-[var(--foreground-muted)]">Volume</div>
          <div className="font-semibold text-[var(--foreground)] text-sm">{formatUsd(monthlyStats.totalVolume)}</div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-[var(--border)]">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-[10px] font-medium text-[var(--foreground-muted)] uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="p-2 h-12" />;
          }

          const dateKey = formatDateKey(day);
          const trades = tradesByDate.get(dateKey) || [];
          const hasTrades = trades.length > 0;
          const isToday = dateKey === formatDateKey(new Date());
          const isSelected = selectedDate === dateKey;
          
          // Count buy/sell
          const buyCount = trades.filter(t => t.type === "buy").length;
          const sellCount = trades.filter(t => t.type === "sell").length;

          return (
            <motion.button
              key={dateKey}
              onClick={() => setSelectedDate(isSelected ? null : dateKey)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-1 h-12 flex flex-col items-center justify-center relative transition-colors",
                isSelected && "bg-[var(--accent)]/20",
                !isSelected && hasTrades && "hover:bg-[var(--background-tertiary)]",
                !hasTrades && "opacity-50 cursor-default"
              )}
            >
              <span className={cn(
                "text-xs font-medium",
                isToday && "text-[var(--accent)]",
                isSelected && "text-[var(--accent)]",
                !isToday && !isSelected && "text-[var(--foreground)]"
              )}>
                {day.getDate()}
              </span>
              
              {/* Trade indicators */}
              {hasTrades && (
                <div className="flex gap-0.5 mt-0.5">
                  {buyCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)]" />
                  )}
                  {sellCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--negative)]" />
                  )}
                </div>
              )}
              
              {/* Today indicator */}
              {isToday && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Date Trades */}
      <AnimatePresence>
        {selectedDate && selectedTrades.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[var(--border)] overflow-hidden"
          >
            <div className="p-3">
              <div className="text-xs font-medium text-[var(--foreground-muted)] mb-2">
                {new Date(selectedDate).toLocaleDateString("en-US", { 
                  weekday: "long", 
                  month: "long", 
                  day: "numeric" 
                })}
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedTrades.map((trade, idx) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-2 bg-[var(--background-tertiary)] rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                        trade.type === "buy" 
                          ? "bg-[var(--positive)]/20 text-[var(--positive)]" 
                          : "bg-[var(--negative)]/20 text-[var(--negative)]"
                      )}>
                        {trade.type.toUpperCase()}
                      </span>
                      <span className="text-xs font-medium text-[var(--foreground)]">
                        {trade.symbol}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-[var(--foreground)]">
                        {formatUsd(trade.usdcAmount)}
                      </div>
                      <div className="text-[9px] text-[var(--foreground-muted)]">
                        {trade.tokenAmount.toFixed(4)} tokens
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="p-3 border-t border-[var(--border)] flex items-center justify-center gap-4 text-[10px] text-[var(--foreground-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--positive)]" />
          Buy
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--negative)]" />
          Sell
        </div>
      </div>
    </motion.div>
  );
}

// Icons
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

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

