"use client";

import { useInsiderData, usePeerData } from "@/hooks";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface InsiderPanelProps {
  symbol: string;
}

export function InsiderPanel({ symbol }: InsiderPanelProps) {
  const { data: insiderData, isLoading: insiderLoading, error: insiderError } = useInsiderData(symbol);
  const { data: peerData, isLoading: peerLoading } = usePeerData(symbol);

  const { transactions, summary } = insiderData;
  const { peers } = peerData;

  if (insiderLoading && peerLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--background-tertiary)] rounded w-1/3" />
          <div className="h-16 bg-[var(--background-tertiary)] rounded" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-[var(--background-tertiary)] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasInsiderData = transactions.length > 0 || summary.totalBuys > 0 || summary.totalSells > 0;

  return (
    <div className="p-3 space-y-4">
      {/* Insider Summary */}
      <div className="bg-[var(--background-tertiary)] rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Insider Activity (90 Days)
            </span>
            <span className={cn(
              "text-[9px] px-2 py-0.5 rounded font-medium",
              summary.last3Months === "Buying" && "bg-[var(--positive)]/20 text-[var(--positive)]",
              summary.last3Months === "Selling" && "bg-[var(--negative)]/20 text-[var(--negative)]",
              summary.last3Months === "Mixed" && "bg-yellow-500/20 text-yellow-500",
              summary.last3Months === "No Activity" && "bg-[var(--background-secondary)] text-[var(--foreground-subtle)]",
            )}>
              {summary.last3Months}
            </span>
          </div>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-[var(--background-secondary)] rounded">
              <p className="text-lg font-bold font-mono text-[var(--positive)]">
                {summary.totalBuys}
              </p>
              <p className="text-[8px] text-[var(--foreground-subtle)]">Buys</p>
            </div>
            <div className="p-2 bg-[var(--background-secondary)] rounded">
              <p className="text-lg font-bold font-mono text-[var(--negative)]">
                {summary.totalSells}
              </p>
              <p className="text-[8px] text-[var(--foreground-subtle)]">Sells</p>
            </div>
            <div className="p-2 bg-[var(--background-secondary)] rounded">
              <p className={cn(
                "text-lg font-bold font-mono",
                summary.netShares >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
              )}>
                {summary.netShares >= 0 ? "+" : ""}{formatShares(summary.netShares)}
              </p>
              <p className="text-[8px] text-[var(--foreground-subtle)]">Net Shares</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {hasInsiderData && transactions.length > 0 && (
        <div className="bg-[var(--background-tertiary)] rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Recent Transactions
            </span>
          </div>

          <div className="divide-y divide-[var(--border)] max-h-[200px] overflow-y-auto">
            {transactions.slice(0, 10).map((tx, index) => (
              <div key={index} className="px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-[var(--foreground)] truncate max-w-[150px]" title={tx.name}>
                    {tx.name}
                  </span>
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded font-medium",
                    tx.type === "Buy" && "bg-[var(--positive)]/20 text-[var(--positive)]",
                    tx.type === "Sell" && "bg-[var(--negative)]/20 text-[var(--negative)]",
                    tx.type === "Other" && "bg-[var(--background-secondary)] text-[var(--foreground-subtle)]",
                  )}>
                    {tx.type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-[var(--foreground-subtle)]">{tx.date}</span>
                  <span className="font-mono text-[var(--foreground)]">
                    {formatShares(tx.shares)} shares
                    {tx.value && ` · $${formatValue(tx.value)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasInsiderData && (
        <div className="bg-[var(--background-tertiary)] rounded-lg p-4 text-center">
          <p className="text-xs text-[var(--foreground-subtle)]">
            {insiderError || "No recent insider transactions"}
          </p>
        </div>
      )}

      {/* Peer Companies */}
      {peers.length > 0 && (
        <div className="bg-[var(--background-tertiary)] rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Similar Companies
            </span>
          </div>

          <div className="p-2 flex flex-wrap gap-1.5">
            {peers.map((peer) => (
              <Link
                key={peer}
                href={`/stock/${peer}`}
                className="px-2 py-1 bg-[var(--background-secondary)] hover:bg-[var(--accent)]/20 text-[10px] font-mono text-[var(--foreground)] hover:text-[var(--accent)] rounded transition-colors"
              >
                {peer}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatShares(num: number): string {
  if (Math.abs(num) >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

function formatValue(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toFixed(0);
}

