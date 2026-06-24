import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { BookingConfirmationData } from "@/lib/bookings/types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Shared confirmation fetch used by BOTH the standalone Booking Confirmed page
 * and the GET /api/bookings/[id] route, so the auth/PII/expiry rules live in one
 * place. Returns null when the booking is missing, the id is malformed, or the
 * viewer isn't authorized and the (guest) booking is older than 24h.
 */
export async function getBookingConfirmation(
  bookingId: string | undefined
): Promise<{ booking: BookingConfirmationData; canViewPII: boolean } | null> {
  if (!bookingId || !UUID_REGEX.test(bookingId)) {
    return null;
  }

  const admin = createAdminClient();
  const supabase = createClient();

  // Minimal metadata first (no PII)
  const { data: bookingMeta, error: metaError } = await admin
    .from("bookings")
    .select("id, business_id, customer_id, created_at")
    .eq("id", bookingId)
    .single();

  if (metaError || !bookingMeta) {
    return null;
  }

  // Is the viewer authorized to see PII (the customer or the business owner)?
  const { data: { user } } = await supabase.auth.getUser();

  let canViewPII = false;
  let isAuthorizedViewer = false;

  if (user) {
    if (bookingMeta.customer_id === user.id) {
      canViewPII = true;
      isAuthorizedViewer = true;
    }
    if (!isAuthorizedViewer) {
      const { data: business } = await admin
        .from("businesses")
        .select("owner_id")
        .eq("id", bookingMeta.business_id)
        .single();
      if (business?.owner_id === user.id) {
        canViewPII = true;
        isAuthorizedViewer = true;
      }
    }
  }

  // Guest bookings expire after 24h for unauthenticated/unauthorized viewers
  if (!isAuthorizedViewer) {
    const bookingAge = Date.now() - new Date(bookingMeta.created_at).getTime();
    if (bookingAge > 24 * 60 * 60 * 1000) {
      return null;
    }
  }

  let booking;

  if (canViewPII) {
    const { data, error } = await admin
      .from("bookings")
      .select(`
        id,
        appointment_datetime,
        price,
        customer_name,
        customer_phone,
        customer_email,
        services ( name, duration_minutes, price_min, price_max ),
        staff ( name ),
        businesses ( name, slug, phone, address, city, latitude, longitude )
      `)
      .eq("id", bookingId)
      .single();
    if (error || !data) return null;
    booking = data;
  } else {
    const { data, error } = await admin
      .from("bookings")
      .select(`
        id,
        appointment_datetime,
        price,
        services ( name, duration_minutes, price_min, price_max ),
        staff ( name ),
        businesses ( name, slug, phone, address, city, latitude, longitude )
      `)
      .eq("id", bookingId)
      .single();
    if (error || !data) return null;
    booking = {
      ...data,
      customer_name: undefined,
      customer_phone: undefined,
      customer_email: undefined,
    };
  }

  // Transform array joins to single objects
  const transformedBooking = {
    ...booking,
    services: Array.isArray(booking.services) ? booking.services[0] : booking.services,
    staff: Array.isArray(booking.staff) ? booking.staff[0] : booking.staff,
    businesses: Array.isArray(booking.businesses) ? booking.businesses[0] : booking.businesses,
  } as BookingConfirmationData;

  return { booking: transformedBooking, canViewPII };
}
