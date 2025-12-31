"use client";

import { cn } from "@/lib/utils";
import { TradingViewWidget } from "./tradingview-widget";

interface TradingChartProps {
  symbol: string;
  fullscreen?: boolean;
}

export function TradingChart({ symbol, fullscreen = false }: TradingChartProps) {
  return (
    <div className={cn("flex flex-col", fullscreen ? "h-full" : "")}>
      {/* TradingView Chart Container */}
      <div className={cn(
        "relative rounded-lg overflow-hidden border border-[var(--border)]",
        fullscreen ? "flex-1 min-h-0" : "h-[400px]"
      )}>
        <TradingViewWidget
          symbol={symbol}
          theme="dark"
          autosize={fullscreen}
          height={fullscreen ? undefined : 400}
        />
      </div>

    </div>
  );
}
