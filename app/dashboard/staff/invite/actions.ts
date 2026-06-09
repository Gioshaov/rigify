"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function inviteStaffAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "staff");
  const specialty = String(formData.get("specialty") ?? "").trim();

  if (!name || !email || !password) {
    return { error: "All required fields must be filled." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (!["staff", "manager"].includes(role)) {
    return { error: "Invalid role selected." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Get business for current owner
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) return { error: "No business found" };

  // Create auth user with admin client
  const admin = createAdminClient();
  const { data: newUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      role: "staff",
      business_id: business.id,
    },
  });

  if (authError || !newUser.user) {
    return { error: `Could not create user: ${authError?.message}` };
  }

  // Create staff record
  const { error: staffError } = await admin.from("staff").insert({
    business_id: business.id,
    user_id: newUser.user.id,
    name,
    email, // Save email to staff table
    role,
    specialty: specialty || null,
    is_active: true,
  });

  if (staffError) {
    // Rollback: delete auth user if staff creation fails
    await admin.auth.admin.deleteUser(newUser.user.id);
    return { error: `Could not create staff: ${staffError.message}` };
  }

  redirect("/dashboard/staff");
}
