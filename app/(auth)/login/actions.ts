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

  // Check if user is a business owner, staff, or customer (parallel queries)
  const [
    { data: business },
    { data: customer },
    { data: staff }
  ] = await Promise.all([
    supabase.from("businesses").select("id").eq("owner_id", data.user.id).maybeSingle(),
    supabase.from("customers").select("id").eq("id", data.user.id).maybeSingle(),
    supabase.from("staff").select("id, business_id").eq("user_id", data.user.id).eq("is_active", true).maybeSingle()
  ]);

  // Redirect based on user type
  if (business) {
    redirect("/dashboard");
  } else if (staff) {
    redirect("/dashboard/staff-view");
  } else if (customer) {
    redirect("/customer/dashboard");
  } else {
    // User exists but has no business, staff, or customer profile
    return { error: "Account not properly set up. Please contact support." };
  }
}
