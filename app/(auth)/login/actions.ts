"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Login failed." };
  }

  // Block super admins from regular login - they must use admin subdomain
  const isSuperAdmin = data.user.app_metadata?.is_super_admin === true;
  if (isSuperAdmin) {
    await supabase.auth.signOut();
    return {
      error: "Invalid email or password"
    };
  }

  // Check if user is a business owner, staff, or customer (parallel queries)
  const [
    { data: business },
    { data: customer },
    { data: staff }
  ] = await Promise.all([
    supabase.from("businesses").select("id, is_active").eq("owner_id", data.user.id).maybeSingle(),
    supabase.from("customers").select("id").eq("id", data.user.id).maybeSingle(),
    supabase.from("staff").select("id, business_id, is_active").eq("user_id", data.user.id).maybeSingle()
  ]);

  // Validate redirect is safe relative path (security check against open redirects)
  let isValidRedirect = false;
  if (redirectTo && redirectTo.startsWith('/')) {
    try {
      const url = new URL(redirectTo, 'http://localhost');
      // Only allow if hostname is localhost (meaning it was a relative path)
      isValidRedirect = url.hostname === 'localhost';
    } catch {
      isValidRedirect = false;
    }
  }

  // Default redirects based on user type
  const defaultRedirects = {
    business: "/dashboard",
    staff: "/staff-dashboard",
    customer: "/customer/dashboard"
  };

  // Check if accounts are active
  if (business) {
    if (business.is_active === false) {
      await supabase.auth.signOut();
      return { error: "Your business account has been disabled. Please contact support." };
    }
    redirect(isValidRedirect ? redirectTo : defaultRedirects.business);
  } else if (staff) {
    if (staff.is_active === false) {
      await supabase.auth.signOut();
      return { error: "Your staff account has been disabled. Please contact your business owner." };
    }
    redirect(isValidRedirect ? redirectTo : defaultRedirects.staff);
  } else if (customer) {
    redirect(isValidRedirect ? redirectTo : defaultRedirects.customer);
  } else {
    // User exists but has no business, staff, or customer profile
    return { error: "Account not properly set up. Please contact support." };
  }
}
