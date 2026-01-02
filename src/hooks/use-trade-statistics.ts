"use client";

import { useMemo } from "react";
import type { TradeDisplay } from "@/types/trade";

export interface TradeStatistics {
  // Overall PnL
  totalBuyValue: number;
  totalSellValue: number;
  realizedPnL: number;
  realizedPnLPercent: number;
  
  // Trade counts
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
  successRate: number;
  
  // Per-stock statistics
  stockStats: Map<string, StockStatistics>;
  
  // Time-based data for charts
  dailyPnL: DailyPnL[];
  monthlyVolume: MonthlyVolume[];
  
  // Calendar data
  tradesByDate: Map<string, TradeDisplay[]>;
  
  // Recent activity
  mostTradedStock: string | null;
  lastTradeDate: Date | null;
  averageTradeSize: number;
}

export interface StockStatistics {
  symbol: string;
  stockName: string;
  totalBought: number;
  totalSold: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  currentHolding: number;
  totalBuyValue: number;
  totalSellValue: number;
  realizedPnL: number;
  tradeCount: number;
}

export interface DailyPnL {
  date: string;
  pnl: number;
  cumulativePnL: number;
  volume: number;
}

export interface MonthlyVolume {
  month: string;
  buyVolume: number;
  sellVolume: number;
  totalVolume: number;
  tradeCount: number;
}

/**
 * Hook to calculate trade statistics from trade history
 */
