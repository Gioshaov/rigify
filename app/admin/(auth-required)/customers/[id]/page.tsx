import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CustomerDetailView } from './CustomerDetailView';

export default async function CustomerDetailPage({
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

  // Use admin client to fetch customer data and bookings
  const admin = createAdminClient();

  const [
    { data: customer, error: customerError },
    { data: bookings }
  ] = await Promise.all([
    admin
      .from('customers')
      .select('*')
      .eq('id', params.id)
      .single(),
    admin
      .from('bookings')
      .select(`
        *,
        business:businesses(id, name, slug),
        service:services(id, name, duration_minutes),
        staff:staff(id, name)
      `)
      .eq('customer_id', params.id)
      .order('appointment_datetime', { ascending: false })
  ]);

  if (customerError || !customer) {
    redirect('/admin/customers');
  }

  // Calculate stats
  const totalBookings = bookings?.length || 0;
  const upcomingBookings = bookings?.filter(
    b => b.status === 'confirmed' && new Date(b.appointment_datetime) > new Date()
  ).length || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
  const noShowBookings = bookings?.filter(b => b.status === 'no_show').length || 0;

  return (
    <CustomerDetailView
      customer={customer}
      bookings={bookings || []}
      stats={{
        total: totalBookings,
        upcoming: upcomingBookings,
        completed: completedBookings,
        noShows: noShowBookings,
      }}
    />
  );
}
