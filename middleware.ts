import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Password protection layer - runs before everything else
  // Allow access to password page and API routes
  if (!pathname.startsWith('/password') && !pathname.startsWith('/api')) {
    const accessCookie = request.cookies.get('rigify_access');

    if (accessCookie?.value !== 'granted') {
      // Redirect to password page
      const url = request.nextUrl.clone();
      url.pathname = '/password';
      return NextResponse.redirect(url);
    }
  }

  // If password is correct (or on password/API page), continue with Supabase auth
  return await updateSession(request);
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
