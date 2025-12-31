/**
 * Jupiter Swap Integration
 * Enables real swaps between USDC/SOL and tokenized stocks
 * API Docs: https://dev.jup.ag/api-reference/swap/swap
 */

import { 
  Connection, 
  VersionedTransaction,
} from "@solana/web3.js";

// Well-known Solana token addresses
export const TOKENS = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  SOL: "So11111111111111111111111111111111111111112", // Wrapped SOL
} as const;

export interface SwapQuote {
  // Full Jupiter quote response (needed for swap)
  quoteResponse: any;
  // Simplified fields for UI
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan?: Array<{
    swapInfo: {
      label: string;
    };
  }>;
  swapTransaction?: string;
  lastValidBlockHeight?: number;
}

export interface SwapParams {
  inputMint: string;
  outputMint: string;
  amount: number; // In smallest unit (lamports for SOL, 6 decimals for USDC)
  slippageBps?: number; // Slippage in basis points (50 = 0.5%)
  userPublicKey: string;
}

export interface SwapResult {
  success: boolean;
  signature?: string;
  error?: string;
  quote?: SwapQuote;
}

// New Jupiter API (v1)
const JUPITER_API = "https://api.jup.ag/swap/v1";
// Helius RPC - from environment variable (secure)
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "";

/**
 * Clean mint address - remove "svm:" prefix
 */
export function cleanMintAddress(mintAddress: string): string {
  return mintAddress.startsWith("svm:") ? mintAddress.slice(4) : mintAddress;
}

/**
 * Get a swap quote from Jupiter
 * First tries local API route, then falls back to direct fetch
 */
export async function getSwapQuote(params: SwapParams): Promise<SwapQuote | null> {
  const { inputMint, outputMint, amount, slippageBps = 50, userPublicKey } = params;
  
  // Clean mint addresses
  const cleanInput = cleanMintAddress(inputMint);
  const cleanOutput = cleanMintAddress(outputMint);

  // Try local API first (handles API key server-side)
  try {
    const response = await fetch(
      `/api/jupiter/quote?` +
      `inputMint=${cleanInput}` +
      `&outputMint=${cleanOutput}` +
      `&amount=${amount}` +
      `&slippageBps=${slippageBps}` +
      `&userPublicKey=${userPublicKey}`
    );

    const data = await response.json();
    
    if (data.available) {
      return {
        // Store the FULL quote response for swap requests
        quoteResponse: data.quoteResponse,
        // Simplified fields for UI
        inputMint: data.inputMint,
        outputMint: data.outputMint,
        inAmount: data.inAmount,
        outAmount: data.outAmount,
        priceImpactPct: data.priceImpactPct || 0,
        routePlan: data.routePlan,
        swapTransaction: data.swapTransaction,
        lastValidBlockHeight: data.lastValidBlockHeight,
      };
    }
    
    console.warn("No route available:", data.error);
    return null;
  } catch (error) {
    console.error("Failed to get swap quote:", error);
    return null;
  }
}

/**
 * Get the swap transaction from Jupiter (via local API route)
 */
export async function getSwapTransaction(
  quote: SwapQuote, 
  userPublicKey: string
): Promise<{ swapTransaction: string; lastValidBlockHeight: number } | null> {
  try {
    // Use the full quoteResponse for the swap request
    const response = await fetch(`/api/jupiter/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quote: quote.quoteResponse, // Send the FULL Jupiter quote
        userPublicKey,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Jupiter swap error:", errorText);
      return null;
    }

    const data = await response.json();
    return {
      swapTransaction: data.swapTransaction,
      lastValidBlockHeight: data.lastValidBlockHeight,
    };
  } catch (error) {
    console.error("Failed to get swap transaction:", error);
    return null;
  }
}

/**
 * Execute a swap using the user's wallet
 */
export async function executeSwap(
  swapTransaction: string,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>,
  connection?: Connection
): Promise<SwapResult> {
  try {
    const conn = connection || new Connection(SOLANA_RPC);
    
    // Deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    
    // Sign the transaction with the user's wallet
    const signedTransaction = await signTransaction(transaction);
    
    // Send the transaction
    const signature = await conn.sendTransaction(signedTransaction, {
      skipPreflight: false,
      maxRetries: 3,
    });
    
    // Confirm the transaction
    const confirmation = await conn.confirmTransaction(signature, "confirmed");
    
    if (confirmation.value.err) {
      return {
        success: false,
        error: "Transaction failed: " + JSON.stringify(confirmation.value.err),
        signature,
      };
    }
    
    return {
      success: true,
      signature,
    };
  } catch (error) {
    console.error("Swap execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: number, decimals: number): string {
  return (amount / Math.pow(10, decimals)).toFixed(decimals > 6 ? 4 : 2);
}

/**
 * Parse user input to token amount
 */
export function parseTokenAmount(input: string, decimals: number): number {
  const parsed = parseFloat(input);
  if (isNaN(parsed)) return 0;
  return Math.floor(parsed * Math.pow(10, decimals));
}
