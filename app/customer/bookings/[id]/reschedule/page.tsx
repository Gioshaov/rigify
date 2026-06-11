import { notFound, redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { RescheduleBookingClient } from "./RescheduleBookingClient";

export const dynamic = 'force-dynamic';

export default async function RescheduleBookingPage({
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

  // Use admin client to bypass RLS for guest bookings
  const admin = createAdminClient();
  const { data: booking, error } = await admin
    .from('bookings')
    .select(`
      id,
      appointment_datetime,
      status,
      customer_id,
      business_id,
      service_id,
      staff_id,
      businesses!inner(
        name,
        address,
        city
      ),
      services!inner(
        name,
        duration_minutes
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !booking) {
    console.error('[RescheduleBookingPage] Error fetching booking:', error?.message);
    notFound();
  }

  // Security: Verify this booking belongs to the current user
  if (booking.customer_id !== user.id) {
    notFound();
  }

  // Only allow rescheduling confirmed bookings
  if (booking.status !== 'confirmed') {
    redirect(`/customer/bookings/${params.id}`);
  }

  // Fetch available staff for this business
  const { data: staff } = await admin
    .from('staff')
    .select('id, name, specialty')
    .eq('business_id', booking.business_id)
    .eq('is_active', true)
    .order('name', { ascending: true });

  // Normalize the data structure (handle !inner joins)
  const normalizedBooking = {
    ...booking,
    businesses: Array.isArray(booking.businesses) ? booking.businesses[0] : booking.businesses,
    services: Array.isArray(booking.services) ? booking.services[0] : booking.services,
  };

  return (
    <RescheduleBookingClient
      booking={normalizedBooking}
      staff={staff || []}
    />
  );
}
