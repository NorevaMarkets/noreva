"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Bold Statement */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero.png')" }}
        />
        <div className="absolute inset-0 bg-[var(--background)]/80" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent" />
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-[var(--accent)] font-medium tracking-wide uppercase text-sm mb-4">
              The Future of Stock Trading
            </p>
            <h1 className="text-5xl lg:text-7xl font-bold text-[var(--foreground)] mb-8 leading-tight">
              Trade Stocks.<br />
              <span className="text-[var(--accent)]">Without Limits.</span>
            </h1>
            <p className="text-xl text-[var(--foreground-muted)] max-w-xl">
              Traditional markets close at 4 PM. Ours don't.
            </p>
          </div>
        </div>
      </section>

      {/* Problem / Solution - Contrasting Columns */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* The Old Way */}
          <div className="relative p-8 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)]">
            <div className="absolute -top-4 left-8 px-4 py-1 bg-[var(--background)] border border-[var(--border)] rounded-full">
              <span className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Traditional Finance</span>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 text-[var(--foreground-muted)]">
                <XIcon className="w-5 h-5 text-[var(--negative)] shrink-0" />
                <span>Markets open 6.5 hours a day</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--foreground-muted)]">
                <XIcon className="w-5 h-5 text-[var(--negative)] shrink-0" />
                <span>Closed on weekends & holidays</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--foreground-muted)]">
                <XIcon className="w-5 h-5 text-[var(--negative)] shrink-0" />
                <span>Minimum deposits required</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--foreground-muted)]">
                <XIcon className="w-5 h-5 text-[var(--negative)] shrink-0" />
                <span>Geographic restrictions</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--foreground-muted)]">
                <XIcon className="w-5 h-5 text-[var(--negative)] shrink-0" />
                <span>Brokers control your assets</span>
              </div>
            </div>
          </div>

          {/* The New Way */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[var(--accent)]/10 to-transparent border border-[var(--accent)]/30">
            <div className="absolute -top-4 left-8 px-4 py-1 bg-[var(--accent)] rounded-full">
              <span className="text-xs font-medium text-[var(--background)] uppercase tracking-wider">Noreva</span>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 text-[var(--foreground)]">
                <CheckIcon className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <span>Trade 24/7, 365 days a year</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--foreground)]">
                <CheckIcon className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <span>Instant settlement on Solana</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--foreground)]">
                <CheckIcon className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <span>Start with any amount</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--foreground)]">
                <CheckIcon className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <span>Global access, no restrictions</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--foreground)]">
                <CheckIcon className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <span>Your keys, your assets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Slider */}
      <section className="border-y border-[var(--border)] bg-[var(--background-secondary)] overflow-hidden">
        <div className="py-10">
          <p className="text-center text-sm text-[var(--foreground-muted)] uppercase tracking-wider mb-8">
            Built With
          </p>
          <div className="relative">
            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--background-secondary)] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--background-secondary)] to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling container */}
            <div className="flex slider-track">
              {/* First set */}
              <div className="flex shrink-0 items-center gap-16 px-8">
                <PartnerLogo name="Solana" href="https://solana.com" />
                <PartnerLogo name="Phantom" href="https://phantom.app" />
                <PartnerLogo name="Solflare" href="https://solflare.com" />
                <PartnerLogo name="Backed Finance" href="https://backed.fi" />
                <PartnerLogo name="Swarm Markets" href="https://swarm.com" />
                <PartnerLogo name="Helius" href="https://helius.dev" />
                <PartnerLogo name="Birdeye" href="https://birdeye.so" />
                <PartnerLogo name="TradingView" href="https://tradingview.com" />
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex shrink-0 items-center gap-16 px-8">
                <PartnerLogo name="Solana" href="https://solana.com" />
                <PartnerLogo name="Phantom" href="https://phantom.app" />
                <PartnerLogo name="Solflare" href="https://solflare.com" />
                <PartnerLogo name="Backed Finance" href="https://backed.fi" />
                <PartnerLogo name="Swarm Markets" href="https://swarm.com" />
                <PartnerLogo name="Helius" href="https://helius.dev" />
                <PartnerLogo name="Birdeye" href="https://birdeye.so" />
                <PartnerLogo name="TradingView" href="https://tradingview.com" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--foreground)]">
            Everything you need
          </h2>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Large Card */}
          <div className="lg:col-span-2 p-8 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-[var(--accent)]/10 transition-colors" />
            <div className="relative">
              <div className="inline-flex p-3 rounded-xl bg-[var(--accent)]/10 mb-6">
                <ChartIcon className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">Real-Time Price Tracking</h3>
              <p className="text-[var(--foreground-muted)] max-w-md">
                Monitor tokenized stocks alongside their traditional counterparts. 
                See spreads, premiums, and discounts at a glance. Make informed decisions with complete price transparency.
              </p>
            </div>
          </div>

          {/* Small Card */}
          <div className="p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)]">
            <div className="inline-flex p-3 rounded-xl bg-[var(--accent)]/10 mb-4">
              <WalletIcon className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Portfolio Tracking</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Connect Phantom or Solflare. Track all your tokenized stocks in one place.
            </p>
          </div>

          {/* Small Card */}
          <div className="p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)]">
            <div className="inline-flex p-3 rounded-xl bg-[var(--accent)]/10 mb-4">
              <SwapIcon className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">One-Click Swaps</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Swap directly from the interface. Best rates, fast execution, no hassle.
            </p>
          </div>

          {/* Large Card */}
          <div className="lg:col-span-2 p-8 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:bg-[var(--accent)]/10 transition-colors" />
            <div className="relative">
              <div className="inline-flex p-3 rounded-xl bg-[var(--accent)]/10 mb-6">
                <SpreadIcon className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">Spread Analysis</h3>
              <p className="text-[var(--foreground-muted)] max-w-md">
                Understand exactly what you're paying. We show the difference between on-chain token prices 
                and real stock prices – premiums, discounts, everything visible at all times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Providers - With Background */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero2.png')" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[var(--background)]/80" />
        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--background)] to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent" />
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 p-8 rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)]/80 backdrop-blur-sm">
            <div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Regulated Token Providers</h3>
              <p className="text-[var(--foreground-muted)]">
                All tokens backed 1:1 by real securities held in custody
              </p>
            </div>
            <div className="flex flex-wrap gap-6 lg:gap-12">
              <a href="https://backed.fi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center overflow-hidden">
                  <img src="/partner/backed.svg" alt="Backed Finance" className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <div className="font-medium text-[var(--foreground)]">Backed Finance</div>
                  <div className="text-xs text-[var(--foreground-muted)]">Swiss Regulated</div>
                </div>
              </a>
              <a href="https://swarm.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center overflow-hidden">
                  <img src="/partner/swarm.png" alt="Swarm Markets" className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <div className="font-medium text-[var(--foreground)]">Swarm Markets</div>
                  <div className="text-xs text-[var(--foreground-muted)]">BaFin Regulated</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Clean */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative p-12 lg:p-16 rounded-3xl border border-[var(--accent)]/20 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero3.png')" }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-[var(--background)]/80" />
          {/* Accent glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-[var(--foreground)] mb-6">
              Ready to trade differently?
            </h2>
            <p className="text-lg text-[var(--foreground-muted)] mb-10 max-w-xl mx-auto">
              Connect your wallet and start trading tokenized stocks on Solana.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent)] text-[var(--background)] font-semibold rounded-xl hover:bg-[var(--accent-light)] transition-all shadow-lg shadow-[var(--accent)]/20"
              >
                Start Trading
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="https://docs.noreva.markets"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[var(--border)] text-[var(--foreground)] font-medium rounded-xl hover:bg-[var(--background-secondary)] transition-all"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Partner Logo Component
// Logo file mapping - update paths as you add logos
const partnerLogos: Record<string, string> = {
  "Solana": "/partner/solana.svg",
  "Phantom": "/partner/phantom.svg",
  "Solflare": "/partner/solflare.svg",
  "Backed Finance": "/partner/backed.svg",
  "Swarm Markets": "/partner/swarm.png",
  "Helius": "/partner/helius.svg",
  "Birdeye": "/partner/birdeye.png",
  "TradingView": "/partner/tradingview.svg",
};

function PartnerLogo({ name, href }: { name: string; href: string }) {
  const logoPath = partnerLogos[name];
  
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors select-none group"
    >
      <div className="w-9 h-9 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
        {logoPath ? (
          <img src={logoPath} alt={name} className="w-6 h-6 object-contain" />
        ) : (
          <span className="text-[var(--accent)] font-bold text-sm">{name.charAt(0)}</span>
        )}
      </div>
      <span className="text-base font-medium whitespace-nowrap">{name}</span>
    </a>
  );
}

// Icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function SwapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}

function SpreadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
