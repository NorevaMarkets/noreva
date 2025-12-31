"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsd, formatNumber } from "@/lib/utils/format";
import type { StockWithPrice } from "@/types";

interface MarketStatsProps {
  stocks: StockWithPrice[];
}

export function MarketStats({ stocks }: MarketStatsProps) {
  const totalVolume = stocks.reduce((acc, s) => acc + s.price.volume24h, 0);
  const totalMarketCap = stocks.reduce((acc, s) => acc + s.price.marketCap, 0);
  const avgSpread = stocks.reduce((acc, s) => acc + Math.abs(s.price.spread), 0) / stocks.length;
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Volume (24h)"
        value={`$${formatNumber(totalVolume)}`}
        subtitle="Across all tokens"
      />
      <StatCard
        title="Market Cap"
        value={`$${formatNumber(totalMarketCap)}`}
        subtitle="Total tokenized value"
      />
      <StatCard
        title="Available Stocks"
        value={stocks.length.toString()}
        subtitle="Tokenized securities"
      />
      <StatCard
        title="Avg. Spread"
        value={`${avgSpread.toFixed(2)}%`}
        subtitle="Token vs. stock"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--accent-muted)] to-transparent rounded-bl-full opacity-50" />
      <CardTitle>{title}</CardTitle>
      <p className="text-2xl font-semibold text-[var(--foreground)] mt-2 font-mono tabular-nums">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-[var(--foreground-subtle)] mt-1">
          {subtitle}
        </p>
      )}
    </Card>
  );
}

