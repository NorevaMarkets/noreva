"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/utils/format";
import { TradingChart } from "./trading-chart";
import { MarketDepth } from "./market-depth";
import { TradingPanel } from "./trading-panel";
import { mockStocks } from "@/data/mock-stocks";
import type { StockWithPrice } from "@/types";

interface StockDetailModalProps {
  stock: StockWithPrice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StockDetailModal({ stock, isOpen, onClose }: StockDetailModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !stock) return null;

  const { symbol, underlying, price } = stock;
  const priceChangePercent = 1.2;
  const isPositive = priceChangePercent >= 0;
  const otherStocks = mockStocks.filter(s => s.id !== stock.id).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Modal Container - matches reference proportions */}
      <div className="relative w-full max-w-[950px] animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#181c1f] border border-[#2a2f33] rounded-xl overflow-hidden shadow-2xl">
          
          {/* Header with Logo */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#1c2023] border-b border-[#2a2f33]">
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="text-[#c4a84b] font-semibold">Noreva</span>
            </div>
            <button
              onClick={onClose}
              className="text-[#6b7280] hover:text-[#f0f0f0] transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Main Grid: Chart Left, Panels Right */}
          <div className="flex">
            {/* Left: Chart Section - larger */}
            <div className="flex-1 p-4 min-w-0">
              {/* Chart Container with border */}
              <div className="bg-[#161a1d] border border-[#2a2f33] rounded-lg p-4">
                {/* Price Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[#c4a84b] font-semibold text-sm">{underlying}/SOL</span>
                      <span className="text-[#4b5563] text-xs">Tokenized Stock Price</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono tabular-nums text-[#f0f0f0]">
                        {formatUsd(price.tokenPrice)}
                      </span>
                      <span className={cn(
                        "text-sm font-mono tabular-nums",
                        isPositive ? "text-[#4ade80]" : "text-[#f87171]"
                      )}>
                        (+{priceChangePercent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="border border-[#c4a84b] text-[#c4a84b] text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
                    24/7 Market
                  </div>
                </div>

                {/* Chart */}
                <TradingChart symbol={symbol} />
              </div>

              {/* Stock Ticker */}
              <div className="flex items-center gap-6 mt-3 px-2 py-2 bg-[#161a1d] rounded text-xs">
                {otherStocks.map((s) => {
                  const change = ((s.price.tokenPrice - s.price.tradFiPrice) / s.price.tradFiPrice * 100 + 0.5).toFixed(1);
                  const positive = parseFloat(change) >= 0;
                  return (
                    <div key={s.id} className="flex items-center gap-1">
                      <span className="text-[#f0f0f0] font-medium">{s.underlying}/SOL:</span>
                      <span className="font-mono tabular-nums text-[#f0f0f0]">{formatUsd(s.price.tokenPrice)}</span>
                      <span className={cn("font-mono tabular-nums", positive ? "text-[#4ade80]" : "text-[#f87171]")}>
                        (+{change}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Panels - fixed width matching reference */}
            <div className="w-[180px] border-l border-[#2a2f33] flex flex-col bg-[#181c1f]">
              {/* Market Depth */}
              <div className="flex-1 border-b border-[#2a2f33]">
                <MarketDepth price={price.tokenPrice} />
              </div>
              
              {/* Trading Panel */}
              <div className="flex-1">
                <TradingPanel stock={stock} />
              </div>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="px-4 py-3 bg-[#161a1d] border-t border-[#2a2f33]">
            <p className="text-center text-[11px] text-[#6b7280] italic">
              "Trade stocks. 24/7. Track tokenized stocks on Solana. Compare real-time prices, analyze spreads, and trade when markets are closed."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#1c2023" stroke="#c4a84b" strokeWidth="1"/>
      <path d="M8 11C8 9 9.5 8 12 8C14.5 8 15.5 9.5 15.5 11C15.5 13 13 13.5 12 14C11 14.5 9 15 9 17.5C9 19.5 10.5 21 13 21" stroke="#c4a84b" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M18 21V8M18 14.5L24 8M20 14L24 21" stroke="#c4a84b" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="8" r="2" fill="#c4a84b"/>
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}
