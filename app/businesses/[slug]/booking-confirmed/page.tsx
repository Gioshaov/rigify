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

  const { data: booking, error } = await admin
    .from("bookings")
    .select(`
      id,
      appointment_datetime,
      price,
      business_id,
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      created_at,
      services (
        name,
        duration_minutes,
        price
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

  if (error || !booking) {
    notFound();
  }

  // Check if viewer is authorized to see PII (customer or business owner)
  const { data: { user } } = await supabase.auth.getUser();

  let canViewPII = false;
  let isAuthorizedViewer = false;

  if (user) {
    // Check if viewer is the customer
    if (booking.customer_id === user.id) {
      canViewPII = true;
      isAuthorizedViewer = true;
    }

    // Check if viewer is the business owner
    const { data: business } = await admin
      .from('businesses')
      .select('owner_id')
      .eq('id', booking.business_id)
      .single();

    if (business?.owner_id === user.id) {
      canViewPII = true;
      isAuthorizedViewer = true;
    }
  }

  // Guest bookings expire after 24 hours for unauthenticated/unauthorized viewers
  if (!isAuthorizedViewer) {
    const bookingAge = Date.now() - new Date(booking.created_at).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (bookingAge > twentyFourHours) {
      notFound();
    }
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
