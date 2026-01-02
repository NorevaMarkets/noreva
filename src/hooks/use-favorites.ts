"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletAuth } from "./use-wallet-auth";

interface UseFavoritesReturn {
  favorites: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  canFavorite: boolean; // Whether the user CAN use favorites (wallet connected)
  isFavorite: (symbol: string) => boolean;
  toggleFavorite: (symbol: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage stock favorites
 */
export function useFavorites(): UseFavoritesReturn {
  const { publicKey, connected } = useWallet();
  const { isAuthenticated, authenticate, getAuthHeaders } = useWalletAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const walletAddress = publicKey?.toBase58() || null;

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    if (!walletAddress || !isAuthenticated) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/favorites", {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setFavorites(data.data || []);
      } else {
        console.warn("[Favorites] Failed to fetch:", data.error);
        setFavorites([]);
      }
    } catch (err) {
      console.error("[Favorites] Fetch error:", err);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, isAuthenticated, getAuthHeaders]);

  // Check if a symbol is a favorite
  const isFavorite = useCallback(
    (symbol: string) => favorites.includes(symbol),
    [favorites]
  );

  // Toggle favorite status (auto-authenticates if needed)
  const toggleFavorite = useCallback(
    async (symbol: string): Promise<boolean> => {
      if (!walletAddress) {
        console.log("[Favorites] No wallet connected");
        return false;
      }

      // Auto-authenticate if not already authenticated
      let currentlyAuthenticated = isAuthenticated;
      if (!currentlyAuthenticated) {
        console.log("[Favorites] Not authenticated, requesting signature...");
        const authSuccess = await authenticate();
        if (!authSuccess) {
          console.log("[Favorites] Authentication failed or rejected");
          return false;
        }
        currentlyAuthenticated = true;
      }

      const isCurrentlyFavorite = favorites.includes(symbol);

      // Optimistic update
      if (isCurrentlyFavorite) {
        setFavorites((prev) => prev.filter((s) => s !== symbol));
      } else {
        setFavorites((prev) => [symbol, ...prev]);
      }

      try {
        if (isCurrentlyFavorite) {
          // Remove favorite
          const response = await fetch(`/api/favorites?symbol=${symbol}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });

          const data = await response.json();

          if (!data.success) {
            // Revert on failure
            setFavorites((prev) => [symbol, ...prev]);
            return false;
          }
        } else {
          // Add favorite
          const response = await fetch("/api/favorites", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ symbol }),
          });

          const data = await response.json();

          if (!data.success) {
            // Revert on failure
            setFavorites((prev) => prev.filter((s) => s !== symbol));
            return false;
          }
        }

        return true;
      } catch (err) {
        console.error("[Favorites] Toggle error:", err);
        // Revert on error
        if (isCurrentlyFavorite) {
          setFavorites((prev) => [symbol, ...prev]);
        } else {
          setFavorites((prev) => prev.filter((s) => s !== symbol));
        }
        return false;
      }
    },
    [walletAddress, isAuthenticated, favorites, getAuthHeaders]
  );

  // Auto-fetch on mount and when wallet connects and authenticates
  useEffect(() => {
    if (connected && walletAddress && isAuthenticated) {
      fetchFavorites();
    } else if (!connected) {
      setFavorites([]);
    }
  }, [connected, walletAddress, isAuthenticated, fetchFavorites]);

  return {
    favorites,
    isLoading,
    isAuthenticated,
    canFavorite: connected, // User can favorite if wallet is connected (auth will be requested on click)
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}

