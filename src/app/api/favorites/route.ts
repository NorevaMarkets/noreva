import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Favorite {
  id: string;
  wallet_address: string;
  symbol: string;
  created_at: string;
}

/**
 * Get wallet address from request
 * Favorites don't require signature auth - just wallet address
 * (Favorites are not sensitive data)
 */
function getWalletAddress(request: NextRequest): string | null {
  return request.headers.get("x-wallet-address");
}

/**
 * GET /api/favorites - Get all favorites for a wallet
 */
export async function GET(request: NextRequest) {
  try {
    const walletAddress = getWalletAddress(request);
    
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    // Get favorites from database
    const { data, error } = await supabaseAdmin
      .from("favorites")
      .select("*")
      .eq("wallet_address", walletAddress)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorites:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch favorites" },
        { status: 500 }
      );
    }

    // Return just the symbols for easy use
    const symbols = (data as Favorite[] || []).map(f => f.symbol);

    return NextResponse.json({
      success: true,
      data: symbols,
    });
  } catch (error) {
    console.error("Favorites GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites - Add a favorite
 */
export async function POST(request: NextRequest) {
  try {
    const walletAddress = getWalletAddress(request);
    
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { symbol } = body;

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: "Symbol is required" },
        { status: 400 }
      );
    }

    // Insert favorite (will fail silently if already exists due to unique constraint)
    const { data, error } = await supabaseAdmin
      .from("favorites")
      .upsert(
        { wallet_address: walletAddress, symbol },
        { onConflict: "wallet_address,symbol" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error adding favorite:", error);
      return NextResponse.json(
        { success: false, error: "Failed to add favorite" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Favorites POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/favorites - Remove a favorite
 */
export async function DELETE(request: NextRequest) {
  try {
    const walletAddress = getWalletAddress(request);
    
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }
    
    // Get symbol from URL params
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: "Symbol is required" },
        { status: 400 }
      );
    }

    // Delete favorite
    const { error } = await supabaseAdmin
      .from("favorites")
      .delete()
      .eq("wallet_address", walletAddress)
      .eq("symbol", symbol);

    if (error) {
      console.error("Error removing favorite:", error);
      return NextResponse.json(
        { success: false, error: "Failed to remove favorite" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Favorites DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
