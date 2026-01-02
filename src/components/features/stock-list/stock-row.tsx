"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatUsd, formatNumber } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import type { StockWithPrice } from "@/types";

interface StockRowProps {
  stock: StockWithPrice;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (symbol: string) => void;
  canFavorite?: boolean; // Whether user is authenticated
}

export function StockRow({ stock, onClick, isFavorite = false, onToggleFavorite, canFavorite = false }: StockRowProps) {
  const { symbol, name, underlying, price, provider, logoUrl } = stock;
  
  const isPositive = price.spread >= 0;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    onToggleFavorite?.(symbol);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative px-3 sm:px-4 py-3 sm:py-3.5",
        "hover:bg-[var(--background-elevated)] cursor-pointer transition-all duration-200",
        // Golden border for favorites
        isFavorite 
          ? "border-l-2 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent" 
          : "border-l-2 border-l-transparent hover:border-l-[var(--accent)]"
      )}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Mobile Layout */}
      <div className="sm:hidden relative">
        <div className="flex items-center justify-between gap-3">
          {/* Favorite Star */}
          {canFavorite && (
            <button
              onClick={handleFavoriteClick}
              className={cn(
                "shrink-0 p-1 rounded-full transition-all duration-200",
                isFavorite 
                  ? "text-amber-400" 
                  : "text-[var(--foreground-subtle)] hover:text-amber-400/70"
              )}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg 
                className="w-4 h-4" 
                fill={isFavorite ? "currentColor" : "none"} 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          )}

          {/* Left: Logo + Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <StockLogo symbol={underlying} logoUrl={logoUrl} size="sm" />
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
      <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4">
        {/* Favorite Star */}
        {canFavorite ? (
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "shrink-0 p-1.5 rounded-full transition-all duration-200 hover:bg-amber-500/10",
              isFavorite 
                ? "text-amber-400 hover:text-amber-300" 
                : "text-[var(--foreground-subtle)] hover:text-amber-400/70"
            )}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg 
              className="w-5 h-5" 
              fill={isFavorite ? "currentColor" : "none"} 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        ) : (
          <div className="w-8" /> 
        )}

        {/* Stock Info */}
        <div className="relative flex items-center gap-3 min-w-0">
          <StockLogo symbol={underlying} logoUrl={logoUrl} />
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

interface StockLogoProps {
  symbol: string;
  logoUrl?: string;
  size?: "sm" | "default";
}

function StockLogo({ symbol, logoUrl, size = "default" }: StockLogoProps) {
  const [imgError, setImgError] = useState(false);
  
  // Premium gradient backgrounds for fallback
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
  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  
  // Show real logo if available and not errored
  if (logoUrl && !imgError) {
    return (
      <div
        className={cn(
          "rounded-lg flex items-center justify-center overflow-hidden bg-[var(--background-tertiary)] shrink-0",
          sizeClasses
        )}
      >
        <img
          src={logoUrl}
          alt={symbol}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }
  
  // Fallback to gradient with initials
  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center text-white font-bold shrink-0",
        "bg-gradient-to-br shadow-lg",
        gradients[gradientIndex],
        sizeClasses,
        size === "sm" ? "text-[10px]" : "text-xs"
      )}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
