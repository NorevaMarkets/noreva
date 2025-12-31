import { NextRequest, NextResponse } from "next/server";
import { getUserByWallet } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ wallet: string }>;
}

/**
 * GET /api/user/[wallet]
 * Get public user profile by wallet address
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { wallet } = await params;

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const user = await getUserByWallet(wallet);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Return public profile data (exclude sensitive fields if any)
    const publicProfile = {
      wallet_address: user.wallet_address,
      first_name: user.first_name,
      last_name: user.last_name,
      x_handle: user.x_handle,
      website: user.website,
      bio: user.bio,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    };

    return NextResponse.json({
      success: true,
      data: publicProfile,
    });
  } catch (error) {
    console.error("GET /api/user/[wallet] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

