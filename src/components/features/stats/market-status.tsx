"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getMarketStatus } from "@/lib/api/price-service";

export function MarketStatus() {
  const [status, setStatus] = useState(getMarketStatus());
  
  // Update status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getMarketStatus());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Status indicator dot */}
      <div className={cn(
        "w-2 h-2 rounded-full",
        status.isOpen ? "bg-[var(--positive)] animate-pulse" : "bg-[var(--foreground-subtle)]"
      )} />
      
      {/* Status text */}
      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-medium",
          status.isOpen ? "text-[var(--positive)]" : "text-[var(--foreground-muted)]"
        )}>
          {status.message}
        </span>
        <span className="text-xs text-[var(--foreground-subtle)]">
          {status.nextEvent}
        </span>
      </div>
    </div>
  );
}

/**
 * Compact market status for header
 */
export function MarketStatusCompact() {
  const [status, setStatus] = useState(getMarketStatus());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getMarketStatus());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
        status.isOpen 
          ? "bg-[var(--positive)]/10 text-[var(--positive)]" 
          : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
      )}
      title={status.nextEvent}
    >
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        status.isOpen ? "bg-[var(--positive)] animate-pulse" : "bg-[var(--foreground-subtle)]"
      )} />
      <span>{status.isOpen ? "Open" : "Closed"}</span>
    </div>
  );
}

