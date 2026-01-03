"use client";

import { useEffect, useRef, memo, useState } from "react";

interface TradingViewWidgetProps {
  symbol: string;
  theme?: "dark" | "light";
  autosize?: boolean;
  height?: number;
}

/**
 * Hook to detect if we're on a mobile device
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

function TradingViewWidgetComponent({
  symbol,
  theme = "dark",
  autosize = true,
  height = 400,
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    // Create widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    
    // Mobile: Use fixed height, Desktop: Use autosize or specified height
    const mobileHeight = 280;
    const effectiveHeight = isMobile ? mobileHeight : (autosize ? "100%" : height);
    widgetContainer.style.height = typeof effectiveHeight === "number" ? `${effectiveHeight}px` : effectiveHeight;
    widgetContainer.style.width = "100%";
    containerRef.current.appendChild(widgetContainer);

    // Create script element
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // Clean symbol for TradingView (remove b prefix, x suffix)
    const cleanSymbol = cleanStockSymbol(symbol);

    // Noreva Design System Colors
    const norevaColors = {
      background: "#121416",
      backgroundSecondary: "#161a1d",
      positive: "#4ade80",      // Green for up
      negative: "#f87171",      // Red for down
      accent: "#c4a84b",        // Gold accent
      textMuted: "#9ca3af",
      textSubtle: "#6b7280",
      border: "#2a2f33",
      gridLine: "rgba(42, 47, 51, 0.5)",
    };

    // Mobile-optimized settings: hide toolbars for more chart space
    script.innerHTML = JSON.stringify({
      autosize: isMobile ? false : autosize,
      height: isMobile ? mobileHeight : (autosize ? "100%" : height),
      width: "100%",
      symbol: cleanSymbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: theme,
      style: "1", // Candlestick
      locale: "en",
      enable_publishing: false,
      // Noreva Background Colors
      backgroundColor: norevaColors.background,
      gridColor: norevaColors.gridLine,
      // Mobile: hide toolbars for cleaner look
      hide_top_toolbar: isMobile,
      hide_side_toolbar: isMobile,
      hide_legend: isMobile,
      save_image: false,
      calendar: false,
      hide_volume: isMobile, // Hide volume on mobile for cleaner look
      allow_symbol_change: !isMobile, // Disable symbol change on mobile
      support_host: "https://www.tradingview.com",
      // Noreva Custom Color Overrides
      overrides: {
        // Candlestick colors
        "mainSeriesProperties.candleStyle.upColor": norevaColors.positive,
        "mainSeriesProperties.candleStyle.downColor": norevaColors.negative,
        "mainSeriesProperties.candleStyle.borderUpColor": norevaColors.positive,
        "mainSeriesProperties.candleStyle.borderDownColor": norevaColors.negative,
        "mainSeriesProperties.candleStyle.wickUpColor": norevaColors.positive,
        "mainSeriesProperties.candleStyle.wickDownColor": norevaColors.negative,
        // Hollow candles (when close > open but price down)
        "mainSeriesProperties.hollowCandleStyle.upColor": norevaColors.positive,
        "mainSeriesProperties.hollowCandleStyle.downColor": norevaColors.negative,
        "mainSeriesProperties.hollowCandleStyle.borderUpColor": norevaColors.positive,
        "mainSeriesProperties.hollowCandleStyle.borderDownColor": norevaColors.negative,
        "mainSeriesProperties.hollowCandleStyle.wickUpColor": norevaColors.positive,
        "mainSeriesProperties.hollowCandleStyle.wickDownColor": norevaColors.negative,
        // Bar chart colors
        "mainSeriesProperties.barStyle.upColor": norevaColors.positive,
        "mainSeriesProperties.barStyle.downColor": norevaColors.negative,
        // Line chart color
        "mainSeriesProperties.lineStyle.color": norevaColors.accent,
        // Area chart colors
        "mainSeriesProperties.areaStyle.linecolor": norevaColors.accent,
        "mainSeriesProperties.areaStyle.color1": "rgba(196, 168, 75, 0.3)",
        "mainSeriesProperties.areaStyle.color2": "rgba(196, 168, 75, 0.05)",
        // Baseline chart
        "mainSeriesProperties.baselineStyle.topLineColor": norevaColors.positive,
        "mainSeriesProperties.baselineStyle.bottomLineColor": norevaColors.negative,
        // Pane (chart area) background
        "paneProperties.background": norevaColors.background,
        "paneProperties.backgroundType": "solid",
        // Grid lines
        "paneProperties.vertGridProperties.color": norevaColors.gridLine,
        "paneProperties.horzGridProperties.color": norevaColors.gridLine,
        // Crosshair
        "paneProperties.crossHairProperties.color": norevaColors.textMuted,
        // Scales (axes)
        "scalesProperties.backgroundColor": norevaColors.background,
        "scalesProperties.textColor": norevaColors.textMuted,
        "scalesProperties.lineColor": norevaColors.border,
        // Legend text
        "paneProperties.legendProperties.showStudyArguments": false,
        "paneProperties.legendProperties.showStudyTitles": false,
        "paneProperties.legendProperties.showStudyValues": true,
        "paneProperties.legendProperties.showSeriesTitle": true,
        "paneProperties.legendProperties.showSeriesOHLC": true,
      },
      // Volume indicator colors
      studies_overrides: {
        "volume.volume.color.0": norevaColors.negative,
        "volume.volume.color.1": norevaColors.positive,
        "volume.volume.transparency": 50,
        "volume.volume ma.color": norevaColors.accent,
        "volume.volume ma.transparency": 70,
      },
    });

    widgetContainer.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, theme, autosize, height, isMobile]);

  // Mobile: fixed height, Desktop: flexible
  const containerStyle = isMobile 
    ? { height: "280px" } 
    : { minHeight: autosize ? "100%" : height };

  return (
    <div 
      ref={containerRef} 
      className="tradingview-widget-container h-full w-full"
      style={containerStyle}
    />
  );
}

/**
 * Clean stock symbol for TradingView
 * - Remove 'b' prefix (Backed format: bAAPL -> AAPL)
 * - Remove 'x' suffix (xStocks format: AAPLx -> AAPL)
 * TradingView will automatically find the correct exchange
 */
function cleanStockSymbol(symbol: string): string {
  let cleanSymbol = symbol.toUpperCase();
  
  // Remove x suffix (xStocks format: AAPLx -> AAPL)
  if (cleanSymbol.endsWith("X") && cleanSymbol.length > 1) {
    cleanSymbol = cleanSymbol.slice(0, -1);
  }
  
  // Remove b prefix (Backed format: bAAPL -> AAPL)
  // But keep symbols like BRK.B, BA, BAC, etc.
  if (cleanSymbol.startsWith("B") && cleanSymbol.length > 1) {
    const withoutB = cleanSymbol.slice(1);
    // Only remove 'b' if remaining is a valid stock symbol (2-5 uppercase letters)
    if (/^[A-Z]{2,5}$/.test(withoutB)) {
      cleanSymbol = withoutB;
    }
  }

  return cleanSymbol;
}

// Memoize to prevent unnecessary re-renders
export const TradingViewWidget = memo(TradingViewWidgetComponent);
