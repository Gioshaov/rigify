"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { CATEGORY_IDS } from "@/lib/constants/categories";
import { CITY_IDS } from "@/lib/constants/cities";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const businessName = String(formData.get("business_name") ?? "").trim();
  const selectedCategories = formData.getAll("categories");
  const city = String(formData.get("city") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!email || !password || !businessName || !city || !address || !phone) {
    return { error: "All required fields must be filled." };
  }

  if (selectedCategories.length === 0) {
    return { error: "Please select at least one category." };
  }

  // Validate each category ID
  const invalidCategories = selectedCategories.filter(
    cat => !CATEGORY_IDS.includes(String(cat))
  );
  if (invalidCategories.length > 0) {
    return { error: "Invalid category selection." };
  }

  if (!CITY_IDS.includes(city)) return { error: "Invalid city." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) return { error: signUpError.message };
  if (!signUpData.user) return { error: "Unexpected: no user returned from sign-up." };

  // If email confirmation is required, session will be null.
  // For dev: disable it in Supabase Dashboard → Auth → Email Provider → "Confirm email" (uncheck)
  if (!signUpData.session) {
    return {
      error: "Email confirmation is enabled. Check your Supabase project settings (Auth → Providers → Email) and disable 'Confirm email' for development."
    };
  }

  // Use admin client to create the business row regardless of email-confirm state.
  const admin = createAdminClient();
  let slug = slugify(businessName) || `biz-${signUpData.user.id.slice(0, 8)}`;

  // Avoid slug collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await admin
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${slugify(businessName)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  // Insert business record (keeping category as first selected for backward compatibility)
  const { data: newBusiness, error: insertError } = await admin
    .from("businesses")
    .insert({
      owner_id: signUpData.user.id,
      slug,
      name: businessName,
      category: String(selectedCategories[0]), // Keep first category for backward compatibility
      city,
      address,
      phone,
      email,
      is_active: false, // owner activates from /dashboard/settings later
      hours: {
        mon: { open: "10:00", close: "20:00" },
        tue: { open: "10:00", close: "20:00" },
        wed: { open: "10:00", close: "20:00" },
        thu: { open: "10:00", close: "20:00" },
        fri: { open: "10:00", close: "20:00" },
        sat: { open: "11:00", close: "19:00" },
        sun: null,
      },
    })
    .select()
    .single();

  if (insertError || !newBusiness) {
    return { error: `Could not create business: ${insertError?.message}` };
  }

  // Insert categories into junction table
  const categoryInserts = selectedCategories.map(catId => ({
    business_id: newBusiness.id,
    category_id: String(catId),
  }));

  const { error: catError } = await admin
    .from("business_categories")
    .insert(categoryInserts);

  if (catError) {
    return { error: `Could not save categories: ${catError.message}` };
  }

  // Session is already set by signUp (we checked signUpData.session above).
  // Redirect to dashboard — middleware will ensure cookies propagate correctly.
  redirect("/dashboard");
}
