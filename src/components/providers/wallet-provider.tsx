"use client";

import { useMemo, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet as useSolanaWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * Solana Wallet Provider
 * 
 * Wraps the app with Solana wallet connection capabilities.
 * Supports Phantom, Solflare, and other popular wallets.
 */

// Helius RPC endpoint - from environment variable (secure)
const HELIUS_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "";

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Use Helius RPC endpoint
  const endpoint = useMemo(() => {
    return HELIUS_RPC_ENDPOINT;
  }, []);

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

/**
 * Hook to access wallet state and actions
 * Provides a simplified interface for the most common operations
 */
export function useWallet() {
  const { connection } = useConnection();
  const wallet = useSolanaWallet();
  
  const {
    publicKey,
    connected,
    connecting,
    disconnecting,
    disconnect,
    select,
    wallet: selectedWallet,
  } = wallet;

  // Get the wallet address as a string
  const address = useMemo(() => {
    return publicKey?.toBase58() || null;
  }, [publicKey]);

  return {
    // Connection state
    isConnected: connected,
    isConnecting: connecting,
    isDisconnecting: disconnecting,
    
    // Wallet info
    address,
    publicKey,
    wallet: selectedWallet,
    walletName: selectedWallet?.adapter.name || null,
    
    // Connection object for transactions
    connection,
    
    // Actions
    connect: () => {
      // The WalletMultiButton handles opening the modal
      // This is a fallback for programmatic connection
      if (selectedWallet) {
        return wallet.connect();
      }
    },
    disconnect,
    select,
    
    // Full wallet object for advanced use
    solanaWallet: wallet,
  };
}

// Re-export the WalletMultiButton for use in the header
export { WalletMultiButton };
