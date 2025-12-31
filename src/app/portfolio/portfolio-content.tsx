"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd, truncateAddress } from "@/lib/utils/format";
import { usePortfolioHoldings } from "@/hooks";
import { useWalletBalance } from "@/hooks";
import Link from "next/link";

export function PortfolioContent() {
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const { holdings, totalValue, isLoading, error, refetch } = usePortfolioHoldings();
  const { sol: solBalance, usdc: usdcBalance } = useWalletBalance();
  
  const address = publicKey?.toBase58() || null;

  if (!connected) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center mb-4">
          <WalletIcon className="w-7 sm:w-8 h-7 sm:h-8 text-[var(--foreground-muted)]" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-2 text-center">
          Connect Your Wallet
        </h2>
        <p className="text-sm sm:text-base text-[var(--foreground-muted)] text-center max-w-md mb-6">
          Connect your Solana wallet to view your tokenized stock holdings and portfolio performance.
        </p>
        <button
          onClick={() => setVisible(true)}
          className="h-10 sm:h-11 px-5 sm:px-6 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-light)] transition-colors flex items-center gap-2"
        >
          <WalletIcon className="w-4 h-4" />
          Connect Wallet
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Wallet Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-[var(--accent-muted)] flex items-center justify-center shrink-0">
            {wallet?.adapter.icon ? (
              <img
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
                className="w-5 sm:w-6 h-5 sm:h-6"
              />
            ) : (
              <WalletIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--accent)]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
              {wallet?.adapter.name || "Connected Wallet"}
            </p>
            <p className="font-mono text-sm sm:text-base text-[var(--foreground)] truncate">
              {truncateAddress(address || "", 6)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={refetch}
            disabled={isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? "..." : "Refresh"}
          </button>
          <button
            onClick={disconnect}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Wallet Balances - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <CardTitle className="text-[10px] sm:text-xs">SOL Balance</CardTitle>
          <p className="text-lg sm:text-2xl font-semibold text-[var(--foreground)] mt-1 sm:mt-2 font-mono tabular-nums">
            {solBalance.toFixed(4)}
          </p>
          <p className="text-[10px] sm:text-xs text-[var(--foreground-subtle)]">SOL</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <CardTitle className="text-[10px] sm:text-xs">USDC Balance</CardTitle>
          <p className="text-lg sm:text-2xl font-semibold text-[var(--foreground)] mt-1 sm:mt-2 font-mono tabular-nums">
            {formatUsd(usdcBalance)}
          </p>
        </Card>
        <Card className="p-3 sm:p-4">
          <CardTitle className="text-[10px] sm:text-xs">xStocks Value</CardTitle>
          <p className="text-lg sm:text-2xl font-semibold text-[var(--accent)] mt-1 sm:mt-2 font-mono tabular-nums">
            {formatUsd(totalValue)}
          </p>
        </Card>
        <Card className="p-3 sm:p-4">
          <CardTitle className="text-[10px] sm:text-xs">Holdings</CardTitle>
          <p className="text-lg sm:text-2xl font-semibold text-[var(--foreground)] mt-1 sm:mt-2 font-mono tabular-nums">
            {holdings.length}
          </p>
          <p className="text-[10px] sm:text-xs text-[var(--foreground-subtle)]">stocks</p>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-3 sm:p-4 bg-[var(--negative)]/10 border border-[var(--negative)]/30 rounded-lg">
          <p className="text-xs sm:text-sm text-[var(--negative)]">{error}</p>
        </div>
      )}

      {/* Holdings List */}
      <Card padding="none">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-medium text-sm sm:text-base text-[var(--foreground)]">Your xStocks Holdings</h3>
          {isLoading && (
            <span className="text-[10px] sm:text-xs text-[var(--foreground-muted)] animate-pulse">
              Loading...
            </span>
          )}
        </div>
        
        {holdings.length === 0 && !isLoading ? (
          <div className="p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-[var(--foreground-muted)] mb-4">
              You don't have any tokenized stocks yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-light)] transition-colors"
            >
              Browse Stocks
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {holdings.map((holding) => (
              <HoldingRow key={holding.mintAddress} holding={holding} />
            ))}
          </div>
        )}
      </Card>

      {/* Info */}
      <p className="text-[10px] sm:text-xs text-[var(--foreground-subtle)] text-center">
        Portfolio data is fetched directly from your Solana wallet.
      </p>
    </div>
  );
}

interface HoldingRowProps {
  holding: {
    symbol: string;
    underlying: string;
    name: string;
    mintAddress: string;
    balance: number;
    tokenPrice: number;
    stockPrice: number;
    spread: number;
    valueUsd: number;
    provider: string;
  };
}

function HoldingRow({ holding }: HoldingRowProps) {
  const { symbol, underlying, balance, tokenPrice, spread, valueUsd, provider } = holding;

  return (
    <Link
      href={`/stock/${underlying}`}
      className="flex items-center justify-between p-3 sm:p-4 hover:bg-[var(--background-tertiary)] transition-colors"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <StockLogo symbol={underlying} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-medium text-sm sm:text-base text-[var(--foreground)] truncate">{symbol}</span>
            <Badge variant="muted" className="hidden sm:inline-flex text-[10px]">{provider}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--foreground-muted)] truncate">
            {balance.toFixed(4)} @ {formatUsd(tokenPrice)}
          </p>
        </div>
      </div>
      
      <div className="text-right shrink-0 ml-2">
        <p className="font-mono text-sm sm:text-base text-[var(--foreground)] tabular-nums">
          {formatUsd(valueUsd)}
        </p>
        <p className={`text-xs sm:text-sm font-mono tabular-nums ${
          spread >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
        }`}>
          {spread >= 0 ? "+" : ""}{spread.toFixed(2)}%
        </p>
      </div>
    </Link>
  );
}

function StockLogo({ symbol }: { symbol: string }) {
  const colors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-pink-500", "bg-cyan-500", "bg-amber-500", "bg-red-500",
  ];
  const colorIndex = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  return (
    <div className={`w-9 sm:w-10 h-9 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shrink-0 ${colors[colorIndex]}`}>
      {symbol.slice(0, 2)}
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
