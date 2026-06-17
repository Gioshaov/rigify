import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CustomersTable } from './CustomersTable';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; page?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Pagination (guard against NaN)
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  // Guard against excessively long search strings
  const searchQuery = searchParams.search?.slice(0, 200);

  // Build query for customers with booking stats
  let query = supabase
    .from('customers')
    .select(`
      id,
      name,
      email,
      phone,
      status,
      created_at,
      bookings:bookings(count)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // Filters
  if (searchQuery) {
    const search = `%${searchQuery}%`;
    query = query.or(`name.ilike.${search},email.ilike.${search},phone.ilike.${search}`);
  }

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }

  const { data: customers, error, count } = await query;

  if (error) {
    console.error('Failed to fetch customers:', error);
  }

  // Get last booking for each customer (single query with IN clause)
  const customerIds = (customers || []).map(c => c.id);
  const { data: lastBookings } = await supabase
    .from('bookings')
    .select('customer_id, appointment_datetime')
    .in('customer_id', customerIds)
    .order('appointment_datetime', { ascending: false });

  // Group last bookings by customer_id
  const lastBookingMap = new Map<string, string>();
  lastBookings?.forEach((booking) => {
    if (!lastBookingMap.has(booking.customer_id)) {
      lastBookingMap.set(booking.customer_id, booking.appointment_datetime);
    }
  });

  // Combine data
  const customersWithStats = (customers || []).map((customer: any) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    created_at: customer.created_at,
    bookingCount: customer.bookings?.[0]?.count || 0,
    lastBooking: lastBookingMap.get(customer.id) || null,
  }));

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-60 overflow-y-auto">
        {/* TOP BAR */}
        <AdminTopBar
          title="Customer Management"
          subtitle={`${count || 0} total customers`}
        />

        {/* CONTENT */}
        <div className="p-8">
          <CustomersTable
            customers={customersWithStats}
            currentPage={page}
            totalPages={totalPages}
            totalCount={count || 0}
            selectedStatus={searchParams.status || 'all'}
            searchQuery={searchParams.search || ''}
          />
        </div>
      </main>
    </div>
  );
}
