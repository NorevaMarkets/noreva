"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { User, UserProfile } from "@/types/database";
import { toUserProfile } from "@/types/database";

interface UseUserReturn {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage current user state
 * Automatically fetches/creates user when wallet connects
 */
export function useUser(): UseUserReturn {
  const { publicKey, connected } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = publicKey?.toBase58() || null;

  // Fetch user profile
  const fetchUser = useCallback(async () => {
    if (!walletAddress) {
      setUser(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user", {
        headers: {
          "x-wallet-address": walletAddress,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
      } else {
        setError(data.error || "Failed to fetch user");
      }
    } catch (err) {
      console.error("useUser fetch error:", err);
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Update user profile
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<boolean> => {
      if (!walletAddress) {
        setError("Wallet not connected");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-wallet-address": walletAddress,
          },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.data);
          return true;
        } else {
          setError(data.error || "Failed to update profile");
          return false;
        }
      } catch (err) {
        console.error("useUser update error:", err);
        setError("Failed to connect to server");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress]
  );

  // Auto-fetch user when wallet connects
  useEffect(() => {
    if (connected && walletAddress) {
      fetchUser();
    } else {
      setUser(null);
      setError(null);
    }
  }, [connected, walletAddress, fetchUser]);

  return {
    user,
    profile: user ? toUserProfile(user) : null,
    isLoading,
    error,
    isConnected: connected,
    updateProfile,
    refetch: fetchUser,
  };
}

