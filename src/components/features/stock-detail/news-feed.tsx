"use client";

import { useState } from "react";
import { useStockNews, NewsItem } from "@/hooks";
import { cn } from "@/lib/utils";

interface NewsFeedProps {
  symbol: string;
}

export function NewsFeed({ symbol }: NewsFeedProps) {
  const { news, isLoading, error, refetch } = useStockNews(symbol);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-[var(--background-tertiary)] rounded w-3/4" />
              <div className="h-3 bg-[var(--background-tertiary)] rounded w-full" />
              <div className="h-3 bg-[var(--background-tertiary)] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-[var(--foreground-subtle)] mb-2">{error}</p>
        <button
          onClick={refetch}
          className="text-xs text-[var(--accent)] hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="p-4 text-center">
        <NewsIcon className="w-8 h-8 text-[var(--foreground-subtle)] mx-auto mb-2" />
        <p className="text-xs text-[var(--foreground-subtle)]">
          No recent news for {symbol}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {news.map((item) => (
        <NewsItemCard
          key={item.id}
          item={item}
          isExpanded={expandedId === item.id}
          onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
        />
      ))}
      
      {/* Footer */}
      <div className="p-3 text-center">
        <button
          onClick={refetch}
          className="text-[10px] text-[var(--accent)] hover:underline"
        >
          Refresh News
        </button>
      </div>
    </div>
  );
}

interface NewsItemCardProps {
  item: NewsItem;
  isExpanded: boolean;
  onToggle: () => void;
}

function NewsItemCard({ item, isExpanded, onToggle }: NewsItemCardProps) {
  const timeAgo = getTimeAgo(item.publishedAt);

  return (
    <article className="p-3 hover:bg-[var(--background-tertiary)] transition-colors">
      <div className="flex gap-3">
        {/* Thumbnail */}
        {item.imageUrl && (
          <div className="shrink-0 hidden sm:block">
            <img
              src={item.imageUrl}
              alt=""
              className="w-16 h-16 rounded-lg object-cover bg-[var(--background-tertiary)]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <h4 className="text-xs font-medium text-[var(--foreground)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
              {item.title}
            </h4>
          </a>

          {/* Summary (expandable) */}
          {item.summary && (
            <div className={cn(
              "mt-1 text-[10px] text-[var(--foreground-muted)] overflow-hidden transition-all",
              isExpanded ? "line-clamp-none" : "line-clamp-2"
            )}>
              {item.summary}
            </div>
          )}

          {/* Meta */}
          <div className="mt-2 flex items-center gap-2 text-[9px] text-[var(--foreground-subtle)]">
            <span className="font-medium">{item.source}</span>
            <span>•</span>
            <time dateTime={item.publishedAt}>{timeAgo}</time>
            
            {item.summary && item.summary.length > 100 && (
              <>
                <span>•</span>
                <button
                  onClick={onToggle}
                  className="text-[var(--accent)] hover:underline"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              </>
            )}
          </div>

          {/* Related symbols */}
          {item.relatedSymbols.length > 1 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {item.relatedSymbols.slice(0, 5).map((sym) => (
                <span
                  key={sym}
                  className="px-1.5 py-0.5 text-[8px] font-mono bg-[var(--background-tertiary)] text-[var(--foreground-muted)] rounded"
                >
                  {sym}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* External link icon */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1 text-[var(--foreground-subtle)] hover:text-[var(--accent)] transition-colors"
          title="Open article"
        >
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}

/**
 * Calculate relative time string
 */
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function NewsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

