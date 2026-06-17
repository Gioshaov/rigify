import { updateSession } from "@/lib/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Subdomain routing - admin.rigify.ge or admin.localhost
  // TEMPORARILY DISABLED: Subdomain routing conflicts with /admin route structure
  const isAdminSubdomain = false; // hostname.startsWith('admin.');

  if (isAdminSubdomain) {
    // Admin password protection layer - only when ADMIN_PREVIEW_PASSWORD is set
    if (process.env.ADMIN_PREVIEW_PASSWORD) {
      // Allow access to admin password page, verification API, and logout API
      if (pathname === '/admin/password' || pathname === '/api/admin/verify-password' || pathname === '/api/admin/logout') {
        return NextResponse.next();
      }

      const adminAccessCookie = request.cookies.get('rigify_admin_access');

      if (!adminAccessCookie?.value) {
        // Redirect to admin password page if no cookie
        const url = request.nextUrl.clone();
        url.pathname = '/admin/password';
        return NextResponse.redirect(url);
      }

      // Verify cookie signature
      const secret = process.env.ADMIN_PREVIEW_PASSWORD;
      const expectedValue = await createCookieValue(secret, 'rigify_admin_access');
      if (adminAccessCookie.value !== expectedValue) {
        // Invalid cookie - redirect to admin password page
        const url = request.nextUrl.clone();
        url.pathname = '/admin/password';
        return NextResponse.redirect(url);
      }
    }

    // On admin subdomain - only allow access to /admin routes
    if (pathname === '/') {
      // Rewrite root to admin panel
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }

    // Block access to non-admin routes on admin subdomain
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  } else {
    // On main domain - redirect /admin to admin subdomain
    // TEMPORARILY DISABLED: Let /admin routes work on main domain
    // if (pathname.startsWith('/admin')) {
    //   const url = request.nextUrl.clone();
    //   url.hostname = `admin.${hostname}`;
    //   url.pathname = pathname === '/admin' ? '/' : pathname.replace('/admin', '');
    //   return NextResponse.redirect(url);
    // }
  }

  // Password protection layer - only when SITE_PASSWORD is set
  // WARNING: Do NOT set SITE_PASSWORD on production deployment - it will lock out all visitors
  // This env var must only exist on preview/staging deployments
  // IMPORTANT: Only apply to main domain, NOT admin subdomain (admin has its own password)
  if (!isAdminSubdomain && process.env.SITE_PASSWORD) {
    // Allow access to password page (and future subroutes) and password verification API only
    if (pathname === '/password' || pathname.startsWith('/password/')) {
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
      const expectedValue = await createCookieValue(secret, 'rigify_access');
      if (accessCookie.value !== expectedValue) {
        // Invalid cookie - redirect to password page
        const url = request.nextUrl.clone();
        url.pathname = '/password';
        return NextResponse.redirect(url);
      }
    }
  }

  // Continue with Supabase auth
  return await updateSession(request);
}

// Create HMAC-based cookie value to prevent forgery (Web Crypto API for Edge Runtime)
// NOTE: This uses Web Crypto API because middleware runs in Edge Runtime.
// The API route uses Node.js crypto.createHmac (see app/api/admin/verify-password/route.ts).
// Both implementations produce identical SHA-256 hex output - verified in tests.
// If you modify this function, update the API route version to match.
async function createCookieValue(secret: string, cookieName: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(cookieName));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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
