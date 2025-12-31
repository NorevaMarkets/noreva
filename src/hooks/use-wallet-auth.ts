"use client";

import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

// Auth token storage key
const AUTH_TOKEN_KEY = "noreva_auth_token";
const AUTH_WALLET_KEY = "noreva_auth_wallet";

interface AuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authToken: string | null;
  error: string | null;
}

interface UseWalletAuthReturn extends AuthState {
  authenticate: () => Promise<boolean>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

/**
 * Generate the authentication message
 */
function generateAuthMessage(walletAddress: string): string {
  const timestamp = Date.now().toString();
  return `Noreva Authentication\n\nWallet: ${walletAddress}\n\nSign this message to authenticate.\n\nNonce: ${timestamp}`;
}

/**
 * Create auth token from signed message
 */
function createAuthToken(
  message: string,
  signature: string,
  wallet: string
): string {
  const timestamp = Date.now().toString();
  const payload = JSON.stringify({ message, signature, wallet, timestamp });
  return "Signature " + btoa(payload);
}

/**
 * Hook for wallet-based authentication
 * Handles signing messages with the user's wallet for secure API access
 */
export function useWalletAuth(): UseWalletAuthReturn {
  const { publicKey, signMessage, connected, disconnecting } = useWallet();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isAuthenticating: false,
    authToken: null,
    error: null,
  });

  const walletAddress = publicKey?.toBase58() || null;

  // Check for existing auth token on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedWallet = localStorage.getItem(AUTH_WALLET_KEY);

    // If we have a stored token for this wallet, use it
    if (storedToken && storedWallet === walletAddress && walletAddress) {
      // Verify token is not expired (24 hours)
      try {
        const tokenPart = storedToken.slice(10);
        const { timestamp } = JSON.parse(atob(tokenPart));
        const tokenAge = Date.now() - parseInt(timestamp);
        const maxAge = 24 * 60 * 60 * 1000;

        if (tokenAge < maxAge) {
          setState({
            isAuthenticated: true,
            isAuthenticating: false,
            authToken: storedToken,
            error: null,
          });
          return;
        }
      } catch {
        // Invalid token, clear it
      }
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_WALLET_KEY);
    }

    // Clear auth if wallet changed
    if (storedWallet && storedWallet !== walletAddress) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_WALLET_KEY);
      setState({
        isAuthenticated: false,
        isAuthenticating: false,
        authToken: null,
        error: null,
      });
    }
  }, [walletAddress]);

  // Clear auth when disconnecting
  useEffect(() => {
    if (disconnecting) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_WALLET_KEY);
      setState({
        isAuthenticated: false,
        isAuthenticating: false,
        authToken: null,
        error: null,
      });
    }
  }, [disconnecting]);

  /**
   * Authenticate by signing a message with the wallet
   */
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!connected || !publicKey || !signMessage) {
      setState((prev) => ({
        ...prev,
        error: "Wallet not connected or does not support message signing",
      }));
      return false;
    }

    setState((prev) => ({
      ...prev,
      isAuthenticating: true,
      error: null,
    }));

    try {
      const wallet = publicKey.toBase58();
      const message = generateAuthMessage(wallet);

      // Request signature from wallet
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // Create auth token
      const authToken = createAuthToken(message, signature, wallet);

      // Store in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      localStorage.setItem(AUTH_WALLET_KEY, wallet);

      setState({
        isAuthenticated: true,
        isAuthenticating: false,
        authToken,
        error: null,
      });

      return true;
    } catch (error) {
      console.error("[Auth] Authentication failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";

      setState({
        isAuthenticated: false,
        isAuthenticating: false,
        authToken: null,
        error: errorMessage.includes("rejected")
          ? "Signature rejected by user"
          : errorMessage,
      });

      return false;
    }
  }, [connected, publicKey, signMessage]);

  /**
   * Logout - clear auth token
   */
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_WALLET_KEY);
    setState({
      isAuthenticated: false,
      isAuthenticating: false,
      authToken: null,
      error: null,
    });
  }, []);

  /**
   * Get headers for authenticated API requests
   * Returns both the auth token and wallet address for backwards compatibility
   */
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};

    if (state.authToken) {
      headers["Authorization"] = state.authToken;
    }

    // Also include wallet address for backwards compatibility during migration
    if (walletAddress) {
      headers["x-wallet-address"] = walletAddress;
    }

    return headers;
  }, [state.authToken, walletAddress]);

  return {
    ...state,
    authenticate,
    logout,
    getAuthHeaders,
  };
}

