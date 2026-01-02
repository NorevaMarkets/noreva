"use client";

import { useState, useMemo, useEffect } from "react";
import { StockRow } from "./stock-row";
import { StockTableHeader } from "./stock-table-header";
import { useFavorites } from "@/hooks";
import type { StockWithPrice, SortField, SortConfig } from "@/types";

const ITEMS_PER_PAGE = 10;

interface StockTableProps {
  stocks: StockWithPrice[];
  searchQuery?: string;
  onStockClick?: (stock: StockWithPrice) => void;
}

export function StockTable({ 
  stocks, 
  searchQuery = "",
  onStockClick 
}: StockTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "volume",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  // Favorites hook
  const { favorites, isFavorite, toggleFavorite, isAuthenticated } = useFavorites();

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const filteredAndSortedStocks = useMemo(() => {
    let result = [...stocks];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(stock =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query) ||
        stock.underlying.toLowerCase().includes(query)
      );
    }

    // Sort - favorites always on top first, then by selected sort
    result.sort((a, b) => {
      // First: favorites at the top
      const aIsFav = favorites.includes(a.symbol);
      const bIsFav = favorites.includes(b.symbol);
      
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      
      // Then: normal sort
      let comparison = 0;
      
      switch (sortConfig.field) {
        case "symbol":
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case "price":
          comparison = a.price.tokenPrice - b.price.tokenPrice;
          break;
        case "spread":
          comparison = Math.abs(a.price.spread) - Math.abs(b.price.spread);
          break;
        case "volume":
          comparison = a.price.volume24h - b.price.volume24h;
          break;
        case "marketCap":
          comparison = a.price.marketCap - b.price.marketCap;
          break;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [stocks, searchQuery, sortConfig, favorites]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedStocks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedStocks = filteredAndSortedStocks.slice(startIndex, endIndex);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stocks.length]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (filteredAndSortedStocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-[var(--background-card)] border border-[var(--border)] rounded-xl">
        <div className="w-12 h-12 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[var(--foreground-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-[var(--foreground-muted)] font-medium">No stocks found</p>
        {searchQuery && (
          <p className="text-sm text-[var(--foreground-subtle)] mt-1">
            Try adjusting your search query
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-[var(--background-card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-lg">
        {/* Top gradient accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent" />
        
        <StockTableHeader
          sortField={sortConfig.field}
          sortDirection={sortConfig.direction}
          onSort={handleSort}
        />
        <div className="divide-y divide-[var(--border)]/50">
          {paginatedStocks.map((stock) => (
            <StockRow
              key={stock.id}
              stock={stock}
              onClick={() => onStockClick?.(stock)}
              isFavorite={isFavorite(stock.symbol)}
              onToggleFavorite={toggleFavorite}
              canFavorite={isAuthenticated}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAndSortedStocks.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-[var(--background-card)] border border-[var(--border)] rounded-xl">
      {/* Info text */}
      <div className="text-sm text-[var(--foreground-muted)]">
        Showing <span className="font-medium text-[var(--foreground)]">{startItem}-{endItem}</span> of{" "}
        <span className="font-medium text-[var(--foreground)]">{totalItems}</span> stocks
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2 text-[var(--foreground-subtle)]">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                  currentPage === page
                    ? "bg-[var(--accent)] text-[var(--background)] shadow-lg shadow-[var(--accent)]/20"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]"
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
