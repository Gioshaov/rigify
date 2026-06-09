import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookingCard } from "./BookingCard";

// Revalidate every 30 seconds - fresh enough for bookings without disabling all caching
export const revalidate = 30;

export default async function CustomerBookingsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const now = new Date();

  const [
    { data: upcomingData },
    { data: pastData }
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, appointment_datetime, status, business_id, service_id, staff_id, businesses!inner(name, address), services!inner(name), staff!left(name)")
      .eq("customer_id", user.id)
      .gte("appointment_datetime", now.toISOString())
      .order("appointment_datetime", { ascending: true }),
    supabase
      .from("bookings")
      .select("id, appointment_datetime, status, business_id, service_id, staff_id, businesses!inner(name, address), services!inner(name), staff!left(name)")
      .eq("customer_id", user.id)
      .lt("appointment_datetime", now.toISOString())
      .order("appointment_datetime", { ascending: false })
      .limit(10)
  ]);

  type BookingRow = {
    id: string;
    appointment_datetime: string;
    status: string;
    business_id: string;
    service_id: string;
    staff_id: string | null;
    businesses: { name: string; address: string } | { name: string; address: string }[];
    services: { name: string } | { name: string }[];
    staff: { name: string } | { name: string }[] | null;
  };

  const upcoming = (upcomingData || []).map((b: BookingRow) => ({
    ...b,
    businesses: Array.isArray(b.businesses) ? b.businesses[0] : b.businesses,
    services: Array.isArray(b.services) ? b.services[0] : b.services,
    staff: Array.isArray(b.staff) ? b.staff[0] : b.staff
  }));

  const past = (pastData || []).map((b: BookingRow) => ({
    ...b,
    businesses: Array.isArray(b.businesses) ? b.businesses[0] : b.businesses,
    services: Array.isArray(b.services) ? b.services[0] : b.services,
    staff: Array.isArray(b.staff) ? b.staff[0] : b.staff
  }));

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary mb-3">
          My Bookings
        </h1>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
          View and manage your upcoming and past appointments
        </p>
      </div>

      {/* Upcoming Bookings */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold uppercase">
            Upcoming Appointments
          </h2>
          {upcoming && upcoming.length > 0 && (
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              {upcoming.length} {upcoming.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          )}
        </div>

        {upcoming && upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container border border-white/5 p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-[32px]">event_busy</span>
            </div>
            <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary mb-6">
              No upcoming bookings
            </p>
            <Link
              data-testid="browse-salons-btn"
              href="/businesses"
              className="inline-flex items-center gap-2 bg-primary text-background px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all"
            >
              Browse Salons
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </section>

      {/* Past Bookings */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-text-secondary uppercase">
            Past Appointments
          </h2>
          {past && past.length > 0 && (
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              Last {past.length}
            </span>
          )}
        </div>

        {past && past.length > 0 ? (
          <div className="space-y-4 opacity-60">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} isPast />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low border border-white/5 p-8 text-center">
            <p className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
              No past bookings
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
