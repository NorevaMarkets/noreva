"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { cn } from "@/lib/utils";
import type { StockWithPrice } from "@/types";
import { 
  getSwapQuote, 
  getSwapTransaction, 
  executeSwap,
  cleanMintAddress,
  TOKENS,
  type SwapQuote,
  type SwapStage,
} from "@/lib/swap";
import { useWalletBalance, USDC_DECIMALS } from "@/hooks/use-wallet-balance";
import { useTradeHistory } from "@/hooks/use-trade-history";
import { useWalletAuth } from "@/hooks/use-wallet-auth";

interface TradingPanelProps {
  stock: StockWithPrice;
}

type PaymentToken = "USDC" | "SOL";
type SwapStatus = "idle" | "fetching" | "ready" | "signing" | "sending" | "confirming" | "success" | "error";

export function TradingPanel({ stock }: TradingPanelProps) {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { sol: solBalance, usdc: usdcBalance, isLoading: isLoadingBalance, error: balanceError, refetch: refetchBalances } = useWalletBalance();
  const { recordTrade } = useTradeHistory({ autoFetch: false });
  const { isAuthenticated, authenticate } = useWalletAuth();
  
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [paymentToken, setPaymentToken] = useState<PaymentToken>("USDC");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [status, setStatus] = useState<SwapStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  
  // Stock token balance
  const [stockBalance, setStockBalance] = useState<number>(0);
  const [isLoadingStockBalance, setIsLoadingStockBalance] = useState(false);

  // Get the token mint address (remove svm: prefix)
  const tokenMintAddress = useMemo(() => {
    const addr = (stock as any).mintAddress;
    return addr && addr !== "N/A" ? cleanMintAddress(addr) : null;
  }, [stock]);

  const hasSolana = (stock as any).hasSolana ?? false;
  const stockDecimals = (stock as any).decimals || 8;

  // Fetch stock token balance using the portfolio API (more reliable)
  const fetchStockBalance = useCallback(async () => {
    if (!publicKey || !tokenMintAddress) {
      setStockBalance(0);
      return;
    }

    setIsLoadingStockBalance(true);
    try {
      // Use portfolio API which handles RPC correctly
      const response = await fetch(`/api/portfolio?wallet=${publicKey.toString()}`);
      const data = await response.json();
      
      if (data.success && data.holdings) {
        // Find this specific stock in holdings
        const holding = data.holdings.find((h: any) => h.mintAddress === tokenMintAddress);
        if (holding) {
          setStockBalance(holding.balance);
          return;
        }
      }
      setStockBalance(0);
    } catch (err) {
      console.error("Failed to fetch stock balance:", err);
      setStockBalance(0);
    } finally {
      setIsLoadingStockBalance(false);
    }
  }, [publicKey, tokenMintAddress]);

  // Fetch stock balance on mount and when relevant deps change
  useEffect(() => {
    fetchStockBalance();
  }, [fetchStockBalance]);

  // Calculate input amount in smallest units (handle comma as decimal)
  const inputAmount = useMemo(() => {
    const normalized = amount.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (isNaN(parsed) || parsed <= 0) return 0;
    
    if (mode === "buy") {
      const decimals = paymentToken === "USDC" ? USDC_DECIMALS : 9;
      return Math.floor(parsed * Math.pow(10, decimals));
    } else {
      // Selling stock tokens
      return Math.floor(parsed * Math.pow(10, stockDecimals));
    }
  }, [amount, paymentToken, mode, stockDecimals]);

  // Track if we should skip fetching (during success/error display)
  const skipFetchRef = useRef(false);
  
  // Reset skip flag when user changes input
  useEffect(() => {
    if (amount) {
      skipFetchRef.current = false;
    }
  }, [amount]);

  // Fetch quote when amount changes
  useEffect(() => {
    if (!inputAmount || !tokenMintAddress || !publicKey) {
      setQuote(null);
      if (!skipFetchRef.current) {
        setStatus("idle");
      }
      return;
    }

    // Don't fetch if we're showing success/error feedback
    if (skipFetchRef.current) {
      return;
    }

    let cancelled = false;

    const fetchQuote = async () => {
      setStatus("fetching");
      setError(null);

      let inputMint: string;
      let outputMint: string;

      if (mode === "buy") {
        // Buy: Pay USDC/SOL → Receive stock token
        inputMint = paymentToken === "USDC" ? TOKENS.USDC : TOKENS.SOL;
        outputMint = tokenMintAddress;
      } else {
        // Sell: Pay stock token → Receive USDC/SOL
        inputMint = tokenMintAddress;
        outputMint = paymentToken === "USDC" ? TOKENS.USDC : TOKENS.SOL;
      }

      const swapQuote = await getSwapQuote({
        inputMint,
        outputMint,
        amount: inputAmount,
        slippageBps: 250, // 2.5% slippage (tokenized stocks have less liquidity)
        userPublicKey: publicKey.toString(),
      });

      if (cancelled) return;

      if (swapQuote) {
        setQuote(swapQuote);
        setStatus("ready");
      } else {
        setQuote(null);
        setStatus("error");
        setError("No route found. This token may not have liquidity.");
      }
    };

    const debounceTimer = setTimeout(fetchQuote, 500);
    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [inputAmount, tokenMintAddress, publicKey, paymentToken, mode]);

  // Handle swap execution
  const handleSwap = async () => {
    if (!publicKey || !signTransaction || !tokenMintAddress || !inputAmount) return;

    // First, show "fetching" while we get a FRESH quote and transaction
    setStatus("fetching");
    setError(null);

    try {
      // Get a FRESH quote right before swap (prevents stale price errors)
      let inputMint: string;
      let outputMint: string;

      if (mode === "buy") {
        inputMint = paymentToken === "USDC" ? TOKENS.USDC : TOKENS.SOL;
        outputMint = tokenMintAddress;
      } else {
        inputMint = tokenMintAddress;
        outputMint = paymentToken === "USDC" ? TOKENS.USDC : TOKENS.SOL;
      }

      console.log("[Swap] Getting fresh quote...");
      const freshQuote = await getSwapQuote({
        inputMint,
        outputMint,
        amount: inputAmount,
        slippageBps: 250, // 2.5% slippage
        userPublicKey: publicKey.toString(),
      });

      if (!freshQuote) {
        setStatus("error");
        setError("Failed to get quote. No route available.");
        return;
      }

      // Update the displayed quote
      setQuote(freshQuote);

      // Get the swap transaction from Jupiter with fresh quote
      const swapTx = await getSwapTransaction(freshQuote, publicKey.toString());
      
      if (!swapTx) {
        setStatus("error");
        setError("Failed to create swap transaction");
        return;
      }

      // NOW we're ready to sign - this is when the wallet popup appears
      setStatus("signing");

      // Execute the swap with status callbacks
      const result = await executeSwap(
        swapTx.swapTransaction, 
        signTransaction, 
        connection,
        swapTx.lastValidBlockHeight,
        (stage: SwapStage) => {
          // Map swap stages to UI status
          // Note: "signing" is already set above before executeSwap
          if (stage === "sending") setStatus("sending");
          else if (stage === "confirming") setStatus("confirming");
          // "confirmed" and "error" are handled below
        }
      );

      if (result.success && result.signature) {
        skipFetchRef.current = true; // Prevent fetching during success display
        setStatus("success");
        setTxSignature(result.signature);
        
        // Record trade in database (don't await to avoid blocking UI)
        const tokenAmount = mode === "buy" 
          ? parseFloat(freshQuote.outAmount) / Math.pow(10, stockDecimals)
          : parsedAmount;
        const usdcAmount = mode === "buy"
          ? (paymentToken === "USDC" ? parsedAmount : (outputAmount || 0))
          : (paymentToken === "USDC" ? (outputAmount || 0) : parsedAmount * stock.price.tokenPrice);
        
        // Record trade in background (non-blocking)
        // If not authenticated, try to authenticate first (silent - won't block UI)
        const doRecordTrade = async () => {
          // If not authenticated, try to authenticate first
          if (!isAuthenticated) {
            console.log("[Trade] Not authenticated, attempting auth before recording...");
            const authSuccess = await authenticate();
            if (!authSuccess) {
              console.warn("[Trade] Auth failed, trade not recorded (can still see it on Solscan)");
              return;
            }
          }
          
          const tradeRecord = await recordTrade({
            type: mode,
            symbol: stock.symbol,
            stockName: stock.name,
            tokenAmount,
            usdcAmount,
            pricePerToken: stock.price.tokenPrice,
            txSignature: result.signature,
          });
          
          if (tradeRecord) {
            console.log("[Trade] Recorded successfully:", tradeRecord.id);
          } else {
            console.warn("[Trade] Failed to record trade");
          }
        };
        
        doRecordTrade().catch((tradeErr) => {
          console.error("[Trade] Error recording trade:", tradeErr);
        });
        
        setAmount("");
        setQuote(null);
        refetchBalances();
        fetchStockBalance(); // Refresh stock balance too
      } else {
        skipFetchRef.current = true; // Prevent fetching during error display
        setStatus("error");
        setError(result.error || "Swap failed");
      }
    } catch (err) {
      skipFetchRef.current = true; // Prevent fetching during error display
      setStatus("error");
      setError(err instanceof Error ? err.message : "Swap failed");
    }
  };

  // Calculate output amount for display
  const outputAmount = useMemo(() => {
    if (!quote) return null;
    
    if (mode === "buy") {
      // Output is stock tokens (usually 8 decimals)
      return parseFloat(quote.outAmount) / Math.pow(10, stockDecimals);
    } else {
      // Output is USDC (6 decimals) or SOL (9 decimals)
      const decimals = paymentToken === "USDC" ? USDC_DECIMALS : 9;
      return parseFloat(quote.outAmount) / Math.pow(10, decimals);
    }
  }, [quote, mode, paymentToken, stockDecimals]);

  // Get balance based on mode
  const currentBalance = useMemo(() => {
    if (mode === "buy") {
      return paymentToken === "USDC" ? usdcBalance : solBalance;
    } else {
      return stockBalance;
    }
  }, [mode, paymentToken, usdcBalance, solBalance, stockBalance]);

  const currentBalanceLabel = useMemo(() => {
    if (mode === "buy") {
      return paymentToken;
    } else {
      return stock.underlying;
    }
  }, [mode, paymentToken, stock.underlying]);

  // Parse amount (handle both comma and dot as decimal separator)
  const parsedAmount = useMemo(() => {
    const normalized = amount.replace(",", ".");
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }, [amount]);

  // Add small tolerance for floating point comparison
  const insufficientBalance = parsedAmount > (currentBalance * 1.0001) && parsedAmount > 0;

  // Handle Max button - use floor to avoid rounding up beyond actual balance
  const handleMaxClick = () => {
    if (mode === "buy") {
      // Max is payment token balance (leave a bit of SOL for fees)
      if (paymentToken === "SOL") {
        const maxSol = Math.max(0, solBalance - 0.01); // Leave 0.01 SOL for fees
        setAmount(floorToDecimals(maxSol, 4).toString());
      } else {
        setAmount(floorToDecimals(usdcBalance, 2).toString());
      }
    } else {
      // Max is stock token balance - use 99% to leave room for Token-2022 transfer fees
      // Token-2022 tokens often have transfer fees that need to be accounted for
      const maxStock = stockBalance * 0.99; // Leave 1% for potential fees
      const decimals = stockDecimals > 4 ? 4 : stockDecimals;
      setAmount(floorToDecimals(maxStock, decimals).toString());
    }
  };
  
  // Helper to floor a number to specific decimals (avoid rounding up)
  function floorToDecimals(num: number, decimals: number): number {
    const multiplier = Math.pow(10, decimals);
    return Math.floor(num * multiplier) / multiplier;
  }

  // Render connect wallet state
  if (!connected) {
    return (
      <div className="p-3 flex flex-col h-full items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          </svg>
        </div>
        <p className="text-[11px] font-medium text-[var(--foreground)]">Connect Wallet to Trade</p>
        <p className="text-[9px] text-[var(--foreground-subtle)] mt-1">
          Connect your Solana wallet to buy or sell {stock.underlying}
        </p>
      </div>
    );
  }

  // Render no Solana deployment state
  if (!hasSolana || !tokenMintAddress) {
    return (
      <div className="p-3 flex flex-col h-full items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--negative)]/10 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-[var(--negative)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <p className="text-[11px] font-medium text-[var(--foreground)]">Not Available on Solana</p>
        <p className="text-[9px] text-[var(--foreground-subtle)] mt-1">
          This token is not deployed on Solana yet
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 flex flex-col h-full relative overflow-hidden">
      {/* Header with balance */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          Swap
        </div>
        <div className="text-[9px] text-[var(--foreground-subtle)]">
          {(isLoadingBalance || isLoadingStockBalance) ? (
            <span className="animate-pulse">Loading...</span>
          ) : balanceError ? (
            <span className="text-[var(--negative)]">RPC Error</span>
          ) : (
            <span>
              {currentBalanceLabel}: {currentBalance.toFixed(mode === "sell" ? 4 : (paymentToken === "USDC" ? 2 : 4))}
            </span>
          )}
        </div>
      </div>

      {/* Wallet Balances Overview */}
      <div className="grid grid-cols-3 gap-1 mb-3 p-2 bg-[var(--background-tertiary)] rounded-lg">
        <div className="text-center">
          <div className="text-[8px] text-[var(--foreground-subtle)] uppercase">SOL</div>
          <div className="text-[10px] font-mono font-bold text-[var(--foreground)]">
            {isLoadingBalance ? "..." : solBalance.toFixed(3)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[8px] text-[var(--foreground-subtle)] uppercase">USDC</div>
          <div className="text-[10px] font-mono font-bold text-[var(--foreground)]">
            {isLoadingBalance ? "..." : usdcBalance.toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[8px] text-[var(--foreground-subtle)] uppercase">{stock.underlying}</div>
          <div className="text-[10px] font-mono font-bold text-[var(--accent)]">
            {isLoadingStockBalance ? "..." : stockBalance.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="flex mb-3">
        <button
          onClick={() => { setMode("buy"); setAmount(""); setQuote(null); }}
          className={cn(
            "flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-wide border transition-all rounded-l-lg",
            mode === "buy"
              ? "border-[var(--positive)] text-[var(--positive)] bg-[var(--positive)]/10"
              : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border-hover)]"
          )}
        >
          Buy
        </button>
        <button
          onClick={() => { setMode("sell"); setAmount(""); setQuote(null); }}
          className={cn(
            "flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-wide border-t border-b border-r transition-all rounded-r-lg",
            mode === "sell"
              ? "border-[var(--negative)] text-[var(--negative)] bg-[var(--negative)]/10"
              : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border-hover)]"
          )}
        >
          Sell
        </button>
      </div>

      {/* Payment Token Selection (only show when relevant) */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setPaymentToken("USDC")}
          className={cn(
            "flex-1 py-1 text-[9px] font-medium rounded transition-all",
            paymentToken === "USDC"
              ? "bg-[var(--accent)] text-[var(--background)]"
              : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)]/80"
          )}
        >
          {mode === "buy" ? "Pay USDC" : "Get USDC"}
        </button>
        <button
          onClick={() => setPaymentToken("SOL")}
          className={cn(
            "flex-1 py-1 text-[9px] font-medium rounded transition-all",
            paymentToken === "SOL"
              ? "bg-[var(--accent)] text-[var(--background)]"
              : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)]/80"
          )}
        >
          {mode === "buy" ? "Pay SOL" : "Get SOL"}
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-2">
        <label className="text-[9px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1 block">
          {mode === "buy" ? `You Pay (${paymentToken})` : `You Sell (${stock.underlying})`}
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={cn(
              "w-full px-2 py-2 bg-[var(--background-tertiary)] border text-[var(--foreground)] font-mono text-sm rounded-lg focus:outline-none transition-colors",
              insufficientBalance 
                ? "border-[var(--negative)] focus:border-[var(--negative)]" 
                : "border-[var(--border)] focus:border-[var(--accent)]/50"
            )}
          />
          <button
            onClick={handleMaxClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-[var(--accent)] hover:text-[var(--accent-light)] font-semibold"
          >
            MAX
          </button>
        </div>
        {insufficientBalance && (
          <p className="text-[8px] text-[var(--negative)] mt-1">Insufficient balance</p>
        )}
      </div>

      {/* Loading Overlay */}
      {(status === "signing" || status === "sending" || status === "confirming") && (
        <div className="absolute inset-0 bg-[var(--background)]/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-[var(--accent)]/20 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-[var(--foreground)] mb-1">
            {status === "signing" ? "Waiting for Approval" : 
             status === "sending" ? "Sending Transaction" :
             "Confirming on Blockchain"}
          </p>
          <p className="text-[10px] text-[var(--foreground-muted)] text-center px-4">
            {status === "signing" 
              ? "Please approve the transaction in your wallet" 
              : status === "sending"
              ? "Broadcasting to Solana network..."
              : "Waiting for blockchain confirmation..."}
          </p>
        </div>
      )}

      {/* Success Overlay */}
      {status === "success" && txSignature && (
        <div className="absolute inset-0 bg-[var(--background)]/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
          <div className="w-16 h-16 bg-[var(--positive)]/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[var(--positive)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-bold text-[var(--positive)] mb-1">Swap Successful!</p>
          <p className="text-[10px] text-[var(--foreground-muted)] mb-4">
            {mode === "buy" ? "You bought" : "You sold"} {stock.underlying}
          </p>
          <a
            href={`https://solscan.io/tx/${txSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg text-xs font-semibold hover:bg-[var(--accent-light)] transition-colors mb-2"
          >
            View on Solscan →
          </a>
          <button
            onClick={() => { skipFetchRef.current = false; setStatus("idle"); setTxSignature(null); }}
            className="text-[10px] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Output Preview */}
      {status === "fetching" && (
        <div className="mb-2 p-2 bg-[var(--background-tertiary)] rounded-lg">
          <div className="flex items-center gap-2 text-[9px] text-[var(--foreground-subtle)]">
            <div className="animate-spin h-3 w-3 border border-[var(--accent)] border-t-transparent rounded-full"></div>
            Fetching quote...
          </div>
        </div>
      )}

      {quote && outputAmount !== null && status !== "signing" && status !== "confirming" && status !== "success" && (
        <div className="mb-2 p-2 bg-[var(--background-tertiary)] rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-[var(--foreground-subtle)]">
              {mode === "buy" ? "You Receive" : "You Get"}
            </span>
            <span className="text-[11px] font-bold font-mono text-[var(--foreground)]">
              {outputAmount.toFixed(mode === "buy" ? 4 : 2)} {mode === "buy" ? stock.underlying : paymentToken}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-[var(--foreground-subtle)]">Price Impact</span>
            <span className={cn(
              "text-[8px] font-mono",
              quote.priceImpactPct < 1 ? "text-[var(--positive)]" : 
              quote.priceImpactPct < 3 ? "text-[var(--accent)]" : "text-[var(--negative)]"
            )}>
              {quote.priceImpactPct.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-2 p-2 bg-[var(--negative)]/10 border border-[var(--negative)]/30 rounded-lg">
          <p className="text-[9px] text-[var(--negative)]">{error}</p>
          <button
            onClick={() => { skipFetchRef.current = false; setStatus("idle"); setError(null); }}
            className="text-[8px] text-[var(--foreground-muted)] hover:text-[var(--foreground)] mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Trade Button */}
      <button
        onClick={handleSwap}
        disabled={
          !quote || 
          status === "fetching" || 
          status === "signing" || 
          status === "sending" ||
          status === "confirming" ||
          insufficientBalance
        }
        className={cn(
          "mt-auto w-full py-2.5 rounded-lg font-semibold text-xs transition-all",
          mode === "buy"
            ? "bg-[var(--positive)] text-white hover:bg-[var(--positive)]/90 disabled:bg-[var(--positive)]/50"
            : "bg-[var(--negative)] text-white hover:bg-[var(--negative)]/90 disabled:bg-[var(--negative)]/50",
          "disabled:cursor-not-allowed"
        )}
      >
        {status === "signing" ? "Approve in Wallet..." :
         status === "sending" ? "Sending Transaction..." :
         status === "confirming" ? "Confirming on Chain..." :
         status === "fetching" ? "Loading..." :
         `${mode === "buy" ? "Buy" : "Sell"} ${stock.underlying}`}
      </button>

      {/* Disclaimer */}
      <p className="mt-2 text-[7px] text-[var(--foreground-subtle)] text-center opacity-50">
        Swaps powered by Jupiter Aggregator
      </p>
    </div>
  );
}
