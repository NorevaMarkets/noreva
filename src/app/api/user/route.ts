import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, updateUserProfile } from "@/lib/supabase/server";
import { toUserUpdate } from "@/types/database";
import { verifyAuthToken } from "@/lib/auth/verify-signature";

/**
 * Authenticate request using signature verification
 */
function authenticateRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    const wallet = verifyAuthToken(authHeader);
    if (wallet) return wallet;
  }

  // Fallback for development only
  if (process.env.NODE_ENV === "development") {
    return request.headers.get("x-wallet-address");
  }

  return null;
}

/**
 * GET /api/user
 * Get current user profile by wallet address
 * Requires authenticated signature
 */
export async function GET(request: NextRequest) {
  try {
    const walletAddress = authenticateRequest(request);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get or create user
    const user = await getOrCreateUser(walletAddress);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user
 * Create or update user profile
 * Requires authenticated signature
 */
export async function POST(request: NextRequest) {
  try {
    const walletAddress = authenticateRequest(request);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Ensure user exists first
    await getOrCreateUser(walletAddress);

    // Convert frontend profile to database format
    const updates = toUserUpdate(body);

    // Update profile
    const user = await updateUserProfile(walletAddress, updates);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("POST /api/user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

