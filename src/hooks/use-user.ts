"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { User, UserProfile } from "@/types/database";
import { toUserProfile } from "@/types/database";
import { useWalletAuth } from "./use-wallet-auth";

interface UseUserReturn {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  authenticate: () => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage current user state
 * Automatically fetches/creates user when wallet connects and authenticates
 */
export function useUser(): UseUserReturn {
  const { publicKey, connected } = useWallet();
  const { isAuthenticated, isAuthenticating, authenticate, getAuthHeaders } = useWalletAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = publicKey?.toBase58() || null;

  // Fetch user profile
  const fetchUser = useCallback(async () => {
    if (!walletAddress || !isAuthenticated) {
      setUser(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user", {
        headers: getAuthHeaders(),
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
  }, [walletAddress, isAuthenticated, getAuthHeaders]);

  // Update user profile
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<boolean> => {
      if (!walletAddress) {
        setError("Wallet not connected");
        return false;
      }

      // Auto-authenticate if needed
      if (!isAuthenticated) {
        const success = await authenticate();
        if (!success) {
          setError("Authentication required");
          return false;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
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
    [walletAddress, isAuthenticated, authenticate, getAuthHeaders]
  );

  // Auto-fetch user when wallet connects AND authenticates
  useEffect(() => {
    if (connected && walletAddress && isAuthenticated) {
      fetchUser();
    } else if (!connected) {
      setUser(null);
      setError(null);
    }
  }, [connected, walletAddress, isAuthenticated, fetchUser]);

  return {
    user,
    profile: user ? toUserProfile(user) : null,
    isLoading: isLoading || isAuthenticating,
    error,
    isConnected: connected,
    isAuthenticated,
    authenticate,
    updateProfile,
    refetch: fetchUser,
  };
}
