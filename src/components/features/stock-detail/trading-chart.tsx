"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LightweightChart } from "./lightweight-chart";
import { TradingViewWidget } from "./tradingview-widget";

interface TradingChartProps {
  symbol: string;
  mintAddress?: string;
  fullscreen?: boolean;
}

type ChartSource = "token" | "stock";
type Timeframe = "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w" | "1M";

export function TradingChart({ symbol, mintAddress, fullscreen = false }: TradingChartProps) {
  const [chartSource, setChartSource] = useState<ChartSource>("token");
  const [timeframe, setTimeframe] = useState<Timeframe>("1d");

  const timeframes: { value: Timeframe; label: string }[] = [
    { value: "5m", label: "5M" },
    { value: "15m", label: "15M" },
    { value: "30m", label: "30M" },
    { value: "1h", label: "1H" },
    { value: "4h", label: "4H" },
    { value: "1d", label: "1D" },
    { value: "1w", label: "1W" },
    { value: "1M", label: "1MO" },
  ];

  return (
    <div className={cn("flex flex-col", fullscreen ? "h-full" : "")}>
      {/* Chart Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--background-secondary)]">
        {/* Source Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-[var(--background-tertiary)] rounded-md">
          <button
            onClick={() => setChartSource("token")}
            className={cn(
              "px-2 py-1 text-[10px] font-semibold rounded transition-all",
              chartSource === "token"
                ? "bg-[var(--accent)] text-[var(--background)]"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            )}
          >
            Token Price
          </button>
          <button
            onClick={() => setChartSource("stock")}
            className={cn(
              "px-2 py-1 text-[10px] font-semibold rounded transition-all",
              chartSource === "stock"
                ? "bg-[var(--accent)] text-[var(--background)]"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            )}
          >
            Stock Price
          </button>
        </div>

        {/* Timeframe Selector (only for Token Price) */}
        {chartSource === "token" && (
          <div className="flex items-center gap-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={cn(
                  "px-2 py-1 text-[10px] font-semibold rounded transition-all",
                  timeframe === tf.value
                    ? "bg-[var(--background-elevated)] text-[var(--foreground)]"
                    : "text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)]"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Chart Container */}
      <div className={cn(
        "relative rounded-lg overflow-hidden bg-[var(--background)]",
        fullscreen 
          ? "flex-1 min-h-0 h-[280px] sm:h-auto"
          : "h-[280px] sm:h-[400px]"
      )}>
        {chartSource === "token" ? (
          // Lightweight Charts with Token Price from Moralis
          <LightweightChart
            symbol={symbol}
            mintAddress={mintAddress}
            timeframe={timeframe}
            autosize={fullscreen}
            height={fullscreen ? undefined : 400}
            showVolume={true}
          />
        ) : (
          // TradingView for Stock Price
          <TradingViewWidget
            symbol={symbol}
            theme="dark"
            autosize={fullscreen}
            height={fullscreen ? undefined : 400}
          />
        )}
      </div>
    </div>
  );
}
