import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Plus } from 'lucide-react';
import { CustomersTable } from './CustomersTable';

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

  // Pagination
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  // Build query for customers with booking stats
  let query = supabase
    .from('customers')
    .select(`
      id,
      name,
      email,
      phone,
      status,
      created_at
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // Filters
  if (searchParams.search) {
    const search = `%${searchParams.search}%`;
    query = query.or(`name.ilike.${search},email.ilike.${search},phone.ilike.${search}`);
  }

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }

  const { data: customers, error, count } = await query;

  if (error) {
    console.error('Failed to fetch customers:', error);
  }

  // Fetch booking counts for each customer
  const customersWithStats = await Promise.all(
    (customers || []).map(async (customer) => {
      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customer.id);

      const { data: lastBooking } = await supabase
        .from('bookings')
        .select('appointment_datetime')
        .eq('customer_id', customer.id)
        .order('appointment_datetime', { ascending: false })
        .limit(1)
        .single();

      return {
        ...customer,
        bookingCount: bookingCount || 0,
        lastBooking: lastBooking?.appointment_datetime || null,
      };
    })
  );

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* SIDEBAR - Reuse from main dashboard */}
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
            <Users className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            href="/admin/customers"
            data-testid="nav-customers"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors bg-[#1a1a1a] text-white border-l-2 border-[#d4a843]"
          >
            <Users className="w-4 h-4" />
            Customers
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
            <h2 className="text-xl font-bold text-white">Customer Management</h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#888888] text-sm">
              {count || 0} total customers
            </span>
          </div>
        </header>

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
