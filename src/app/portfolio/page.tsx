"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

// Dynamically import wallet-dependent components to avoid SSR issues
const PortfolioContent = dynamic(
  () => import("./portfolio-content").then((mod) => mod.PortfolioContent),
  { 
    ssr: false,
    loading: () => (
      <Card className="flex flex-col items-center justify-center py-12 sm:py-16">
        <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center mb-4 animate-pulse">
          <WalletIcon className="w-6 sm:w-8 h-6 sm:h-8 text-[var(--foreground-muted)]" />
        </div>
        <p className="text-sm sm:text-base text-[var(--foreground-muted)]">Loading wallet...</p>
      </Card>
    ),
  }
);

export default function PortfolioPage() {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero.png')" }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-[var(--background)]/70" />
        {/* Bottom fade gradient for seamless transition */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-[var(--foreground)]">
            Portfolio
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-lg text-[var(--foreground-muted)]">
            Track your tokenized stock holdings
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <PortfolioContent />
      </section>
    </div>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M2.273 5.625A4.483 4.483 0 015.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 3H5.25a3 3 0 00-2.977 2.625zM2.273 8.625A4.483 4.483 0 015.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 6H5.25a3 3 0 00-2.977 2.625zM5.25 9a3 3 0 00-3 3v6a3 3 0 003 3h13.5a3 3 0 003-3v-6a3 3 0 00-3-3H15a.75.75 0 00-.75.75 2.25 2.25 0 01-4.5 0A.75.75 0 009 9H5.25z" />
    </svg>
  );
}
