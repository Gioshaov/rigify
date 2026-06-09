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
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, customer_id, appointment_datetime, status")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    console.error("Fetch booking error:", fetchError);
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
  staffId: string | null;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify booking belongs to user
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, customer_id, business_id, service_id, staff_id, status")
    .eq("id", data.bookingId)
    .single();

  if (fetchError || !booking) {
    console.error("Fetch booking error:", fetchError);
    return { success: false, error: "Booking not found" };
  }

  if (booking.customer_id !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Only allow rescheduling confirmed bookings
  // Note: Guest bookings (customer_id IS NULL) cannot be rescheduled via this action
  if (booking.status !== "confirmed") {
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
  const { data: service, error: serviceError } = await admin
    .from("services")
    .select("duration_minutes")
    .eq("id", booking.service_id)
    .single();

  if (serviceError || !service) {
    console.error("Fetch service error:", serviceError);
    return { success: false, error: "Service not found" };
  }

  const MS_PER_MINUTE = 60_000;
  const endDateTime = new Date(newDateTime.getTime() + service.duration_minutes * MS_PER_MINUTE);

  // Validate staff selection (defense-in-depth - UI should enforce, but verify server-side)
  if (!data.staffId) {
    return { success: false, error: "Please select a specific staff member to reschedule" };
  }

  const targetStaffId = data.staffId;

  // Verify selected staff exists, is active, and belongs to this business
  const { data: staffMember, error: staffError } = await admin
    .from("staff")
    .select("id")
    .eq("id", targetStaffId)
    .eq("business_id", booking.business_id)
    .eq("is_active", true)
    .single();

  if (staffError || !staffMember) {
    console.error("Fetch staff error:", staffError);
    return { success: false, error: "Selected staff member is no longer available" };
  }

  // Check for overlapping bookings for the selected staff - CORRECT overlap logic
  // TODO: Not atomic — concurrent reschedules may still create overlaps (requires DB-level constraint or serializable transaction)
  const { data: overlapping, error: overlapError } = await admin
    .from("bookings")
    .select("id")
    .eq("business_id", booking.business_id)
    .eq("staff_id", targetStaffId)
    .neq("id", data.bookingId)
    .neq("status", "cancelled")
    .not("end_datetime", "is", null)                         // exclude bookings with missing end_datetime
    .lt("appointment_datetime", endDateTime.toISOString())   // existing.start < newEnd
    .gt("end_datetime", newDateTime.toISOString())           // existing.end > newStart
    .limit(1);

  if (overlapError) {
    console.error("Overlap check error:", overlapError);
    return { success: false, error: "Failed to verify availability" };
  }

  if (overlapping && overlapping.length > 0) {
    return { success: false, error: "This time slot is not available" };
  }

  // Update booking (with ownership check and status guard)
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      appointment_datetime: newDateTime.toISOString(),
      staff_id: targetStaffId,
    })
    .eq("id", data.bookingId)
    .eq("customer_id", user.id)
    .eq("status", "confirmed")  // prevent rescheduling if concurrently cancelled
    .select("id");

  if (error) {
    console.error("Reschedule booking error:", error);
    return { success: false, error: "Failed to reschedule booking" };
  }

  if (!updated || updated.length === 0) {
    return { success: false, error: "Booking could not be rescheduled — it may have been cancelled" };
  }

  revalidatePath("/customer/dashboard");
  return { success: true };
}
