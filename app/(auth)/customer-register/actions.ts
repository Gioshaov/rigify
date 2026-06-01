"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function customerRegisterAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!email || !password || !name || !phone) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = createClient();

  // Create auth user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) return { error: signUpError.message };
  if (!signUpData.user) return { error: "Unexpected: no user returned from sign-up." };

  // If email confirmation is required, session will be null
  if (!signUpData.session) {
    return {
      error: "Email confirmation is enabled. Check your Supabase project settings (Auth → Providers → Email) and disable 'Confirm email' for development."
    };
  }

  // Create customer profile
  const { error: insertError } = await supabase.from("customers").insert({
    id: signUpData.user.id,
    name,
    phone,
    email,
  });

  if (insertError) return { error: `Could not create customer profile: ${insertError.message}` };

  // Session is already set by signUp. Redirect to customer dashboard.
  redirect("/customer/dashboard");
}
