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

  // Validate email format (requires proper TLD)
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
    return { error: "Invalid email format. Must include a valid domain extension (e.g., .com, .ge)" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  // Validate phone format (must start with + and have at least 10 digits)
  const phoneDigits = phone.replace(/\D/g, '');
  if (!phone.startsWith('+') || phoneDigits.length < 10) {
    return { error: "Invalid phone format. Must start with + and contain at least 10 digits (e.g., +995555123456)" };
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
