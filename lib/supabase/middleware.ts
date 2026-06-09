import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminDomain } from "@/lib/utils/domain";
import type { SupabaseClient } from "@supabase/supabase-js";

// User type cache to avoid triple DB query on every navigation
const userTypeCache = new Map<string, { type: string; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

async function getUserType(userId: string, supabase: SupabaseClient): Promise<string> {
  // Check cache first
  const cached = userTypeCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.type;
  }

  // Query all in parallel
  const [
    { data: business },
    { data: customer },
    { data: staff }
  ] = await Promise.all([
    supabase.from("businesses").select("id").eq("owner_id", userId).maybeSingle(),
    supabase.from("customers").select("id").eq("id", userId).maybeSingle(),
    supabase.from("staff").select("id").eq("user_id", userId).eq("is_active", true).maybeSingle()
  ]);

  // Determine type (priority: business > staff > customer > unknown)
  let userType = 'unknown';
  if (business) userType = 'business';
  else if (staff) userType = 'staff';
  else if (customer) userType = 'customer';

  // Cache result
  userTypeCache.set(userId, { type: userType, timestamp: Date.now() });

  return userType;
}

export async function updateSession(request: NextRequest) {
  // ── Subdomain resolution ──────────────────────────────────────────
  const hostname = request.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'rigify.ge';

  // Extract subdomain — e.g. "mitte" from "mitte.rigify.ge"
  // In dev: "mitte.localhost:3000" → "mitte"
  const subdomain = hostname
    .replace(`.${rootDomain}`, '')
    .replace(/:\d+$/, ''); // strip port in dev

  const isSubdomain =
    subdomain &&
    subdomain !== 'www' &&
    subdomain !== rootDomain &&
    hostname !== rootDomain;

  // Inject subdomain header if present (but continue with auth checks)
  const requestHeaders = isSubdomain ? new Headers(request.headers) : request.headers;
  if (isSubdomain && requestHeaders instanceof Headers) {
    requestHeaders.set('x-subdomain', subdomain);
  }

  let response = NextResponse.next({
    request: isSubdomain ? { headers: requestHeaders } : request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Skip middleware for static assets and Next.js internals ────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt'
  ) {
    return response;
  }

  // ── Block /register route ──────────────────────────────────────────
  if (pathname.startsWith('/register')) {
    const url = request.nextUrl.clone();
    url.pathname = '/for-businesses';
    const redirectResponse = NextResponse.redirect(url);
    // Copy session cookies to redirect response
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // ── Admin subdomain detection ──────────────────────────────────────
  const isOnAdminDomain = isAdminDomain(hostname);
  const isAdminLoginPage = pathname === '/admin/login';
  const isAdminRoute = (pathname === '/admin' || pathname.startsWith('/admin/')) && !isAdminLoginPage;

  // Block /admin routes on main domain (must use admin subdomain)
  if (isAdminRoute && !isOnAdminDomain) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Protect /admin routes on admin subdomain (except login page)
  if (isAdminRoute && isOnAdminDomain) {
    // Require authentication
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      const redirectResponse = NextResponse.redirect(url);
      response.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }

    // Require super admin flag in app_metadata
    const isSuperAdmin = user.app_metadata?.is_super_admin === true;
    if (!isSuperAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      const redirectResponse = NextResponse.redirect(url);
      response.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  // If on admin subdomain but not accessing admin routes, redirect to admin panel or login
  if (isOnAdminDomain && !isAdminLoginPage && !isAdminRoute && pathname !== '/admin') {
    const url = request.nextUrl.clone();
    if (user?.app_metadata?.is_super_admin === true) {
      url.pathname = '/admin';
    } else {
      url.pathname = '/admin/login';
    }
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  const isBusinessDashboard = pathname.startsWith("/dashboard") && !pathname.startsWith("/staff-dashboard");
  const isStaffDashboard = pathname.startsWith("/staff-dashboard");
  const isCustomerDashboard = pathname.startsWith("/customer/dashboard");

  // Redirect to login if accessing protected routes without auth
  if ((isBusinessDashboard || isStaffDashboard || isCustomerDashboard) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(url);
    // Copy session cookies to redirect response
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // If user is authenticated and accessing a dashboard, verify they have the right type
  if (user && (isBusinessDashboard || isStaffDashboard || isCustomerDashboard)) {
    // Get user type (uses cache to avoid triple DB query on every navigation)
    const userType = await getUserType(user.id, supabase);

    // Determine correct dashboard for user type
    const correctPath = userType === 'business' ? "/dashboard"
      : userType === 'staff' ? "/staff-dashboard"
      : userType === 'customer' ? "/customer/dashboard"
      : null;

    // Redirect if user is on wrong dashboard
    if (correctPath && pathname !== correctPath && !pathname.startsWith(correctPath + "/")) {
      const url = request.nextUrl.clone();
      url.pathname = correctPath;
      const redirectResponse = NextResponse.redirect(url);
      // Copy session cookies to redirect response
      response.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  return response;
}
