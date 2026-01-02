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
      backgroundColor: theme === "dark" ? "rgba(20, 20, 24, 1)" : "rgba(255, 255, 255, 1)",
      gridColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      // Mobile: hide toolbars for cleaner look
      hide_top_toolbar: isMobile,
      hide_side_toolbar: isMobile,
      hide_legend: isMobile,
      save_image: false,
      calendar: false,
      hide_volume: isMobile, // Hide volume on mobile for cleaner look
      allow_symbol_change: !isMobile, // Disable symbol change on mobile
      support_host: "https://www.tradingview.com",
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
