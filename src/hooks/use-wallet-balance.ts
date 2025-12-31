"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

export const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
export const USDC_DECIMALS = 6;

interface WalletBalances {
  sol: number;
  usdc: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWalletBalance(): WalletBalances {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  
  const [sol, setSol] = useState(0);
  const [usdc, setUsdc] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!publicKey || !connected) {
      setSol(0);
      setUsdc(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      setSol(solBalance / LAMPORTS_PER_SOL);

      // Fetch USDC balance
      try {
        const usdcAta = await getAssociatedTokenAddress(USDC_MINT, publicKey);
        const usdcAccount = await getAccount(connection, usdcAta);
        setUsdc(Number(usdcAccount.amount) / Math.pow(10, USDC_DECIMALS));
      } catch {
        // USDC account doesn't exist, balance is 0
        setUsdc(0);
      }
    } catch (err) {
      console.error("Failed to fetch balances:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, connection]);

  useEffect(() => {
    fetchBalances();
    
    // Refresh balances every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  return {
    sol,
    usdc,
    isLoading,
    error,
    refetch: fetchBalances,
  };
}

