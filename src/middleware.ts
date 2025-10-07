import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // For dashboard routes, check if user is authenticated and has proper role
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        const loginUrl = new URL("/auth/signin", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user has required role
      const userRole = token.role as string;
      const allowedRoles = ["OWNER", "EDITOR", "VIEWER"];

      if (!allowedRoles.includes(userRole)) {
        // If user doesn't have required role, redirect to home
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Check role-based access for specific routes
      if (pathname.startsWith("/dashboard/stores") && userRole === "VIEWER") {
        // Viewers cannot access store management
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if ((pathname.startsWith("/dashboard/products") || pathname.startsWith("/dashboard/categories")) &&
          userRole === "VIEWER") {
        // Viewers cannot modify products or categories
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Add security headers
    const response = NextResponse.next();

    // Add CORS headers for API routes
    if (pathname.startsWith("/api")) {
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    }

    // Add other security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - /api/checkout/ (public checkout endpoint)
     */
    "/dashboard/:path*",
    "/api/admin/:path*",
  ],
};