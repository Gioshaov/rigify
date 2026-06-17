import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BookingsTable } from './BookingsTable';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    source?: string;
    business?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  };
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

  // Build query for bookings with joined data
  let query = supabase
    .from('bookings')
    .select(`
      id,
      customer_name,
      customer_phone,
      customer_email,
      appointment_datetime,
      duration_minutes,
      status,
      booking_source,
      notes,
      price,
      created_at,
      business_id,
      businesses!inner(name, subdomain),
      services(name),
      staff(name),
      customers(name)
    `, { count: 'exact' })
    .order('appointment_datetime', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // Filters
  // Note: Cannot search by business name in .or() due to PostgREST limitation with joined tables
  // Use the business filter dropdown for business-specific filtering
  if (searchQuery) {
    const search = `%${searchQuery}%`;
    query = query.or(`customer_name.ilike.${search},customer_phone.ilike.${search},customer_email.ilike.${search}`);
  }

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }

  if (searchParams.source && searchParams.source !== 'all') {
    query = query.eq('booking_source', searchParams.source);
  }

  if (searchParams.business && searchParams.business !== 'all') {
    query = query.eq('business_id', searchParams.business);
  }

  if (searchParams.dateFrom) {
    query = query.gte('appointment_datetime', searchParams.dateFrom);
  }

  if (searchParams.dateTo) {
    // Add one day to include the entire end date
    const endDate = new Date(searchParams.dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt('appointment_datetime', endDate.toISOString());
  }

  const { data: bookings, error, count } = await query;

  if (error) {
    console.error('Failed to fetch bookings:', error);
  }

  // Fetch all businesses for filter dropdown
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name')
    .order('name');

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  // Type for booking row with joined data (Supabase returns arrays for joins)
  type BookingRow = {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    appointment_datetime: string;
    duration_minutes: number;
    status: string;
    booking_source: string;
    notes: string | null;
    price: number;
    created_at: string;
    business_id: string;
    businesses: { name: string; subdomain: string | null } | { name: string; subdomain: string | null }[] | null;
    services: { name: string } | { name: string }[] | null;
    staff: { name: string } | { name: string }[] | null;
    customers: { name: string } | { name: string }[] | null;
  };

  // Format bookings data for the table
  const formattedBookings = (bookings || []).map((booking: BookingRow) => {
    const business = Array.isArray(booking.businesses) ? booking.businesses[0] : booking.businesses;
    const service = Array.isArray(booking.services) ? booking.services[0] : booking.services;
    const staff = Array.isArray(booking.staff) ? booking.staff[0] : booking.staff;
    const customer = Array.isArray(booking.customers) ? booking.customers[0] : booking.customers;

    return {
      id: booking.id,
      customerName: customer?.name || booking.customer_name,
      customerPhone: booking.customer_phone,
      customerEmail: booking.customer_email,
      appointmentDatetime: booking.appointment_datetime,
      durationMinutes: booking.duration_minutes,
      status: booking.status,
      bookingSource: booking.booking_source,
      notes: booking.notes,
      price: booking.price,
      createdAt: booking.created_at,
      businessName: business?.name || 'Unknown Business',
      businessSubdomain: business?.subdomain ?? null,
      serviceName: service?.name ?? null,
      staffName: staff?.name ?? null,
      isGuest: !customer,
    };
  });

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-60 overflow-y-auto">
        {/* TOP BAR */}
        <AdminTopBar
          title="Booking Management"
          subtitle={`${count || 0} total bookings`}
        />

        {/* CONTENT */}
        <div className="p-8">
          <BookingsTable
            bookings={formattedBookings}
            businesses={businesses || []}
            currentPage={page}
            totalPages={totalPages}
            totalCount={count || 0}
            selectedStatus={searchParams.status || 'all'}
            selectedSource={searchParams.source || 'all'}
            selectedBusiness={searchParams.business || 'all'}
            dateFrom={searchParams.dateFrom || ''}
            dateTo={searchParams.dateTo || ''}
            searchQuery={searchParams.search || ''}
          />
        </div>
      </main>
    </div>
  );
}
