"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { combineLocalDateTime } from "@/lib/utils/datetime";

export async function cancelBookingAction(bookingId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify booking belongs to user
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id, appointment_datetime, status")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  if (booking.customer_id !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (booking.status === "cancelled") {
    return { success: false, error: "Booking already cancelled" };
  }

  // Check if booking is in the past
  const appointmentDate = new Date(booking.appointment_datetime);
  if (appointmentDate < new Date()) {
    return { success: false, error: "Cannot cancel past bookings" };
  }

  // Update booking status to cancelled (with ownership check)
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("customer_id", user.id);

  if (error) {
    console.error("Cancel booking error:", error);
    return { success: false, error: "Failed to cancel booking" };
  }

  revalidatePath("/customer/dashboard");
  return { success: true };
}

export async function rescheduleBookingAction(data: {
  bookingId: string;
  newDate: string;
  newTime: string;
  staffId?: string | null;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify booking belongs to user
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id, business_id, service_id, staff_id, status")
    .eq("id", data.bookingId)
    .single();

  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  if (booking.customer_id !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Only allow rescheduling confirmed or pending bookings
  if (!["confirmed", "pending"].includes(booking.status)) {
    return { success: false, error: "Cannot reschedule this booking" };
  }

  // Parse new date and time using Tbilisi timezone
  const newDateTime = combineLocalDateTime(data.newDate, data.newTime);

  // Check if new date is in the past
  if (newDateTime < new Date()) {
    return { success: false, error: "Cannot reschedule to a past date" };
  }

  // Check availability for new time slot
  // Get service duration using admin client (to bypass RLS)
  const admin = createAdminClient();
  const { data: service } = await admin
    .from("services")
    .select("duration_minutes")
    .eq("id", booking.service_id)
    .single();

  if (!service) {
    return { success: false, error: "Service not found" };
  }

  const endDateTime = new Date(newDateTime.getTime() + service.duration_minutes * 60000);

  // Determine which staff to check/assign
  // If staffId provided: use it (customer changed staff or selected "any")
  // If staffId is null/undefined: keep original staff
  const targetStaffId = data.staffId !== undefined ? (data.staffId === "any" ? null : data.staffId) : booking.staff_id;

  // Check for overlapping bookings (same staff, same time) - CORRECT overlap logic
  if (targetStaffId) {
    const { data: overlapping } = await admin
      .from("bookings")
      .select("id")
      .eq("business_id", booking.business_id)
      .eq("staff_id", targetStaffId)
      .neq("id", data.bookingId)
      .neq("status", "cancelled")
      .lt("appointment_datetime", endDateTime.toISOString())   // existing.start < newEnd
      .gt("end_datetime", newDateTime.toISOString())           // existing.end > newStart
      .limit(1);

    if (overlapping && overlapping.length > 0) {
      return { success: false, error: "This time slot is not available" };
    }
  }

  // Update booking (with ownership check)
  const { error } = await supabase
    .from("bookings")
    .update({
      appointment_datetime: newDateTime.toISOString(),
      staff_id: targetStaffId,
    })
    .eq("id", data.bookingId)
    .eq("customer_id", user.id);

  if (error) {
    console.error("Reschedule booking error:", error);
    return { success: false, error: "Failed to reschedule booking" };
  }

  revalidatePath("/customer/dashboard");
  return { success: true };
}
