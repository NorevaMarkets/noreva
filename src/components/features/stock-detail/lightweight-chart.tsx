"use client";

import { useEffect, useRef, useState, memo } from "react";
import { createChart, ColorType, CandlestickSeries, HistogramSeries, IChartApi, ISeriesApi, Time } from "lightweight-charts";

// Noreva Design System Colors
const NOREVA_COLORS = {
  background: "#121416",
  backgroundSecondary: "#161a1d",
  positive: "#4ade80",      // Green for up candles
  negative: "#f87171",      // Red for down candles
  accent: "#c4a84b",        // Gold accent
  textPrimary: "#f0f0f0",
  textMuted: "#9ca3af",
  textSubtle: "#6b7280",
  border: "#2a2f33",
  gridLine: "rgba(42, 47, 51, 0.5)",
  crosshair: "#c4a84b",
  volumeUp: "rgba(74, 222, 128, 0.3)",
  volumeDown: "rgba(248, 113, 113, 0.3)",
};

interface OHLCVCandle {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface LightweightChartProps {
  symbol: string;
  mintAddress?: string;
  timeframe?: string;
  height?: number;
  autosize?: boolean;
  showVolume?: boolean;
}

function LightweightChartComponent({
  symbol,
  mintAddress,
  timeframe = "1d",
  height = 400,
  autosize = true,
  showVolume = true,
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [chartReady, setChartReady] = useState(false);

  // Fetch OHLCV data when chart is ready
  useEffect(() => {
    if (!chartReady) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          symbol,
          timeframe,
          limit: "100",
        });
        if (mintAddress) {
          params.set("mintAddress", mintAddress);
        }

        console.log(`[LightweightChart] Fetching OHLCV for ${symbol}...`);
        const response = await fetch(`/api/token/ohlcv?${params}`);
        const data = await response.json();
        console.log(`[LightweightChart] Response:`, data);

        if (!data.success || !data.data || data.data.length === 0) {
          setError("No chart data available");
          setIsLoading(false);
          return;
        }

        const candles: OHLCVCandle[] = data.data;

        // Update candlestick series
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(candles);
        }

        // Update volume series
        if (volumeSeriesRef.current && showVolume) {
          const volumeData = candles.map((candle) => ({
            time: candle.time,
            value: candle.volume || 0,
            color: candle.close >= candle.open ? NOREVA_COLORS.volumeUp : NOREVA_COLORS.volumeDown,
          }));
          volumeSeriesRef.current.setData(volumeData);
        }

        // Update price info
        if (candles.length > 0) {
          const latestCandle = candles[candles.length - 1];
          const firstCandle = candles[0];
          setLastPrice(latestCandle.close);
          
          const change = ((latestCandle.close - firstCandle.open) / firstCandle.open) * 100;
          setPriceChange(change);
        }

        // Fit content to view
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching OHLCV data:", err);
        setError("Failed to load chart data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, mintAddress, timeframe, showVolume, chartReady]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: NOREVA_COLORS.background },
        textColor: NOREVA_COLORS.textMuted,
        fontFamily: "'Space Grotesk', sans-serif",
        attributionLogo: false, // Hide TradingView logo
      },
      grid: {
        vertLines: { color: NOREVA_COLORS.gridLine },
        horzLines: { color: NOREVA_COLORS.gridLine },
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: {
          color: NOREVA_COLORS.crosshair,
          width: 1,
          style: 2, // Dashed
          labelBackgroundColor: NOREVA_COLORS.accent,
        },
        horzLine: {
          color: NOREVA_COLORS.crosshair,
          width: 1,
          style: 2,
          labelBackgroundColor: NOREVA_COLORS.accent,
        },
      },
      rightPriceScale: {
        borderColor: NOREVA_COLORS.border,
        textColor: NOREVA_COLORS.textMuted,
      },
      timeScale: {
        borderColor: NOREVA_COLORS.border,
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: autosize ? chartContainerRef.current.clientHeight || height : height,
    });

    chartRef.current = chart;

    // Add candlestick series with Noreva colors
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: NOREVA_COLORS.positive,
      downColor: NOREVA_COLORS.negative,
      borderUpColor: NOREVA_COLORS.positive,
      borderDownColor: NOREVA_COLORS.negative,
      wickUpColor: NOREVA_COLORS.positive,
      wickDownColor: NOREVA_COLORS.negative,
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series if enabled (using Histogram for volume bars)
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "", // Overlay on the main pane
      });
      
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8, // Volume takes bottom 20% of chart
          bottom: 0,
        },
      });
      
      volumeSeriesRef.current = volumeSeries;
    }

    // Mark chart as ready to trigger data fetch
    setChartReady(true);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: autosize ? chartContainerRef.current.clientHeight || height : height,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      setChartReady(false);
    };
  }, [height, autosize, showVolume]);

  return (
    <div className="relative w-full h-full">
      {/* Chart Header */}
      <div className="absolute top-2 left-3 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--foreground-muted)]">
            {symbol}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-muted)] text-[var(--accent)]">
            {timeframe.toUpperCase()}
          </span>
        </div>
        {lastPrice !== null && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              ${lastPrice.toFixed(2)}
            </span>
            {priceChange !== null && (
              <span className={`text-xs font-medium ${
                priceChange >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
              }`}>
                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/80 z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[var(--foreground-muted)]">Loading chart...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/80 z-20">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-[var(--negative)]">{error}</span>
            <span className="text-xs text-[var(--foreground-muted)]">Using TradingView as fallback</span>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div 
        ref={chartContainerRef} 
        className="w-full h-full"
        style={{ minHeight: height }}
      />
    </div>
  );
}

export const LightweightChart = memo(LightweightChartComponent);

