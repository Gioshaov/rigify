"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function createArtisanAction(data: {
  fullName: string;
  title: string;
  bio: string;
  email: string;
  password: string;
  role: "standard" | "manager";
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // Get business for current owner
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) return { success: false, error: "No business found" };

  // Validate required fields
  if (!data.fullName.trim() || !data.email.trim() || !data.password) {
    return { success: false, error: "All required fields must be filled" };
  }

  if (data.password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  // Create auth user with admin client
  const admin = createAdminClient();
  const { data: newUser, error: authError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      role: "staff",
      business_id: business.id,
    },
  });

  if (authError || !newUser.user) {
    return { success: false, error: `Could not create user: ${authError?.message}` };
  }

  // Create staff record
  const { error: staffError } = await admin.from("staff").insert({
    business_id: business.id,
    user_id: newUser.user.id,
    name: data.fullName,
    role: data.role === "manager" ? "manager" : "staff",
    specialty: data.title || null,
    is_active: true,
  });

  if (staffError) {
    // Rollback: delete auth user if staff creation fails
    await admin.auth.admin.deleteUser(newUser.user.id);
    return { success: false, error: `Could not create staff: ${staffError.message}` };
  }

  return { success: true };
}
