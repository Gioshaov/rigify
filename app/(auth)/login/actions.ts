"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

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

  // Super admins bypass all checks and go straight to admin panel
  const isSuperAdmin = data.user.app_metadata?.is_super_admin === true;
  if (isSuperAdmin) {
    redirect("/admin");
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

  // Check if accounts are active
  if (business) {
    if (business.is_active === false) {
      await supabase.auth.signOut();
      return { error: "Your business account has been disabled. Please contact support." };
    }
    redirect("/dashboard");
  } else if (staff) {
    if (staff.is_active === false) {
      await supabase.auth.signOut();
      return { error: "Your staff account has been disabled. Please contact your business owner." };
    }
    redirect("/staff-dashboard");
  } else if (customer) {
    redirect("/customer/dashboard");
  } else {
    // User exists but has no business, staff, or customer profile
    return { error: "Account not properly set up. Please contact support." };
  }
}