export function useTradeStatistics(trades: TradeDisplay[]): TradeStatistics {
  return useMemo(() => {
    // Initialize statistics
    const stockStats = new Map<string, StockStatistics>();
    const tradesByDate = new Map<string, TradeDisplay[]>();
    const dailyPnLMap = new Map<string, { pnl: number; volume: number }>();
    const monthlyVolumeMap = new Map<string, { buyVolume: number; sellVolume: number; tradeCount: number }>();
    
    let totalBuyValue = 0;
    let totalSellValue = 0;
    let buyTrades = 0;
    let sellTrades = 0;
    let confirmedTrades = 0;
    const stockTradeCount = new Map<string, number>();

    // Process each trade
    for (const trade of trades) {
      const { symbol, stockName, type, tokenAmount, usdcAmount, pricePerToken, date, status } = trade;
      
      // Only count confirmed trades for statistics
      if (status === "confirmed") {
        confirmedTrades++;
      }
      
      // Update stock statistics
      if (!stockStats.has(symbol)) {
        stockStats.set(symbol, {
          symbol,
          stockName,
          totalBought: 0,
          totalSold: 0,
          avgBuyPrice: 0,
          avgSellPrice: 0,
          currentHolding: 0,
          totalBuyValue: 0,
          totalSellValue: 0,
          realizedPnL: 0,
          tradeCount: 0,
        });
      }
      
      const stats = stockStats.get(symbol)!;
      stats.tradeCount++;
      
      if (type === "buy") {
        buyTrades++;
        totalBuyValue += usdcAmount;
        stats.totalBought += tokenAmount;
        stats.totalBuyValue += usdcAmount;
        stats.currentHolding += tokenAmount;
        // Recalculate average buy price
        if (stats.totalBought > 0) {
          stats.avgBuyPrice = stats.totalBuyValue / stats.totalBought;
        }
      } else {
        sellTrades++;
        totalSellValue += usdcAmount;
        stats.totalSold += tokenAmount;
        stats.totalSellValue += usdcAmount;
        stats.currentHolding -= tokenAmount;
        // Recalculate average sell price
        if (stats.totalSold > 0) {
          stats.avgSellPrice = stats.totalSellValue / stats.totalSold;
        }
        // Calculate realized PnL for this sale
        if (stats.avgBuyPrice > 0) {
          const costBasis = tokenAmount * stats.avgBuyPrice;
          stats.realizedPnL += (usdcAmount - costBasis);
        }
      }
      
      // Track trades by date (for calendar)
      const dateKey = formatDateKey(date);
      if (!tradesByDate.has(dateKey)) {
        tradesByDate.set(dateKey, []);
      }
      tradesByDate.get(dateKey)!.push(trade);
      
      // Track daily PnL
      const pnlContribution = type === "sell" 
        ? usdcAmount - (tokenAmount * (stockStats.get(symbol)?.avgBuyPrice || pricePerToken))
        : 0;
      
      if (!dailyPnLMap.has(dateKey)) {
        dailyPnLMap.set(dateKey, { pnl: 0, volume: 0 });
      }
      const dailyData = dailyPnLMap.get(dateKey)!;
      dailyData.pnl += pnlContribution;
      dailyData.volume += usdcAmount;
      
      // Track monthly volume
      const monthKey = formatMonthKey(date);
      if (!monthlyVolumeMap.has(monthKey)) {
        monthlyVolumeMap.set(monthKey, { buyVolume: 0, sellVolume: 0, tradeCount: 0 });
      }
      const monthlyData = monthlyVolumeMap.get(monthKey)!;
      monthlyData.tradeCount++;
      if (type === "buy") {
        monthlyData.buyVolume += usdcAmount;
      } else {
        monthlyData.sellVolume += usdcAmount;
      }
      
      // Track most traded stock
      stockTradeCount.set(symbol, (stockTradeCount.get(symbol) || 0) + 1);
    }
    
    // Calculate realized PnL
    const realizedPnL = totalSellValue - (buyTrades > 0 && sellTrades > 0 
      ? Array.from(stockStats.values()).reduce((sum, s) => sum + s.realizedPnL, 0)
      : 0);
    
    // Simplified realized PnL: total sell value minus proportional cost basis
    const totalRealizedPnL = Array.from(stockStats.values()).reduce((sum, s) => sum + s.realizedPnL, 0);
    
    // Build daily PnL array with cumulative values
    const dailyPnL: DailyPnL[] = [];
    let cumulativePnL = 0;
    const sortedDates = Array.from(dailyPnLMap.keys()).sort();
    for (const date of sortedDates) {
      const data = dailyPnLMap.get(date)!;
      cumulativePnL += data.pnl;
      dailyPnL.push({
        date,
        pnl: data.pnl,
        cumulativePnL,
        volume: data.volume,
      });
    }
    
    // Build monthly volume array
    const monthlyVolume: MonthlyVolume[] = Array.from(monthlyVolumeMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        buyVolume: data.buyVolume,
        sellVolume: data.sellVolume,
        totalVolume: data.buyVolume + data.sellVolume,
        tradeCount: data.tradeCount,
      }));
    
    // Find most traded stock
    let mostTradedStock: string | null = null;
    let maxTrades = 0;
    for (const [symbol, count] of stockTradeCount) {
      if (count > maxTrades) {
        maxTrades = count;
        mostTradedStock = symbol;
      }
    }
    
    // Find last trade date
    const lastTradeDate = trades.length > 0 
      ? trades.reduce((latest, t) => t.date > latest ? t.date : latest, trades[0].date)
      : null;
    
    // Calculate average trade size
    const averageTradeSize = trades.length > 0 
      ? (totalBuyValue + totalSellValue) / trades.length
      : 0;
    
    // Calculate success rate (confirmed / total)
    const successRate = trades.length > 0 ? (confirmedTrades / trades.length) * 100 : 0;
    
    // Calculate realized PnL percentage
    const realizedPnLPercent = totalBuyValue > 0 ? (totalRealizedPnL / totalBuyValue) * 100 : 0;

    return {
      totalBuyValue,
      totalSellValue,
      realizedPnL: totalRealizedPnL,
      realizedPnLPercent,
      totalTrades: trades.length,
      buyTrades,
      sellTrades,
      successRate,
      stockStats,
      dailyPnL,
      monthlyVolume,
      tradesByDate,
      mostTradedStock,
      lastTradeDate,
      averageTradeSize,
    };
  }, [trades]);
}

/**
 * Format date to YYYY-MM-DD for grouping
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Format date to YYYY-MM for monthly grouping
 */
function formatMonthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

/**
 * Get days in month for calendar rendering
 */
export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  const days: (Date | null)[] = [];
  
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
}

/**
 * Format month name
 */
export function formatMonthName(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

