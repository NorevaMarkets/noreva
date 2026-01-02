"use client";

import { cn } from "@/lib/utils";
import type { SortField, SortDirection } from "@/types";

interface StockTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function StockTableHeader({ 
  sortField, 
  sortDirection, 
  onSort 
}: StockTableHeaderProps) {
  return (
    <>
      {/* Mobile Header */}
      <div className="sm:hidden flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--background-secondary)]">
        <HeaderCell 
          label="Stock" 
          field="symbol" 
          currentField={sortField}
          direction={sortDirection}
          onSort={onSort}
        />
        <div className="flex items-center gap-4">
          <HeaderCell 
            label="Price" 
            field="price" 
            currentField={sortField}
            direction={sortDirection}
            onSort={onSort}
            align="right"
          />
          <HeaderCell 
            label="Spread" 
            field="spread" 
            currentField={sortField}
            direction={sortDirection}
            onSort={onSort}
            align="right"
          />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-2 border-b border-[var(--border)] bg-[var(--background-secondary)]">
        {/* Empty space for star column */}
        <div className="w-8" />
        <HeaderCell 
          label="Stock" 
          field="symbol" 
          currentField={sortField}
          direction={sortDirection}
          onSort={onSort}
        />
        <HeaderCell 
          label="Token Price" 
          field="price" 
          currentField={sortField}
          direction={sortDirection}
          onSort={onSort}
          align="right"
        />
        <HeaderCell 
          label="Stock Price" 
          field="price" 
          currentField={sortField}
          direction={sortDirection}
          onSort={onSort}
          align="right"
          className="hidden md:block"
        />
        <HeaderCell 
          label="Spread" 
          field="spread" 
          currentField={sortField}
          direction={sortDirection}
          onSort={onSort}
          align="right"
        />
        <HeaderCell 
          label="Volume" 
          field="volume" 
          currentField={sortField}
          direction={sortDirection}
          onSort={onSort}
          align="right"
          className="hidden lg:block"
        />
      </div>
    </>
  );
}

interface HeaderCellProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
  className?: string;
}

function HeaderCell({ 
  label, 
  field, 
  currentField, 
  direction, 
  onSort, 
  align = "left",
  className 
}: HeaderCellProps) {
  const isActive = field === currentField;
  
  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-1 text-[10px] sm:text-xs font-medium uppercase tracking-wider",
        "text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)] transition-colors",
        align === "right" && "justify-end",
        isActive && "text-[var(--accent)]",
        className
      )}
    >
      {label}
      {isActive && (
        <span className="text-[9px] sm:text-[10px]">
          {direction === "asc" ? "↑" : "↓"}
        </span>
      )}
    </button>
  );
}
