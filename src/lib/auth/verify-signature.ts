/**
 * Wallet Signature Verification
 * Verifies that a message was signed by a specific Solana wallet
 */

import nacl from "tweetnacl";
import bs58 from "bs58";

// Message format for authentication
const AUTH_MESSAGE_PREFIX = "Noreva Authentication\n\nWallet: ";
const AUTH_MESSAGE_SUFFIX = "\n\nSign this message to authenticate.";

/**
 * Generate the authentication message for a wallet
 */
export function generateAuthMessage(walletAddress: string, nonce?: string): string {
  const timestamp = nonce || Date.now().toString();
  return `${AUTH_MESSAGE_PREFIX}${walletAddress}${AUTH_MESSAGE_SUFFIX}\n\nNonce: ${timestamp}`;
}

/**
 * Verify a signed message from a Solana wallet
 * @param message - The original message that was signed
 * @param signature - The signature in base58 format
 * @param walletAddress - The wallet address (public key) in base58
 * @returns true if signature is valid, false otherwise
 */
export function verifySignature(
  message: string,
  signature: string,
  walletAddress: string
): boolean {
  try {
    // Convert inputs from base58/string
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(walletAddress);

    // Verify the signature
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error("[Auth] Signature verification failed:", error);
    return false;
  }
}

/**
 * Verify an auth token (message + signature + wallet)
 * Returns the wallet address if valid, null otherwise
 */
export function verifyAuthToken(authHeader: string): string | null {
  try {
    // Auth header format: "Signature <base64 encoded JSON>"
    if (!authHeader.startsWith("Signature ")) {
      return null;
    }

    const tokenPart = authHeader.slice(10); // Remove "Signature "
    const decoded = Buffer.from(tokenPart, "base64").toString("utf-8");
    const { message, signature, wallet, timestamp } = JSON.parse(decoded);

    // Check timestamp (valid for 24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (tokenAge > maxAge) {
      console.log("[Auth] Token expired");
      return null;
    }

    // Verify signature
    if (verifySignature(message, signature, wallet)) {
      return wallet;
    }

    return null;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Create an auth token from message, signature, and wallet
 * This is used client-side to create the authorization header
 */
export function createAuthToken(
  message: string,
  signature: string,
  wallet: string
): string {
  const timestamp = Date.now().toString();
  const payload = JSON.stringify({ message, signature, wallet, timestamp });
  return "Signature " + Buffer.from(payload).toString("base64");
}

