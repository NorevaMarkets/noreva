"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletAuth } from "./use-wallet-auth";

interface UseFavoritesReturn {
  favorites: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isFavorite: (symbol: string) => boolean;
  toggleFavorite: (symbol: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage stock favorites
 */
export function useFavorites(): UseFavoritesReturn {
  const { publicKey, connected } = useWallet();
  const { isAuthenticated, getAuthHeaders } = useWalletAuth();
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

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (symbol: string): Promise<boolean> => {
      if (!walletAddress || !isAuthenticated) {
        console.log("[Favorites] Not authenticated, cannot toggle");
        return false;
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
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}

