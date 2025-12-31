"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { truncateAddress } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

/**
 * Custom Wallet Button
 * 
 * A styled wallet button that matches the Noreva design system.
 * Uses the Solana wallet adapter under the hood.
 */
export function WalletButton() {
  const { publicKey, connected, connecting, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (connected) {
      // Show disconnect option or toggle dropdown
      // For simplicity, we'll just disconnect
      disconnect();
    } else {
      // Open wallet selection modal
      setVisible(true);
    }
  };

  // Connecting state
  if (connecting) {
    return (
      <button
        disabled
        className="h-9 px-4 text-sm font-medium rounded-lg bg-[var(--accent-muted)] text-[var(--accent-light)] cursor-wait flex items-center gap-2"
      >
        <LoadingSpinner />
        Connecting...
      </button>
    );
  }

  // Connected state
  if (connected && publicKey) {
    const address = publicKey.toBase58();
    const walletIcon = wallet?.adapter.icon;

    return (
      <div className="flex items-center gap-2">
        {/* Wallet info pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
          {/* Status dot */}
          <div className="w-2 h-2 rounded-full bg-[var(--positive)]" />
          
          {/* Wallet icon */}
          {walletIcon && (
            <img
              src={walletIcon}
              alt={wallet?.adapter.name || "Wallet"}
              className="w-4 h-4"
            />
          )}
          
          {/* Address */}
          <span className="text-sm font-mono text-[var(--foreground)]">
            {truncateAddress(address, 4)}
          </span>
        </div>

        {/* Disconnect button */}
        <button
          onClick={handleClick}
          className="h-9 px-4 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Disconnected state
  return (
    <button
      onClick={handleClick}
      className="h-9 px-4 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-light)] transition-colors flex items-center gap-2"
    >
      <WalletIcon className="w-4 h-4" />
      Connect
    </button>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M2.273 5.625A4.483 4.483 0 015.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 3H5.25a3 3 0 00-2.977 2.625zM2.273 8.625A4.483 4.483 0 015.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 6H5.25a3 3 0 00-2.977 2.625zM5.25 9a3 3 0 00-3 3v6a3 3 0 003 3h13.5a3 3 0 003-3v-6a3 3 0 00-3-3H15a.75.75 0 00-.75.75 2.25 2.25 0 01-4.5 0A.75.75 0 009 9H5.25z" />
    </svg>
  );
}

