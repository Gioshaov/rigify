import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BookingConfirmationClient } from "./BookingConfirmationClient";

type PageProps = {
  params: { slug: string };
  searchParams: { id?: string };
};

export default async function BookingConfirmedPage({ params, searchParams }: PageProps) {
  const bookingId = searchParams.id;

  if (!bookingId) {
    notFound();
  }

  // Validate UUID format
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(bookingId)) {
    notFound();
  }

  // Use admin client to bypass RLS - booking confirmation needs to work for guests
  const admin = createAdminClient();
  const supabase = createClient();

  // Step 1: Fetch minimal booking metadata (NO PII)
  const { data: bookingMeta, error: metaError } = await admin
    .from("bookings")
    .select("id, business_id, customer_id, created_at")
    .eq("id", bookingId)
    .single();

  if (metaError || !bookingMeta) {
    notFound();
  }

  // Step 2: Check if viewer is authorized to see PII (BEFORE fetching it)
  const { data: { user } } = await supabase.auth.getUser();

  let canViewPII = false;
  let isAuthorizedViewer = false;

  if (user) {
    // Check if viewer is the customer
    if (bookingMeta.customer_id === user.id) {
      canViewPII = true;
      isAuthorizedViewer = true;
    }

    // Check if viewer is the business owner
    if (!isAuthorizedViewer) {
      const { data: business } = await admin
        .from('businesses')
        .select('owner_id')
        .eq('id', bookingMeta.business_id)
        .single();

      if (business?.owner_id === user.id) {
        canViewPII = true;
        isAuthorizedViewer = true;
      }
    }
  }

  // Step 3: Guest bookings expire after 24 hours for unauthenticated/unauthorized viewers
  if (!isAuthorizedViewer) {
    const bookingAge = Date.now() - new Date(bookingMeta.created_at).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (bookingAge > twentyFourHours) {
      notFound();
    }
  }

  // Step 4: Fetch full booking data - conditionally include PII fields based on authorization
  let booking;

  if (canViewPII) {
    // Authorized viewer: fetch WITH PII
    const { data, error } = await admin
      .from("bookings")
      .select(`
        id,
        appointment_datetime,
        price,
        customer_name,
        customer_phone,
        customer_email,
        services (
          name,
          duration_minutes,
          price_min,
          price_max
        ),
        staff (
          name
        ),
        businesses (
          name,
          slug,
          phone,
          address,
          city
        )
      `)
      .eq("id", bookingId)
      .single();

    if (error || !data) {
      notFound();
    }
    booking = data;
  } else {
    // Guest/unauthorized: fetch WITHOUT PII
    const { data, error } = await admin
      .from("bookings")
      .select(`
        id,
        appointment_datetime,
        price,
        services (
          name,
          duration_minutes,
          price_min,
          price_max
        ),
        staff (
          name
        ),
        businesses (
          name,
          slug,
          phone,
          address,
          city
        )
      `)
      .eq("id", bookingId)
      .single();

    if (error || !data) {
      notFound();
    }
    // Add undefined PII fields for type compatibility
    booking = {
      ...data,
      customer_name: undefined,
      customer_phone: undefined,
      customer_email: undefined,
    };
  }

  // Transform array joins to single objects for component
  const transformedBooking = {
    ...booking,
    services: Array.isArray(booking.services) ? booking.services[0] : booking.services,
    staff: Array.isArray(booking.staff) ? booking.staff[0] : booking.staff,
    businesses: Array.isArray(booking.businesses) ? booking.businesses[0] : booking.businesses,
  };

  return <BookingConfirmationClient booking={transformedBooking} canViewPII={canViewPII} />;
}
