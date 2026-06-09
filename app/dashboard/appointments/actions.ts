"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CreateAppointmentData {
  businessId: string;
  serviceId: string;
  staffId: string | null; // null means "any available"
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format (24-hour)
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

export async function createAppointment(data: CreateAppointmentData) {
  const supabase = createClient();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  // Verify user owns the business
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", data.businessId)
    .eq("owner_id", user.id)
    .single();

  if (!business) {
    return { success: false, message: "Unauthorized - business not found" };
  }

  // Validate service belongs to this business
  const { data: service } = await supabase
    .from("services")
    .select("id, duration_minutes, price_min")
    .eq("id", data.serviceId)
    .eq("business_id", data.businessId)
    .eq("is_active", true)
    .single();

  if (!service) {
    return { success: false, message: "Service not found or inactive" };
  }

  // Validate staff (if provided) belongs to this business
  if (data.staffId) {
    const { data: staff } = await supabase
      .from("staff")
      .select("id")
      .eq("id", data.staffId)
      .eq("business_id", data.businessId)
      .eq("is_active", true)
      .single();

    if (!staff) {
      return { success: false, message: "Staff member not found or inactive" };
    }
  }

  // Validate customer data
  if (!data.customerName.trim()) {
    return { success: false, message: "Customer name is required" };
  }

  if (!data.customerPhone.trim()) {
    return { success: false, message: "Customer phone is required" };
  }

  // Combine date and time into appointment_datetime
  const appointmentDatetime = new Date(`${data.date}T${data.startTime}:00`);

  // Check if appointment is in the past
  if (appointmentDatetime < new Date()) {
    return { success: false, message: "Cannot create appointments in the past" };
  }

  // Create booking
  const admin = createAdminClient();
  const { error } = await admin
    .from("bookings")
    .insert({
      business_id: data.businessId,
      service_id: data.serviceId,
      staff_id: data.staffId,
      appointment_datetime: appointmentDatetime.toISOString(),
      duration_minutes: service.duration_minutes,
      price: service.price_min,
      customer_name: data.customerName.trim(),
      customer_phone: data.customerPhone.trim(),
      customer_email: data.customerEmail?.trim() || null,
      notes: data.notes?.trim() || null,
      status: "confirmed",
      booking_source: "dashboard",
    });

  if (error) {
    console.error("Create appointment error:", error);
    return { success: false, message: "Failed to create appointment" };
  }

  // Revalidate appointments page
  revalidatePath("/dashboard/appointments");

  return {
    success: true,
    message: "Appointment created successfully",
  };
}
