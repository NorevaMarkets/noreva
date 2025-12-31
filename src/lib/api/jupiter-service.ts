/**
 * Jupiter Swap Service
 * Handles swap quotes and transactions via Jupiter DEX aggregator
 * 
 * Jupiter API Documentation: https://station.jup.ag/docs/apis/swap-api
 */

import { siteConfig } from "@/config/site";

// USDC mint address on Solana mainnet
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Slippage tolerance in basis points (50 = 0.5%)
const DEFAULT_SLIPPAGE_BPS = 50;

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  outputAmount: string;
  priceImpactPct: number;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  routePlan: RoutePlan[];
}

interface RoutePlan {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface SwapTransaction {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports?: number;
}

/**
 * Get a swap quote from Jupiter
 */
export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = DEFAULT_SLIPPAGE_BPS
): Promise<SwapQuote | null> {
  try {
    // Amount in smallest unit (lamports for SOL, or token decimals)
    const amountInSmallestUnit = Math.floor(amount * 1e6); // Assuming USDC with 6 decimals
    
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amountInSmallestUnit.toString(),
      slippageBps: slippageBps.toString(),
      swapMode: "ExactIn",
    });

    const response = await fetch(`${siteConfig.api.jupiter}/quote?${params}`);
    
    if (!response.ok) {
      console.error("Jupiter quote error:", response.status);
      return null;
    }

    const data = await response.json();
    return data as SwapQuote;
  } catch (error) {
    console.error("Failed to get swap quote:", error);
    return null;
  }
}

/**
 * Get swap transaction from Jupiter
 * Requires a connected wallet to sign
 */
export async function getSwapTransaction(
  quote: SwapQuote,
  userPublicKey: string
): Promise<SwapTransaction | null> {
  try {
    const response = await fetch(`${siteConfig.api.jupiter}/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      }),
    });

    if (!response.ok) {
      console.error("Jupiter swap error:", response.status);
      return null;
    }

    const data = await response.json();
    return data as SwapTransaction;
  } catch (error) {
    console.error("Failed to get swap transaction:", error);
    return null;
  }
}

/**
 * Get a quote for buying a tokenized stock with USDC
 */
export async function getBuyQuote(
  stockMintAddress: string,
  usdcAmount: number
): Promise<SwapQuote | null> {
  return getSwapQuote(USDC_MINT, stockMintAddress, usdcAmount);
}

/**
 * Get a quote for selling a tokenized stock for USDC
 */
export async function getSellQuote(
  stockMintAddress: string,
  tokenAmount: number,
  tokenDecimals: number = 8
): Promise<SwapQuote | null> {
  // Adjust amount for token decimals
  const adjustedAmount = tokenAmount * Math.pow(10, tokenDecimals - 6); // Convert to USDC-equivalent scale
  return getSwapQuote(stockMintAddress, USDC_MINT, adjustedAmount);
}

/**
 * Format quote for display
 */
export function formatQuoteForDisplay(quote: SwapQuote, decimals: number = 6) {
  const inputAmount = Number(quote.inputAmount) / Math.pow(10, decimals);
  const outputAmount = Number(quote.outputAmount) / Math.pow(10, decimals);
  const priceImpact = quote.priceImpactPct;
  
  return {
    inputAmount: inputAmount.toFixed(4),
    outputAmount: outputAmount.toFixed(4),
    priceImpact: (priceImpact * 100).toFixed(2) + "%",
    rate: (outputAmount / inputAmount).toFixed(4),
    routes: quote.routePlan.map(r => r.swapInfo.label).join(" → "),
  };
}

/**
 * Check if price impact is acceptable
 */
export function isPriceImpactAcceptable(quote: SwapQuote, maxImpactPct: number = 1): boolean {
  return quote.priceImpactPct * 100 <= maxImpactPct;
}

