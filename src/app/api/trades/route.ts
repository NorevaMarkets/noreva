import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Trade, TradeInsert } from "@/types/trade";

/**
 * GET /api/trades
 * Get trade history for a wallet
 * Requires x-wallet-address header
 */
export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.headers.get("x-wallet-address");

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 401 }
      );
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabaseAdmin
      .from("trades")
      .select("*")
      .eq("wallet_address", walletAddress)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by symbol if provided
    if (symbol) {
      query = query.eq("symbol", symbol);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching trades:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch trades" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as Trade[],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("GET /api/trades error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trades
 * Record a new trade
 * Requires x-wallet-address header
 */
export async function POST(request: NextRequest) {
  try {
    const walletAddress = request.headers.get("x-wallet-address");

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { type, symbol, tokenAmount, usdcAmount, pricePerToken, stockName, txSignature } = body;

    if (!type || !symbol || !tokenAmount || !usdcAmount || !pricePerToken) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (type !== "buy" && type !== "sell") {
      return NextResponse.json(
        { success: false, error: "Invalid trade type" },
        { status: 400 }
      );
    }

    // Create trade record
    const tradeData: TradeInsert = {
      wallet_address: walletAddress,
      type,
      symbol,
      stock_name: stockName || symbol,
      token_amount: tokenAmount,
      usdc_amount: usdcAmount,
      price_per_token: pricePerToken,
      tx_signature: txSignature || null,
      status: txSignature ? "confirmed" : "pending",
    };

    const { data, error } = await supabaseAdmin
      .from("trades")
      .insert(tradeData)
      .select()
      .single();

    if (error) {
      console.error("Error creating trade:", error);
      return NextResponse.json(
        { success: false, error: "Failed to record trade" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as Trade,
    });
  } catch (error) {
    console.error("POST /api/trades error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record trade" },
      { status: 500 }
    );
  }
}

