"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function adminLogoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();

  // Redirect to admin login page with absolute URL to preserve subdomain
  const loginUrl = process.env.NODE_ENV === 'development'
    ? 'http://admin.localhost:3000/admin/login'
    : 'https://admin.rigify.ge/admin/login';

  redirect(loginUrl);
}
