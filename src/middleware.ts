import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require password protection
const PUBLIC_ROUTES = [
  "/terms",
  "/privacy",
  "/login",
  "/api/", // All API routes should be accessible
];

// Check if a path starts with any of the public routes
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and API routes (except auth)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/banner") ||
    pathname.startsWith("/hero") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("noreva_auth");
  
  if (!authCookie || authCookie.value !== "authenticated") {
    // Redirect to login page
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

