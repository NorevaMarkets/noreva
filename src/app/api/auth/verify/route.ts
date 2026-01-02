import { NextResponse } from "next/server";

/**
 * POST /api/auth/verify
 * 
 * Verifies the access password against the environment variable.
 * Used by the AccessGate component for password protection.
 * 
 * Environment Variable: SITE_PASSWORD
 * - If not set: Access is granted automatically (dev mode)
 * - If set: Password must match to grant access
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const sitePassword = process.env.SITE_PASSWORD;

    // If no password is configured, allow access (useful for development)
    if (!sitePassword) {
      return NextResponse.json({ success: true });
    }

    // Check password
    if (password === sitePassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
