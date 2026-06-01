import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
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
  const isBusinessDashboard = pathname.startsWith("/dashboard");
  const isCustomerDashboard = pathname.startsWith("/customer/dashboard");

  // Redirect to login if accessing protected routes without auth
  if ((isBusinessDashboard || isCustomerDashboard) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and accessing a dashboard, verify they have the right type
  if (user && (isBusinessDashboard || isCustomerDashboard)) {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    // Business owner trying to access customer dashboard -> redirect to business dashboard
    if (isCustomerDashboard && business && !customer) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Customer trying to access business dashboard -> redirect to customer dashboard
    if (isBusinessDashboard && customer && !business) {
      const url = request.nextUrl.clone();
      url.pathname = "/customer/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
