"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { truncateAddress } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

/**
 * Custom Wallet Button
 * 
 * A styled wallet button that matches the Noreva design system.
 * Uses the Solana wallet adapter under the hood.
 * Auto-authenticates after wallet connection.
 */
export function WalletButton() {
  const router = useRouter();
  const { publicKey, connected, connecting, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const { isAuthenticated, isAuthenticating, authenticate } = useWalletAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasTriedAuth, setHasTriedAuth] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track previous connected state for toast notifications
  const prevConnectedRef = useRef(connected);
  
  // Show toast when wallet connects/disconnects
  useEffect(() => {
    if (connected && !prevConnectedRef.current && publicKey) {
      toast.success("Wallet connected", {
        description: truncateAddress(publicKey.toBase58(), 6),
      });
    } else if (!connected && prevConnectedRef.current) {
      toast("Wallet disconnected", {
        description: "You have been logged out",
      });
    }
    prevConnectedRef.current = connected;
  }, [connected, publicKey]);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (connected && publicKey && !isAuthenticated && !isAuthenticating && !hasTriedAuth) {
      setHasTriedAuth(true);
      // Small delay to let the wallet UI close first
      const timer = setTimeout(() => {
        authenticate();
      }, 500);
      return () => clearTimeout(timer);
    }
    // Reset when disconnected
    if (!connected) {
      setHasTriedAuth(false);
    }
  }, [connected, publicKey, isAuthenticated, isAuthenticating, hasTriedAuth, authenticate]);

  const handleConnect = () => {
    setVisible(true);
  };

  const handleDisconnect = () => {
    setShowDropdown(false);
    disconnect();
  };

  const handleAccount = () => {
    setShowDropdown(false);
    router.push("/account");
  };

  const handleAuthenticate = async () => {
    await authenticate();
  };

  // Connecting or authenticating state
  if (connecting || isAuthenticating) {
    return (
      <button
        disabled
        className="h-9 px-4 text-sm font-medium rounded-lg bg-[var(--accent-muted)] text-[var(--accent-light)] cursor-wait flex items-center gap-2"
      >
        <LoadingSpinner />
        {connecting ? "Connecting..." : "Signing..."}
      </button>
    );
  }

  // Connected state
  if (connected && publicKey) {
    const address = publicKey.toBase58();
    const walletIcon = wallet?.adapter.icon;

    return (
      <div className="relative" ref={dropdownRef}>
        {/* Wallet button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] hover:bg-[var(--background-hover)] transition-colors"
        >
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
          <span className="text-sm font-mono text-[var(--foreground)] hidden sm:inline">
            {truncateAddress(address, 4)}
          </span>

          {/* Chevron */}
          <ChevronIcon className={cn(
            "w-4 h-4 text-[var(--foreground-muted)] transition-transform",
            showDropdown && "rotate-180"
          )} />
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden z-50">
            <div className="px-3 py-2 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--foreground-muted)]">Connected as</p>
                {isAuthenticated ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--positive)]/20 text-[var(--positive)]">
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)]">
                    Not signed
                  </span>
                )}
              </div>
              <p className="text-sm font-mono text-[var(--foreground)] truncate">{address}</p>
            </div>
            
            {!isAuthenticated && (
              <button
                onClick={handleAuthenticate}
                className="w-full px-3 py-2.5 flex items-center gap-2 text-sm text-[var(--accent)] hover:bg-[var(--background-tertiary)] transition-colors"
              >
                <ShieldIcon className="w-4 h-4" />
                Sign to Verify
              </button>
            )}
            
            <button
              onClick={handleAccount}
              className="w-full px-3 py-2.5 flex items-center gap-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              Account Settings
            </button>
            
            <button
              onClick={handleDisconnect}
              className="w-full px-3 py-2.5 flex items-center gap-2 text-sm text-[var(--negative)] hover:bg-[var(--background-tertiary)] transition-colors border-t border-[var(--border)]"
            >
              <LogoutIcon className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  // Disconnected state
  return (
    <button
      onClick={handleConnect}
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

