import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookingCard } from "./BookingCard";
import { BookingsTabs } from "./BookingsTabs";

// Force dynamic rendering - this page displays personal booking data that must not be cached
// Using ISR (revalidate) would risk serving one user's data to another user
export const dynamic = 'force-dynamic';

export default async function CustomerBookingsPage() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const now = new Date();
  const nowISO = now.toISOString();

  // Fetch customer's emergency cancel status (one per customer, not per booking)
  const { data: customer } = await supabase
    .from("customers")
    .select("has_used_emergency_cancel")
    .eq("id", user.id)
    .single();

  const hasUsedEmergencyCancel = customer?.has_used_emergency_cancel ?? false;

  const BOOKING_SELECT = "id, appointment_datetime, status, business_id, service_id, staff_id, businesses!inner(name, address), services!inner(name), staff!left(name, avatar_url), reviews!left(id)";

  const [
    { data: upcomingData, error: upcomingError },
    { data: pastData, error: pastError }
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("customer_id", user.id)
      .gte("appointment_datetime", nowISO)
      .order("appointment_datetime", { ascending: true }),
    supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("customer_id", user.id)
      .lt("appointment_datetime", nowISO)
      .order("appointment_datetime", { ascending: false })
      .limit(10)
  ]);

  // Handle query errors
  if (upcomingError || pastError) {
    return (
      <div className="max-w-[1280px]" data-testid="customer-bookings-page">
        <div className="relative mb-12">
          <h1 className="font-hanken text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-primary mb-2">
            My Bookings
          </h1>
        </div>
        <div className="bg-error/10 border border-error/30 p-8 text-center">
          <span className="material-symbols-outlined text-error text-[48px] mb-4 block">error</span>
          <p className="font-hanken text-[18px] leading-[1.5] font-normal text-error mb-2">
            Failed to load bookings
          </p>
          <p className="font-mono text-[12px] tracking-[0.15em] text-on-surface-variant">
            {upcomingError?.message || pastError?.message || "Unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // Derive type from actual query result to stay in sync with Supabase schema
  type BookingRow = NonNullable<typeof upcomingData>[number];

  // Type assertions: Supabase SDK infers arrays for foreign key joins without Database type generic
  // At runtime, !inner and !left joins on foreign keys return single objects (not arrays)
  // TODO: Wire Database type into createClient() to get accurate types (requires fixing ~200 type errors)
  const upcoming = (upcomingData || []).map((b: BookingRow) => ({
    ...b,
    businesses: b.businesses as any,
    services: b.services as any,
    staff: b.staff as any,
    hasReview: Array.isArray(b.reviews) ? b.reviews.length > 0 : !!b.reviews
  }));

  const past = (pastData || []).map((b: BookingRow) => ({
    ...b,
    businesses: b.businesses as any,
    services: b.services as any,
    staff: b.staff as any,
    hasReview: Array.isArray(b.reviews) ? b.reviews.length > 0 : !!b.reviews
  }));

  return (
    <div className="max-w-[1280px]" data-testid="customer-bookings-page">
      {/* Header with Background Glow - Stitch Design */}
      <div className="relative mb-12">
        <div className="absolute -left-10 top-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <h1 className="font-hanken text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-primary relative z-10 mb-2">
          My Bookings
        </h1>
        <p className="font-hanken text-[18px] leading-[1.6] font-normal text-on-surface-variant max-w-lg">
          Manage your upcoming appointments and review your past grooming sessions.
        </p>
      </div>

      {/* Tabs Navigation & Content - Stitch Design */}
      <BookingsTabs
        upcomingBookings={upcoming}
        pastBookings={past}
        customerId={user.id}
        initialHasUsedEmergencyCancel={hasUsedEmergencyCancel}
      />
    </div>
  );
}
