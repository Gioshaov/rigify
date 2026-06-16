import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, LayoutGrid, Building2, Users } from 'lucide-react';
import { BookingsTable } from './BookingsTable';

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

  // Pagination
  const page = parseInt(searchParams.page || '1', 10);
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
  if (searchQuery) {
    const search = `%${searchQuery}%`;
    query = query.or(`customer_name.ilike.${search},customer_phone.ilike.${search},customer_email.ilike.${search},businesses.name.ilike.${search}`);
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

  // Format bookings data for the table
  const formattedBookings = (bookings || []).map((booking: any) => ({
    id: booking.id,
    customerName: booking.customers?.name || booking.customer_name,
    customerPhone: booking.customer_phone,
    customerEmail: booking.customer_email,
    appointmentDatetime: booking.appointment_datetime,
    durationMinutes: booking.duration_minutes,
    status: booking.status,
    bookingSource: booking.booking_source,
    notes: booking.notes,
    price: booking.price,
    createdAt: booking.created_at,
    businessName: booking.businesses?.name || 'Unknown Business',
    businessSubdomain: booking.businesses?.subdomain,
    serviceName: booking.services?.name,
    staffName: booking.staff?.name,
    isGuest: !booking.customers,
  }));

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* SIDEBAR */}
      <aside className="w-60 bg-[#111111] flex-shrink-0 fixed h-screen">
        <div className="pt-8 pb-8 px-5">
          <h1 className="text-[#d4a843] text-xl font-bold uppercase tracking-widest">
            RIGIFY
          </h1>
          <p className="text-[#888888] text-[11px] uppercase tracking-widest mt-1">
            SUPER ADMIN
          </p>
        </div>

        <nav className="space-y-1">
          <Link
            href="/admin"
            data-testid="nav-dashboard"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors text-[#888888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
          >
            <LayoutGrid className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            href="/admin/customers"
            data-testid="nav-customers"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors text-[#888888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
          >
            <Users className="w-4 h-4" />
            Customers
          </Link>

          <Link
            href="/admin/bookings"
            data-testid="nav-bookings"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors bg-[#1a1a1a] text-white border-l-2 border-[#d4a843]"
          >
            <Calendar className="w-4 h-4" />
            Bookings
          </Link>

          <Link
            href="/admin/audit-logs"
            data-testid="nav-audit-logs"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors text-[#888888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
          >
            <Users className="w-4 h-4" />
            Audit Logs
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-60 overflow-y-auto">
        {/* TOP BAR */}
        <header className="h-14 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Booking Management</h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#888888] text-sm">
              {count || 0} total bookings
            </span>
          </div>
        </header>

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
