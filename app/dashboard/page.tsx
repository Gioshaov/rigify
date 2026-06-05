import { createClient } from "@/lib/supabase/server";
import { DashboardOverviewContent } from "@/components/dashboard/DashboardOverviewContent";

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section>
        <h1 className="text-headline-md">Session invalid</h1>
        <p className="mt-stack-md text-on-surface-variant">
          Please <a href="/login" className="underline">sign in again</a>.
        </p>
      </section>
    );
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, salome_enabled, is_active, owner_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    return (
      <section>
        <h1 className="text-headline-md">No business linked to this account.</h1>
        <p className="mt-stack-md text-on-surface-variant max-w-xl">
          If you registered through <code className="font-mono">/register</code>, a business row should have been
          created automatically. Otherwise, run the claim SQL in <code className="font-mono">supabase/seed.sql</code>.
        </p>
      </section>
    );
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const { data: todays } = await supabase
    .from("bookings")
    .select(`
      id,
      customer_name,
      appointment_datetime,
      status,
      booking_source,
      price,
      services!inner (
        name
      ),
      staff!left (
        name
      )
    `)
    .eq("business_id", business.id)
    .gte("appointment_datetime", startOfDay.toISOString())
    .lt("appointment_datetime", endOfDay.toISOString())
    .order("appointment_datetime", { ascending: true });

  // Transform array joins to single objects for component
  const transformedTodays = todays?.map(booking => ({
    ...booking,
    services: Array.isArray(booking.services) ? booking.services[0] : booking.services,
    staff: Array.isArray(booking.staff) ? booking.staff[0] : booking.staff
  })) || [];

  return <DashboardOverviewContent business={business} todays={transformedTodays} />;
}
