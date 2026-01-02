import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--background-tertiary)]",
        className
      )}
      style={style}
    />
  );
}

export function StockRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[var(--border)]">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-16 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
  );
}

// Stock table loading skeleton
export function StockTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header skeleton */}
      <div className="grid grid-cols-5 gap-4 p-4 border-b border-[var(--border)] bg-[var(--background-secondary)]">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <StockRowSkeleton key={i} />
      ))}
    </div>
  );
}

// Sidebar stock item skeleton
export function SidebarStockSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3.5 w-12" />
        <Skeleton className="h-2.5 w-16" />
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="h-3.5 w-14 ml-auto" />
        <Skeleton className="h-2.5 w-10 ml-auto" />
      </div>
    </div>
  );
}

// Full sidebar skeleton
export function SidebarSkeleton({ items = 8 }: { items?: number }) {
  return (
    <div className="p-3 space-y-1">
      {/* Search skeleton */}
      <div className="mb-3">
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      {/* Items */}
      {Array.from({ length: items }).map((_, i) => (
        <SidebarStockSkeleton key={i} />
      ))}
    </div>
  );
}

// Trading panel skeleton
export function TradingPanelSkeleton() {
  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
      {/* Balance overview */}
      <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-[var(--background-tertiary)]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center space-y-1">
            <Skeleton className="h-2.5 w-8 mx-auto" />
            <Skeleton className="h-4 w-12 mx-auto" />
          </div>
        ))}
      </div>
      {/* Buy/Sell toggle */}
      <div className="flex gap-1">
        <Skeleton className="h-8 flex-1 rounded-l-lg" />
        <Skeleton className="h-8 flex-1 rounded-r-lg" />
      </div>
      {/* Token select */}
      <div className="flex gap-1">
        <Skeleton className="h-7 flex-1 rounded" />
        <Skeleton className="h-7 flex-1 rounded" />
      </div>
      {/* Input */}
      <div className="space-y-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      {/* Quote preview */}
      <Skeleton className="h-16 w-full rounded-lg" />
      {/* Button */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-[var(--background)] rounded-lg">
      <div className="w-full h-full p-4 flex flex-col">
        {/* Chart header */}
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-10 rounded" />
            ))}
          </div>
        </div>
        {/* Chart area - fake candlesticks */}
        <div className="flex-1 flex items-end justify-around gap-1 px-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5" style={{ height: '100%' }}>
              <Skeleton 
                className="w-1" 
                style={{ height: `${Math.random() * 30 + 10}%` }} 
              />
              <Skeleton 
                className="w-3 rounded-sm" 
                style={{ height: `${Math.random() * 40 + 20}%` }} 
              />
              <Skeleton 
                className="w-1" 
                style={{ height: `${Math.random() * 20 + 5}%` }} 
              />
            </div>
          ))}
        </div>
        {/* X axis */}
        <div className="flex justify-between mt-2 px-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-3 w-12" />
          ))}
        </div>
      </div>
    </div>
  );
}

// News feed skeleton
export function NewsFeedSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="p-3 space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="p-3 rounded-lg bg-[var(--background-tertiary)] space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Fundamentals panel skeleton
export function FundamentalsSkeleton() {
  return (
    <div className="p-3 space-y-4">
      {/* Section */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-2">
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex justify-between p-2 rounded bg-[var(--background-tertiary)]">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Price header skeleton
export function PriceHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="h-6 w-20 ml-auto" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>
    </div>
  );
}

