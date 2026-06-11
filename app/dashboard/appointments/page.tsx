import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppointmentsContent } from "@/components/dashboard/AppointmentsContent";

export default async function AppointmentsPage() {
  const supabase = createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    redirect('/dashboard');
  }

  // Prepare date range for bookings query
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

  // Parallelize independent queries (all depend on business.id but not on each other)
  const [
    { data: staff },
    { data: services },
    { data: bookings }
  ] = await Promise.all([
    supabase
      .from('staff')
      .select('id, name')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('services')
      .select('id, name, duration_minutes, price_min')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('bookings')
      .select(`
        id,
        appointment_datetime,
        status,
        duration_minutes,
        price,
        customer_name,
        customer_phone,
        customer_email,
        services!inner(id, name),
        staff!left(id, name)
      `)
      .eq('business_id', business.id)
      .gte('appointment_datetime', threeMonthsAgo.toISOString())
      .lte('appointment_datetime', threeMonthsAhead.toISOString())
      .order('appointment_datetime', { ascending: true })
  ]);

  // Calculate monthly stats (using the same 'now' from above)
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyBookings = (bookings || []).filter(b => {
    const bookingDate = new Date(b.appointment_datetime);
    return bookingDate >= firstDay && bookingDate <= lastDay;
  });

  const stats = {
    totalBookings: monthlyBookings.length,
    confirmedBookings: monthlyBookings.filter(b => b.status === 'confirmed').length,
    pendingBookings: monthlyBookings.filter(b => b.status === 'pending').length,
    revenue: monthlyBookings.reduce((sum, b) => sum + (b.price || 0), 0),
  };

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold uppercase mb-2">
          MANAGEMENT PORTAL
        </p>
        <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary mb-3">
          Appointments
        </h1>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
          Manage your bookings and schedule
        </p>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div data-testid="appointments-total-bookings-card" className="bg-surface-container border border-white/5 p-6 hover:border-primary/30 transition-all">
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
            TOTAL BOOKINGS
          </p>
          <p data-testid="appointments-total-bookings-count" className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary">
            {stats.totalBookings}
          </p>
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mt-1">
            THIS MONTH
          </p>
        </div>

        <div data-testid="appointments-confirmed-card" className="bg-surface-container border border-white/5 p-6 hover:border-primary/30 transition-all">
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
            CONFIRMED
          </p>
          <p data-testid="appointments-confirmed-count" className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary">
            {stats.confirmedBookings}
          </p>
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mt-1">
            THIS MONTH
          </p>
        </div>

        <div data-testid="appointments-pending-card" className="bg-surface-container border border-white/5 p-6 hover:border-primary/30 transition-all">
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
            PENDING
          </p>
          <p data-testid="appointments-pending-count" className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary">
            {stats.pendingBookings}
          </p>
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mt-1">
            THIS MONTH
          </p>
        </div>

        <div data-testid="appointments-revenue-card" className="bg-surface-container border border-white/5 p-6 hover:border-primary/30 transition-all">
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
            REVENUE
          </p>
          <p data-testid="appointments-revenue-amount" className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary">
            ₾{((stats.revenue || 0) / 100).toFixed(0)}
          </p>
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mt-1">
            THIS MONTH
          </p>
        </div>
      </div>

      {/* Appointments Content with Calendar/List Toggle */}
      <AppointmentsContent
        bookings={bookings || []}
        staff={staff || []}
        services={services || []}
        businessId={business.id}
      />
    </div>
  );
}
