import { notFound, redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ManageBookingClient } from "./ManageBookingClient";

export const dynamic = 'force-dynamic';

export default async function ManageBookingPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient();

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch booking with business, service, and staff details
  // Use admin client to bypass RLS for guest bookings
  const admin = createAdminClient();
  const { data: booking, error } = await admin
    .from('bookings')
    .select(`
      id,
      appointment_datetime,
      status,
      customer_name,
      customer_phone,
      customer_email,
      customer_id,
      business_id,
      service_id,
      staff_id,
      businesses!inner(
        name,
        slug,
        address,
        city,
        phone,
        cover_image_url
      ),
      services!inner(
        name,
        description,
        duration_minutes,
        price_min,
        price_max
      ),
      staff!left(
        name,
        specialty,
        avatar_url
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !booking) {
    console.error('[ManageBookingPage] Error fetching booking:', error?.message);
    notFound();
  }

  // Security: Verify this booking belongs to the current user
  if (booking.customer_id !== user.id) {
    notFound();
  }

  // Normalize the data structure (handle !inner joins)
  const normalizedBooking = {
    ...booking,
    businesses: Array.isArray(booking.businesses) ? booking.businesses[0] : booking.businesses,
    services: Array.isArray(booking.services) ? booking.services[0] : booking.services,
    staff: Array.isArray(booking.staff) ? (booking.staff.length > 0 ? booking.staff[0] : null) : booking.staff
  };

  return <ManageBookingClient booking={normalizedBooking} />;
}
