"use client";

import { cn } from "@/lib/utils";
import { formatUsd, formatNumber } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import type { StockWithPrice } from "@/types";

interface StockRowProps {
  stock: StockWithPrice;
  onClick?: () => void;
}

export function StockRow({ stock, onClick }: StockRowProps) {
  const { symbol, name, underlying, price, provider } = stock;
  
  const isPositive = price.spread >= 0;
  const spreadBadgeVariant = 
    price.spreadDirection === "premium" ? "negative" :
    price.spreadDirection === "discount" ? "positive" :
    "muted";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative px-3 sm:px-4 py-3 sm:py-3.5",
        "hover:bg-[var(--background-elevated)] cursor-pointer transition-all duration-200",
        "border-l-2 border-l-transparent hover:border-l-[var(--accent)]"
      )}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Mobile Layout */}
      <div className="sm:hidden relative">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Logo + Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <StockLogo symbol={underlying} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                  {symbol}
                </span>
              </div>
              <p className="text-[11px] text-[var(--foreground-muted)] truncate">
                {name}
              </p>
            </div>
          </div>

          {/* Right: Price + Spread */}
          <div className="text-right shrink-0">
            <p className="font-mono font-semibold text-sm text-[var(--foreground)] tabular-nums">
              {formatUsd(price.tokenPrice)}
            </p>
            <div className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-mono font-medium",
              isPositive ? "text-[var(--positive)]" : "text-[var(--negative)]"
            )}>
              <span className="text-[9px]">{isPositive ? "▲" : "▼"}</span>
              {price.spread > 0 ? "+" : ""}{price.spread.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4">
        {/* Stock Info */}
        <div className="relative flex items-center gap-3 min-w-0">
          <StockLogo symbol={underlying} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                {symbol}
              </span>
              <Badge variant="muted" className="hidden md:inline-flex text-[10px]">
                {provider}
              </Badge>
            </div>
            <p className="text-xs text-[var(--foreground-muted)] truncate">
              {name}
            </p>
          </div>
        </div>

        {/* Token Price */}
        <div className="relative text-right">
          <p className="font-mono font-semibold text-[var(--foreground)] tabular-nums">
            {formatUsd(price.tokenPrice)}
          </p>
        </div>

        {/* TradFi Price */}
        <div className="relative text-right hidden md:block">
          <p className="font-mono text-[var(--foreground-muted)] tabular-nums text-sm">
            {formatUsd(price.tradFiPrice)}
          </p>
          <p className="text-[10px] text-[var(--foreground-subtle)]">
            {underlying}
          </p>
        </div>

        {/* Spread */}
        <div className="relative text-right">
          <div className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium",
            isPositive 
              ? "bg-[var(--positive)]/10 text-[var(--positive)]" 
              : "bg-[var(--negative)]/10 text-[var(--negative)]"
          )}>
            <span className="text-[10px]">{isPositive ? "▲" : "▼"}</span>
            {price.spread > 0 ? "+" : ""}{price.spread.toFixed(2)}%
          </div>
          <p className="text-[10px] text-[var(--foreground-subtle)] mt-0.5 hidden lg:block">
            {price.spreadDirection}
          </p>
        </div>

        {/* Volume */}
        <div className="relative text-right hidden lg:block">
          <p className="font-mono text-[var(--foreground-muted)] tabular-nums text-sm">
            ${formatNumber(price.volume24h)}
          </p>
          <p className="text-[10px] text-[var(--foreground-subtle)]">
            24h vol
          </p>
        </div>

        {/* Arrow indicator on hover */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function StockLogo({ symbol, size = "default" }: { symbol: string; size?: "sm" | "default" }) {
  // Premium gradient backgrounds
  const gradients = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-violet-500 to-violet-600",
    "from-amber-500 to-amber-600",
    "from-rose-500 to-rose-600",
    "from-cyan-500 to-cyan-600",
    "from-orange-500 to-orange-600",
    "from-fuchsia-500 to-fuchsia-600",
  ];
  
  const gradientIndex = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  
  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center text-white font-bold",
        "bg-gradient-to-br shadow-lg",
        gradients[gradientIndex],
        size === "sm" ? "w-8 h-8 text-[10px]" : "w-9 h-9 text-xs"
      )}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
