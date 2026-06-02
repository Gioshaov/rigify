import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  if (isSubdomain) {
    // Inject subdomain into request headers for server components to read
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-subdomain', subdomain);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    return response;
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
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

  // ── Block /register route ──────────────────────────────────────────
  if (pathname.startsWith('/register')) {
    const url = request.nextUrl.clone();
    url.pathname = '/for-businesses';
    return NextResponse.redirect(url);
  }
  const isBusinessDashboard = pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/staff-view");
  const isStaffDashboard = pathname.startsWith("/dashboard/staff-view");
  const isCustomerDashboard = pathname.startsWith("/customer/dashboard");

  // Redirect to login if accessing protected routes without auth
  if ((isBusinessDashboard || isStaffDashboard || isCustomerDashboard) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and accessing a dashboard, verify they have the right type
  if (user && (isBusinessDashboard || isStaffDashboard || isCustomerDashboard)) {
    // Parallel queries for user type detection
    const [
      { data: business },
      { data: customer },
      { data: staff }
    ] = await Promise.all([
      supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle(),
      supabase.from("customers").select("id").eq("id", user.id).maybeSingle(),
      supabase.from("staff").select("id").eq("user_id", user.id).eq("is_active", true).maybeSingle()
    ]);

    // Determine correct dashboard for user type
    const correctPath = business ? "/dashboard"
      : staff ? "/dashboard/staff-view"
      : customer ? "/customer/dashboard"
      : null;

    // Redirect if user is on wrong dashboard
    if (correctPath && pathname !== correctPath && !pathname.startsWith(correctPath + "/")) {
      const url = request.nextUrl.clone();
      url.pathname = correctPath;
      return NextResponse.redirect(url);
    }
  }

  return response;
}
