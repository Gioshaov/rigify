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

    const { data: staff } = await supabase
      .from("staff")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    // Business owner on staff or customer dashboard → redirect to business dashboard
    if ((isStaffDashboard || isCustomerDashboard) && business && !staff && !customer) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Staff on business or customer dashboard → redirect to staff dashboard
    if ((isBusinessDashboard || isCustomerDashboard) && staff && !business && !customer) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/staff-view";
      return NextResponse.redirect(url);
    }

    // Customer on business or staff dashboard → redirect to customer dashboard
    if ((isBusinessDashboard || isStaffDashboard) && customer && !business && !staff) {
      const url = request.nextUrl.clone();
      url.pathname = "/customer/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
