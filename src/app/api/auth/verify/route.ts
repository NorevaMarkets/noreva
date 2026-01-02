import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Get the site password from environment variable
    const sitePassword = process.env.SITE_PASSWORD;

    // If no password is set in env, allow access (for development)
    if (!sitePassword) {
      console.warn("[Auth] SITE_PASSWORD not set - allowing access");
      const response = NextResponse.json({ success: true });
      response.cookies.set("noreva_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      return response;
    }

    // Validate password
    if (password === sitePassword) {
      const response = NextResponse.json({ success: true });
      
      // Set auth cookie
      response.cookies.set("noreva_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    // Invalid password
    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("[Auth] Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("noreva_auth");
  return response;
}

