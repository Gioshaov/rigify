import { updateSession } from "@/lib/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Password protection layer - runs before everything else
  // Allow access to password page and password verification API only
  if (pathname === '/password') {
    return NextResponse.next();
  }

  if (!pathname.startsWith('/api/verify-password')) {
    const accessCookie = request.cookies.get('rigify_access');

    if (!accessCookie?.value) {
      // Redirect to password page if no cookie
      const url = request.nextUrl.clone();
      url.pathname = '/password';
      return NextResponse.redirect(url);
    }

    // Verify cookie signature
    const secret = process.env.SITE_PASSWORD;
    if (!secret) {
      const url = request.nextUrl.clone();
      url.pathname = '/password';
      return NextResponse.redirect(url);
    }

    const expectedValue = createCookieValue(secret);
    if (accessCookie.value !== expectedValue) {
      // Invalid cookie - redirect to password page
      const url = request.nextUrl.clone();
      url.pathname = '/password';
      return NextResponse.redirect(url);
    }
  }

  // If password is correct (or on password/verify page), continue with Supabase auth
  return await updateSession(request);
}

// Create HMAC-based cookie value to prevent forgery
function createCookieValue(secret: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update('rigify_access').digest('hex');
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
