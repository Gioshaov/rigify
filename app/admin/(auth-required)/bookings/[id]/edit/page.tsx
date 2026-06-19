import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditBookingForm } from './EditBookingForm';

export default async function EditBookingPage({
  params,
}: {
  params: { id: string };
}) {
  // Verify super admin access
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Use admin client to fetch booking and related data
  const admin = createAdminClient();

  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select(`
      *,
      business:businesses(id, name),
      service:services(id, name, duration_minutes),
      staff:staff(id, name)
    `)
    .eq('id', params.id)
    .single();

  if (bookingError || !booking) {
    redirect('/admin/bookings');
  }

  // Check if booking is editable
  if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'no_show') {
    redirect(`/admin/bookings/${params.id}`);
  }

  // Fetch services and staff for this business
  const [
    { data: services },
    { data: staff }
  ] = await Promise.all([
    admin
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('business_id', booking.business_id)
      .order('name'),
    admin
      .from('staff')
      .select('id, name')
      .eq('business_id', booking.business_id)
      .eq('is_active', true)
      .order('name')
  ]);

  return (
    <EditBookingForm
      booking={booking}
      services={services || []}
      staff={staff || []}
    />
  );
}
