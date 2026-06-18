"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { combineLocalDateTime } from "@/lib/utils/datetime";
import {
  sendCancellationToCustomer,
  sendCancellationToBusiness,
  sendRescheduleToCustomer,
  sendRescheduleToBusiness
} from "@/lib/emails/send";

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
    // PGRST116 is expected "not found" - only log real errors
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Fetch booking error:", fetchError);
    }
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
  const now = new Date();

  if (appointmentDate < now) {
    return { success: false, error: "Cannot cancel past bookings" };
  }

  // 24-hour cancellation policy: cannot cancel within 24 hours of appointment
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilAppointment < 24) {
    return {
      success: false,
      error: "Cannot cancel within 24 hours of appointment. Please contact the business directly if you need to cancel."
    };
  }

  // Update booking status to cancelled (with ownership check)
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("customer_id", user.id)
    .select("id");

  if (error) {
    console.error("Cancel booking error:", error);
    return { success: false, error: "Failed to cancel booking" };
  }

  if (!updated || updated.length === 0) {
    return { success: false, error: "Booking could not be cancelled — it may already be cancelled" };
  }

  revalidatePath("/customer/dashboard");

  // Send cancellation emails (non-blocking)
  const admin = createAdminClient();
  Promise.all([
    admin
      .from("bookings")
      .select("customer_name, customer_phone, customer_email, appointment_datetime, services(name), businesses(name, email, slug)")
      .eq("id", bookingId)
      .single()
      .then(async ({ data: bookingData }) => {
        if (!bookingData) return;

        const confirmationId = `RG-${bookingId.slice(0, 8).toUpperCase()}`;
        const business = Array.isArray(bookingData.businesses) ? bookingData.businesses[0] : bookingData.businesses;
        const service = Array.isArray(bookingData.services) ? bookingData.services[0] : bookingData.services;

        if (!business || !service) return;

        // Send to customer if email provided
        if (bookingData.customer_email) {
          await sendCancellationToCustomer({
            customerEmail: bookingData.customer_email,
            customerName: bookingData.customer_name,
            confirmationId,
            serviceName: service.name,
            businessName: business.name,
            appointmentDateTime: bookingData.appointment_datetime,
            cancelledBy: 'customer',
          });
        }

        // Send to business
        if (business.email) {
          await sendCancellationToBusiness({
            businessEmail: business.email,
            businessName: business.name,
            confirmationId,
            customerName: bookingData.customer_name,
            serviceName: service.name,
            appointmentDateTime: bookingData.appointment_datetime,
            cancelledBy: 'customer',
          });
        }
      })
  ]).catch((emailError) => {
    console.error('[Cancel] Email notification error:', emailError);
  });

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

  // Verify booking belongs to user and capture old datetime for email
  const { data: booking, error: fetchError} = await supabase
    .from("bookings")
    .select("id, customer_id, business_id, service_id, staff_id, status, reschedule_count, appointment_datetime")
    .eq("id", data.bookingId)
    .single();

  if (fetchError || !booking) {
    // PGRST116 is expected "not found" - only log real errors
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Fetch booking error:", fetchError);
    }
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

  // Check reschedule limit (maximum 3 reschedules per booking)
  const rescheduleCount = booking.reschedule_count || 0;
  if (rescheduleCount >= 3) {
    return { success: false, error: "Maximum reschedule limit reached (3 times). Please cancel and create a new booking if needed." };
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
    // PGRST116 is expected when staff doesn't exist - only log real errors
    if (staffError && staffError.code !== 'PGRST116') {
      console.error("Fetch staff error:", staffError);
    }
    return { success: false, error: "Selected staff member is no longer available" };
  }

  // Check for overlapping bookings for the selected staff - CORRECT overlap logic
  // Note: DB-level exclusion constraint now prevents race conditions
  // This check provides early feedback before attempting the update
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
  // DB constraint ensures no overlap even if concurrent request passes the check above
  // Atomic reschedule limit enforcement: prevents concurrent requests from bypassing limit
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      appointment_datetime: newDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      staff_id: targetStaffId,
      reschedule_count: rescheduleCount + 1,
    })
    .eq("id", data.bookingId)
    .eq("customer_id", user.id)
    .eq("status", "confirmed")  // prevent rescheduling if concurrently cancelled
    .lt("reschedule_count", 3)  // atomic limit check (prevents race condition)
    .select("id");

  if (error) {
    console.error("Reschedule booking error:", error);

    // Check for exclusion constraint violation (23P01)
    // This happens when a concurrent request creates an overlap
    if (error.code === '23P01' || error.message?.includes('bookings_no_staff_overlap')) {
      return { success: false, error: "This time slot was just booked by another customer. Please choose a different time." };
    }

    return { success: false, error: "Failed to reschedule booking" };
  }

  if (!updated || updated.length === 0) {
    return { success: false, error: "Booking could not be rescheduled — it may have been cancelled" };
  }

  revalidatePath("/customer/dashboard");

  // Send reschedule emails (non-blocking)
  // Capture old datetime from booking fetched before update
  const oldAppointmentDateTime = booking.appointment_datetime;

  Promise.all([
    admin
      .from("bookings")
      .select("customer_name, customer_phone, customer_email, services(name), staff(name), businesses(name, email, slug)")
      .eq("id", data.bookingId)
      .single()
      .then(async ({ data: bookingData }) => {
        if (!bookingData) return;

        const confirmationId = `RG-${data.bookingId.slice(0, 8).toUpperCase()}`;
        const business = Array.isArray(bookingData.businesses) ? bookingData.businesses[0] : bookingData.businesses;
        const service = Array.isArray(bookingData.services) ? bookingData.services[0] : bookingData.services;
        const staff = Array.isArray(bookingData.staff) ? bookingData.staff[0] : bookingData.staff;

        if (!business || !service) return;

        // Send to customer if email provided
        if (bookingData.customer_email) {
          await sendRescheduleToCustomer({
            customerEmail: bookingData.customer_email,
            customerName: bookingData.customer_name,
            confirmationId,
            serviceName: service.name,
            businessName: business.name,
            businessSlug: business.slug,
            oldAppointmentDateTime,
            newAppointmentDateTime: newDateTime.toISOString(),
            staffName: staff?.name || null,
            bookingId: data.bookingId,
          });
        }

        // Send to business
        if (business.email) {
          await sendRescheduleToBusiness({
            businessEmail: business.email,
            businessName: business.name,
            confirmationId,
            customerName: bookingData.customer_name,
            serviceName: service.name,
            businessSlug: business.slug,
            oldAppointmentDateTime,
            newAppointmentDateTime: newDateTime.toISOString(),
            staffName: staff?.name || null,
            bookingId: data.bookingId,
          });
        }
      })
  ]).catch((emailError) => {
    console.error('[Reschedule] Email notification error:', emailError);
  });

  return { success: true };
}
