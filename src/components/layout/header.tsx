"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

// Dynamically import wallet button to avoid SSR issues
const WalletButton = dynamic(
  () => import("@/components/ui/wallet-button").then((mod) => mod.WalletButton),
  { 
    ssr: false,
    loading: () => (
      <button className="h-9 px-3 sm:px-4 text-sm font-medium rounded-lg bg-[var(--background-tertiary)] text-[var(--foreground-muted)] animate-pulse">
        <span className="hidden sm:inline">Loading...</span>
        <span className="sm:hidden">...</span>
      </button>
    ),
  }
);

interface Stock {
  symbol: string;
  name: string;
  underlying: string;
  mintAddress?: string;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch stocks once on mount
  useEffect(() => {
    fetch("/api/stocks")
      .then((res) => res.json())
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setAllStocks(response.data);
        }
      })
      .catch(console.error);
  }, []);

  // Filter stocks based on search query (symbol, name, underlying, or mint address)
  useEffect(() => {
    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = allStocks.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query) ||
          stock.underlying.toLowerCase().includes(query) ||
          (stock.mintAddress && stock.mintAddress.toLowerCase().includes(query))
      );
      setSearchResults(filtered.slice(0, 5));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, allStocks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStock = (symbol: string) => {
    setSearchQuery("");
    setShowResults(false);
    router.push(`/stock/${symbol}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />
      
      <div className="border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
            {/* Logo - Left */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="relative">
                <Logo size={24} />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-20 blur-lg transition-opacity rounded-full" />
              </div>
              <span className="text-base font-bold tracking-tight text-[var(--foreground)]">Noreva</span>
            </Link>

            {/* Desktop Navigation - Center */}
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <NavLink href="/">Stocks</NavLink>
              <NavLink href="/trade">Trade</NavLink>
              <NavLink href="/portfolio">Portfolio</NavLink>
              <NavLink href="/about">About</NavLink>
              <a 
                href="https://docs.noreva.markets" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Docs
              </a>
            </nav>

            {/* Right side - Search + Wallet */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Field */}
              <div ref={searchRef} className="relative hidden sm:block">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowResults(true)}
                    placeholder="Search stocks..."
                    className="w-36 lg:w-44 h-9 pl-9 pr-3 text-sm rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full right-0 w-64 mt-1 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden z-50">
                    {searchResults.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => handleSelectStock(stock.symbol)}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-[var(--background-tertiary)] transition-colors text-left"
                      >
                        <span className="font-mono text-sm font-semibold text-[var(--accent)]">
                          {stock.underlying}
                        </span>
                        <span className="text-sm text-[var(--foreground-muted)] truncate">
                          {stock.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {showResults && searchQuery && searchResults.length === 0 && (
                  <div className="absolute top-full right-0 w-64 mt-1 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg shadow-xl p-3 z-50">
                    <p className="text-sm text-[var(--foreground-muted)]">No stocks found</p>
                  </div>
                )}
              </div>

              {/* Wallet Button */}
              <WalletButton />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)]">
            {/* Mobile Search */}
            <div className="px-4 pt-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks..."
                  className="w-full h-10 pl-10 pr-4 text-sm rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              {/* Mobile Search Results */}
              {searchQuery && searchResults.length > 0 && (
                <div className="mt-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg overflow-hidden">
                  {searchResults.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => {
                        handleSelectStock(stock.symbol);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--background-tertiary)] transition-colors text-left border-b border-[var(--border)] last:border-b-0"
                    >
                      <span className="font-mono text-sm font-semibold text-[var(--accent)]">
                        {stock.underlying}
                      </span>
                      <span className="text-sm text-[var(--foreground-muted)] truncate">
                        {stock.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <nav className="px-4 py-3 space-y-1">
              <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>
                Stocks
              </MobileNavLink>
              <MobileNavLink href="/trade" onClick={() => setMobileMenuOpen(false)}>
                Trade
              </MobileNavLink>
              <MobileNavLink href="/portfolio" onClick={() => setMobileMenuOpen(false)}>
                Portfolio
              </MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>
                About
              </MobileNavLink>
              <a
                href="https://docs.noreva.markets"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-all"
              >
                Docs
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Determine active state
  let isActive = pathname === href;
  if (href === "/" && pathname.startsWith("/stock")) isActive = true;
  if (href.startsWith("/trade") && pathname.startsWith("/trade")) isActive = true;
  
  return (
    <Link
      href={href}
      className={cn(
        "relative text-sm font-medium transition-colors py-1",
        isActive 
          ? "text-[var(--foreground)]" 
          : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      )}
    >
      {children}
      {/* Active indicator line */}
      <span 
        className={cn(
          "absolute -bottom-0.5 left-0 right-0 h-px transition-all",
          isActive 
            ? "bg-[var(--accent)] opacity-100" 
            : "bg-[var(--foreground)] opacity-0 group-hover:opacity-20"
        )} 
      />
    </Link>
  );
}

function MobileNavLink({ 
  href, 
  children, 
  onClick 
}: { 
  href: string; 
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  
  // Determine active state
  let isActive = pathname === href;
  if (href === "/" && pathname.startsWith("/stock")) isActive = true;
  if (href.startsWith("/trade") && pathname.startsWith("/trade")) isActive = true;
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block px-4 py-3 text-base font-medium rounded-lg transition-all",
        isActive 
          ? "text-[var(--accent)] bg-[var(--accent-muted)]" 
          : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]"
      )}
    >
      {children}
    </Link>
  );
}
