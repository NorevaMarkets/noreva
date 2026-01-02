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

export type SwapStage = "signing" | "sending" | "confirming" | "confirmed" | "error";

export interface ExecuteSwapOptions {
  swapTransaction: string;
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
  connection?: Connection;
  lastValidBlockHeight?: number;
  onStatusChange?: (stage: SwapStage) => void;
}

/**
 * Execute a swap using the user's wallet
 */
export async function executeSwap(
  swapTransaction: string,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>,
  connection?: Connection,
  lastValidBlockHeight?: number,
  onStatusChange?: (stage: SwapStage) => void
): Promise<SwapResult> {
  const updateStatus = (stage: SwapStage) => {
    console.log(`[Swap] Stage: ${stage}`);
    onStatusChange?.(stage);
  };

  try {
    const conn = connection || new Connection(SOLANA_RPC);
    
    // Deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    
    // Extract the blockhash from the transaction
    const transactionBlockhash = transaction.message.recentBlockhash;
    console.log("[Swap] Transaction blockhash:", transactionBlockhash);
    console.log("[Swap] lastValidBlockHeight from Jupiter:", lastValidBlockHeight);
    
    // Stage 1: Requesting signature
    updateStatus("signing");
    console.log("[Swap] Requesting wallet signature...");
    
    // Sign the transaction with the user's wallet
    const signedTransaction = await signTransaction(transaction);
    
    // Stage 2: Sending transaction
    updateStatus("sending");
    console.log("[Swap] Transaction signed, sending...");
    
    // Send the transaction with optimized settings
    const signature = await conn.sendTransaction(signedTransaction, {
      skipPreflight: true, // Skip preflight for faster submission
      maxRetries: 3,
    });
    
    console.log("[Swap] Transaction sent:", signature);
    
    // Stage 3: Waiting for confirmation
    updateStatus("confirming");
    
    // Use the SAME blockhash from the transaction, not a new one!
    // This is critical - the lastValidBlockHeight corresponds to this specific blockhash
    const blockHeight = lastValidBlockHeight || (await conn.getBlockHeight()) + 150;
    
    console.log("[Swap] Waiting for confirmation with blockHeight:", blockHeight);
    
    // Use the new confirmTransaction API
    const confirmationPromise = conn.confirmTransaction({
      signature,
      blockhash: transactionBlockhash, // Use the blockhash from the transaction!
      lastValidBlockHeight: blockHeight,
    }, "confirmed");
    
    // Add a manual timeout (90 seconds - Solana can be slow during congestion)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Transaction confirmation timeout (90s)")), 90000);
    });
    
    console.log("[Swap] Waiting for confirmation...");
    
    try {
      const confirmation = await Promise.race([confirmationPromise, timeoutPromise]);
      
      if (confirmation.value.err) {
        console.error("[Swap] Transaction failed:", confirmation.value.err);
        updateStatus("error");
        return {
          success: false,
          error: "Transaction failed: " + JSON.stringify(confirmation.value.err),
          signature,
        };
      }
      
      // Stage 4: Confirmed!
      updateStatus("confirmed");
      console.log("[Swap] Transaction confirmed!");
      
      return {
        success: true,
        signature,
      };
    } catch (confirmError) {
      // If confirmation times out or fails, check if the transaction actually succeeded
      console.log("[Swap] Confirmation error, checking transaction status...");
      console.log("[Swap] Confirm error details:", confirmError);
      
      try {
        // Wait a moment and check the signature status
        await new Promise(resolve => setTimeout(resolve, 2000));
        const status = await conn.getSignatureStatus(signature);
        console.log("[Swap] Signature status:", JSON.stringify(status.value, null, 2));
        
        if (status.value?.confirmationStatus === "confirmed" || status.value?.confirmationStatus === "finalized") {
          if (!status.value.err) {
            console.log("[Swap] Transaction actually confirmed!");
            updateStatus("confirmed");
            return {
              success: true,
              signature,
            };
          } else {
            // Transaction failed on-chain
            console.error("[Swap] Transaction failed on-chain:", status.value.err);
            updateStatus("error");
            return {
              success: false,
              error: "Transaction failed on-chain. Check Solscan for details.",
              signature,
            };
          }
        }
        
        // Transaction not yet confirmed - might still be processing
        console.log("[Swap] Transaction status unknown, may still be processing");
      } catch (statusError) {
        console.error("[Swap] Error checking status:", statusError);
      }
      
      // Re-throw the original error
      throw confirmError;
    }
  } catch (error) {
    console.error("[Swap] Execution error:", error);
    console.error("[Swap] Error type:", typeof error);
    console.error("[Swap] Error stringified:", JSON.stringify(error, Object.getOwnPropertyNames(error as object)));
    updateStatus("error");
    
    // Extract error message from various error types
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      // Handle non-Error objects (like Solana errors)
      errorMessage = JSON.stringify(error);
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    
    // Check if user rejected the transaction
    if (errorMessage.includes("User rejected") || errorMessage.includes("rejected")) {
      return {
        success: false,
        error: "Transaction rejected by user",
      };
    }
    
    // Check for block height exceeded - give helpful message
    if (errorMessage.includes("block height exceeded") || errorMessage.includes("BlockheightExceeded")) {
      return {
        success: false,
        error: "Transaction expired. Please try again - Solana network may be congested.",
      };
    }
    
    // Check for insufficient funds
    if (errorMessage.includes("insufficient") || errorMessage.includes("Insufficient")) {
      return {
        success: false,
        error: "Insufficient funds for this swap.",
      };
    }
    
    // Check for slippage error
    if (errorMessage.includes("slippage") || errorMessage.includes("Slippage")) {
      return {
        success: false,
        error: "Price changed too much. Try increasing slippage or try again.",
      };
    }
    
    return {
      success: false,
      error: errorMessage.length > 100 ? "Swap failed. Please try again." : errorMessage,
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
