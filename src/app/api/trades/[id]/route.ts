import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Trade, TradeUpdate } from "@/types/trade";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/trades/[id]
 * Update a trade (e.g., confirm status after transaction)
 * Requires x-wallet-address header
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const walletAddress = request.headers.get("x-wallet-address");
    const { id } = await params;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Trade ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, txSignature } = body;

    // Build update object
    const updates: TradeUpdate = {};
    
    if (status) {
      updates.status = status;
      if (status === "confirmed") {
        updates.confirmed_at = new Date().toISOString();
      }
    }
    
    if (txSignature) {
      updates.tx_signature = txSignature;
    }

    // Update trade (only if it belongs to the wallet)
    const { data, error } = await supabaseAdmin
      .from("trades")
      .update(updates)
      .eq("id", id)
      .eq("wallet_address", walletAddress)
      .select()
      .single();

    if (error) {
      console.error("Error updating trade:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update trade" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as Trade,
    });
  } catch (error) {
    console.error("PATCH /api/trades/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update trade" },
      { status: 500 }
    );
  }
}

