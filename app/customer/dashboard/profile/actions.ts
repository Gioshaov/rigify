"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCustomerProfileAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  // CRITICAL: Do NOT trim passwords - preserves whitespace that may be part of actual password
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");

  // Input validation
  if (!name || !phone) {
    return { error: "Name and phone are required." };
  }

  if (name.length < 2 || name.length > 100) {
    return { error: "Name must be between 2 and 100 characters." };
  }

  // Georgian phone format: 9 digits after +995
  const phoneDigits = phone.replace(/\s/g, "");
  if (!/^\d{9}$/.test(phoneDigits)) {
    return { error: "Phone must be 9 digits (Georgian format)." };
  }

  if (newPassword && newPassword.length < 6) {
    return { error: "New password must be at least 6 characters." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Not authenticated." };
  }

  // Update customer profile FIRST (before password change)
  // This prevents partial-update scenario where password changes but profile fails
  const { error: profileError } = await supabase
    .from("customers")
    .update({ name, phone: phoneDigits })
    .eq("id", user.id);

  if (profileError) {
    console.error("Profile update failed:", profileError);
    return { error: "Failed to update profile. Please try again." };
  }

  // Update password if both current and new passwords are provided
  if (newPassword) {
    if (!currentPassword) {
      return { error: "Current password is required to set a new password." };
    }

    // Verify current password before allowing change (security requirement)
    // signInWithPassword validates credentials without creating session conflicts
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      console.error("Password verification failed:", verifyError);
      return { error: "Current password is incorrect." };
    }

    // Update to new password after verification succeeds
    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (passwordError) {
      console.error("Password update failed:", passwordError);
      // Map common errors to user-friendly messages
      if (passwordError.message.includes("same")) {
        return { error: "New password must be different from current password." };
      }
      return { error: "Failed to update password. Please try again." };
    }
  }

  revalidatePath("/customer/dashboard/profile");
  revalidatePath("/customer/dashboard");

  return { success: true };
}
