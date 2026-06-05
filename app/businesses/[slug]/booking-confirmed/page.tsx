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

  // Use admin client to bypass RLS - booking confirmation needs to work for guests
  const admin = createAdminClient();
  const supabase = createClient();

  const { data: booking, error } = await admin
    .from("bookings")
    .select(`
      *,
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

  return <BookingConfirmationClient booking={booking} canViewPII={canViewPII} />;
}
