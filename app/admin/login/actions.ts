"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { isAdminDomain } from "@/lib/utils/domain";
import { createAuditLog } from "@/lib/utils/audit-log";

export async function adminLoginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Verify this request is from admin subdomain
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (!isAdminDomain(host)) {
    return {
      error: "Admin login is only accessible from admin.rigify.ge or admin.localhost"
    };
  }

  const supabase = createClient();

  // Attempt login
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: "Invalid credentials" };
  }

  const user = signInData.user;

  // Verify user is a super admin
  const isSuperAdmin = user?.app_metadata?.is_super_admin === true;

  if (!isSuperAdmin) {
    // Sign out immediately if not super admin
    await supabase.auth.signOut();
    return {
      error: "Access denied. This page is for super administrators only."
    };
  }

  // Log successful admin login
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: 'login',
    resourceType: 'admin',
    resourceName: user.email!,
    ipAddress,
    userAgent,
  });

  // Success - return success, client will handle redirect
  return { success: true };
}
