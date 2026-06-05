"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { normalizeDistrict } from "@/lib/constants/districts";

export async function updateBusinessProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const businessId = formData.get("business_id") as string;

  // Verify this business belongs to the user
  const { data: existingBusiness } = await supabase
    .from("businesses")
    .select("owner_id")
    .eq("id", businessId)
    .single();

  if (!existingBusiness || existingBusiness.owner_id !== user.id) {
    return { error: "Unauthorized" };
  }

  // Get form data
  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const city = formData.get("city") as string;
  const district = (formData.get("district") as string)?.trim() || null;
  const address = (formData.get("address") as string).trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const website = (formData.get("website") as string)?.trim() || null;
  const instagram = (formData.get("instagram") as string)?.trim() || null;
  const coverImageUrl = (formData.get("cover_image_url") as string)?.trim() || null;
  const logoUrl = (formData.get("logo_url") as string)?.trim() || null;
  const categories = formData.getAll("categories") as string[];

  // Validate required fields
  if (!name || !city || !address) {
    return { error: "Name, city, and address are required" };
  }

  if (categories.length === 0) {
    return { error: "Please select at least one category" };
  }

  // Validate phone format
  if (phone && (!phone.startsWith("+") || phone.length < 10)) {
    return { error: "Phone must start with + and be at least 10 digits" };
  }

  // Validate email format
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Invalid email format" };
    }
  }

  const admin = createAdminClient();

  // Normalize district to ID format
  const normalizedDistrict = normalizeDistrict(district);

  // Update business
  const { error: updateError } = await admin
    .from("businesses")
    .update({
      name,
      description,
      city,
      district: normalizedDistrict,
      address,
      phone,
      email,
      website,
      instagram,
      cover_image_url: coverImageUrl,
      logo_url: logoUrl,
    })
    .eq("id", businessId);

  if (updateError) {
    console.error("Error updating business:", updateError);
    return { error: "Failed to update business profile" };
  }

  // Update categories
  // First, delete existing categories
  await admin
    .from("business_categories")
    .delete()
    .eq("business_id", businessId);

  // Then insert new categories
  if (categories.length > 0) {
    const categoryInserts = categories.map((categoryId) => ({
      business_id: businessId,
      category_id: categoryId,
    }));

    const { error: categoriesError } = await admin
      .from("business_categories")
      .insert(categoryInserts);

    if (categoriesError) {
      console.error("Error updating categories:", categoriesError);
      return { error: "Failed to update categories" };
    }
  }

  // Revalidate relevant pages
  revalidatePath("/dashboard/business-profile");
  revalidatePath("/businesses");

  return { success: true };
}
