import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BookingDetailView } from './BookingDetailView';

export default async function BookingDetailPage({
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

  // Use admin client to fetch booking data
  const admin = createAdminClient();

  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select(`
      *,
      business:businesses(id, name, slug),
      service:services(id, name, price, duration_minutes),
      staff:staff(id, name),
      customer:customers(id, name, phone, email)
    `)
    .eq('id', params.id)
    .single();

  if (bookingError || !booking) {
    redirect('/admin/bookings');
  }

  return <BookingDetailView booking={booking} />;
}
