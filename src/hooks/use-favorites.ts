"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface UseFavoritesReturn {
  favorites: string[];
  isLoading: boolean;
  canFavorite: boolean; // Whether the user CAN use favorites (wallet connected)
  isFavorite: (symbol: string) => boolean;
  toggleFavorite: (symbol: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage stock favorites
 * No authentication required - favorites are not sensitive data
 */
export function useFavorites(): UseFavoritesReturn {
  const { publicKey, connected } = useWallet();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const walletAddress = publicKey?.toBase58() || null;

  // Fetch favorites (no auth required)
  const fetchFavorites = useCallback(async () => {
    if (!walletAddress) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/favorites", {
        headers: {
          "x-wallet-address": walletAddress,
        },
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
  }, [walletAddress]);

  // Check if a symbol is a favorite
  const isFavorite = useCallback(
    (symbol: string) => favorites.includes(symbol),
    [favorites]
  );

  // Toggle favorite status (no auth required)
  const toggleFavorite = useCallback(
    async (symbol: string): Promise<boolean> => {
      if (!walletAddress) {
        console.log("[Favorites] No wallet connected");
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
            headers: {
              "x-wallet-address": walletAddress,
            },
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
              "x-wallet-address": walletAddress,
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
    [walletAddress, favorites]
  );

  // Auto-fetch on mount and when wallet connects
  useEffect(() => {
    if (connected && walletAddress) {
      fetchFavorites();
    } else if (!connected) {
      setFavorites([]);
    }
  }, [connected, walletAddress, fetchFavorites]);

  return {
    favorites,
    isLoading,
    canFavorite: connected, // User can favorite if wallet is connected
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}

