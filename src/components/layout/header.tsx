"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />
      
      <div className="border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative">
                <Logo size={32} />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-20 blur-lg transition-opacity rounded-full" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">Noreva</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <NavLink href="/">Stocks</NavLink>
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

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
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
            <nav className="px-4 py-3 space-y-1">
              <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>
                Stocks
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
  const isActive = pathname === href || (href === "/" && pathname.startsWith("/stock"));
  
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
  const isActive = pathname === href || (href === "/" && pathname.startsWith("/stock"));
  
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
