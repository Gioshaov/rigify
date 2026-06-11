"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { hasOverlap } from "@/lib/utils/availability";
import { combineLocalDateTime } from "@/lib/utils/datetime";

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
  const trimmedName = data.customerName.trim();
  const trimmedPhone = data.customerPhone.trim();
  const trimmedEmail = data.customerEmail?.trim();

  if (!trimmedName) {
    return { success: false, message: "Customer name is required" };
  }

  if (trimmedName.length > 100) {
    return { success: false, message: "Customer name must be 100 characters or less" };
  }

  if (!trimmedPhone) {
    return { success: false, message: "Customer phone is required" };
  }

  if (trimmedPhone.length < 5 || trimmedPhone.length > 20) {
    return { success: false, message: "Customer phone must be between 5 and 20 characters" };
  }

  if (trimmedEmail && trimmedEmail.length > 255) {
    return { success: false, message: "Customer email must be 255 characters or less" };
  }

  // Convert Tbilisi time to UTC for storage
  const appointmentDatetime = combineLocalDateTime(data.date, data.startTime);

  // Check if appointment is in the past
  if (appointmentDatetime < new Date()) {
    return { success: false, message: "Cannot create appointments in the past" };
  }

  // Check for double-booking if staff is assigned
  if (data.staffId) {
    const appointmentEnd = new Date(appointmentDatetime.getTime() + service.duration_minutes * 60000);

    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("appointment_datetime, duration_minutes")
      .eq("staff_id", data.staffId)
      .eq("status", "confirmed")
      .gte("appointment_datetime", new Date(appointmentDatetime.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .lte("appointment_datetime", new Date(appointmentDatetime.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (existingBookings) {
      for (const booking of existingBookings) {
        const existingStart = new Date(booking.appointment_datetime);
        const existingEnd = new Date(existingStart.getTime() + booking.duration_minutes * 60000);

        if (hasOverlap(existingStart, existingEnd, appointmentDatetime, appointmentEnd)) {
          return {
            success: false,
            message: "This time slot is already booked. Please choose a different time."
          };
        }
      }
    }
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
      price: service.price_min ?? 0,
      customer_name: trimmedName,
      customer_phone: trimmedPhone,
      customer_email: trimmedEmail || null,
      notes: data.notes?.trim() || null,
      status: "confirmed",
      booking_source: "dashboard",
    });

  if (error) {
    console.error("Create appointment error:", error);
    return {
      success: false,
      message: "Failed to create appointment. Please try again."
    };
  }

  // Revalidate appointments page
  revalidatePath("/dashboard/appointments");

  return {
    success: true,
    message: "Appointment created successfully",
  };
}
