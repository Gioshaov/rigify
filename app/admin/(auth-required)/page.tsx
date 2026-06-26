import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { formatTbilisi } from '@/lib/utils/datetime';
import { BusinessRowActions } from './BusinessRowActions';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

export default async function SuperAdminDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Fetch real statistics
  const [
    { count: totalBusinesses },
    { count: activeBusinesses },
    { count: totalCustomers },
    { count: todayBookings },
    { data: recentBusinesses },
    { data: operatingCities },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true })
      .gte('appointment_datetime', new Date().toISOString().split('T')[0]),
    supabase.from('businesses')
      .select('id, name, subdomain, status, city, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.rpc('get_operating_cities_count'),
  ]);

  return (
    <div className="min-h-dvh flex bg-[#0a0a0a]">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-60 overflow-y-auto">
        {/* TOP BAR */}
        <AdminTopBar
          title="Dashboard Overview"
          action={
            <Link
              href="/admin/onboard"
              data-testid="new-business-btn"
              className="bg-[#d4a843] text-black font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Business
            </Link>
          }
        />

        {/* STAT CARDS */}
        <div className="grid grid-cols-5 gap-4 mt-6 px-8">
          <div data-testid="admin-stat-total-businesses" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-5">
            <p className="text-[#888888] text-[11px] uppercase tracking-widest">
              Total Businesses
            </p>
            <p className="text-[#d4a843] text-5xl font-bold font-mono mt-2 leading-none">
              {totalBusinesses || 0}
            </p>
          </div>
          <div data-testid="admin-stat-active-businesses" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-5">
            <p className="text-[#888888] text-[11px] uppercase tracking-widest">
              Active Businesses
            </p>
            <p className="text-[#d4a843] text-5xl font-bold font-mono mt-2 leading-none">
              {activeBusinesses || 0}
            </p>
          </div>
          <div data-testid="admin-stat-operating-cities" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-5">
            <p className="text-[#888888] text-[11px] uppercase tracking-widest">
              Operating Cities
            </p>
            <p className="text-[#d4a843] text-5xl font-bold font-mono mt-2 leading-none">
              {operatingCities || 0}
            </p>
          </div>
          <div data-testid="admin-stat-total-customers" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-5">
            <p className="text-[#888888] text-[11px] uppercase tracking-widest">
              Total Customers
            </p>
            <p className="text-[#d4a843] text-5xl font-bold font-mono mt-2 leading-none">
              {totalCustomers || 0}
            </p>
          </div>
          <div data-testid="admin-stat-today-bookings" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-5">
            <p className="text-[#888888] text-[11px] uppercase tracking-widest">
              Today&apos;s Bookings
            </p>
            <p className="text-[#d4a843] text-5xl font-bold font-mono mt-2 leading-none">
              {todayBookings || 0}
            </p>
          </div>
        </div>

        {/* RECENT BUSINESSES */}
        <div className="mt-8 px-8 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Recent Businesses</h3>
            <Link
              href="/admin/businesses"
              className="text-[#d4a843] text-sm hover:text-[#d4a843]/80 transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded">
            {/* Table Header */}
            <div className="flex items-center border-b border-[#2a2a2a] px-5 py-3">
              <div className="flex-1 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                Business Name
              </div>
              <div className="w-[200px] text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                Subdomain
              </div>
              <div className="w-[120px] text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                City
              </div>
              <div className="w-[120px] text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                Status
              </div>
              <div className="w-[140px] text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                Created
              </div>
              <div className="w-[100px] text-[#888888] text-[11px] uppercase tracking-widest font-medium text-right">
                Actions
              </div>
            </div>

            {/* Table Rows */}
            {recentBusinesses && recentBusinesses.length > 0 ? (
              recentBusinesses.map((business) => (
                <div
                  key={business.id}
                  data-testid={`business-row-${business.id}`}
                  className="flex items-center border-b border-[#222222] px-5 h-16 hover:bg-[#222222] transition-colors"
                >
                  <div className="flex-1 flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-sm ${
                        business.status === 'active' ? 'bg-[#d4a843]' : 'bg-[#555555]'
                      }`}
                    ></div>
                    <span className="text-white font-medium text-sm">
                      {business.name}
                    </span>
                  </div>

                  <div className="w-[200px] text-[#888888] text-sm font-mono">
                    {business.subdomain ? `${business.subdomain}.rigify.ge` : '—'}
                  </div>

                  <div className="w-[120px] text-[#cccccc] text-sm">
                    {business.city || '—'}
                  </div>

                  <div className="w-[120px]">
                    {business.status === 'active' ? (
                      <span className="inline-block bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block bg-[rgba(100,100,100,0.1)] border border-[#444444] text-[#888888] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="w-[140px] text-[#888888] text-[13px] font-mono">
                    {formatTbilisi(business.created_at, 'yyyy-MM-dd')}
                  </div>

                  {/* Actions */}
                  <BusinessRowActions business={business} />
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-[#888888]">
                No businesses yet. Create your first business to get started.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
