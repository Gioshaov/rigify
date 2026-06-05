import { createClient, createAdminClient } from "@/lib/supabase/server";
import { DashboardOverviewContent } from "@/components/dashboard/DashboardOverviewContent";

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("Dashboard getUser:", { user: user?.id, error: userError });

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

  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("id, name, salome_enabled, is_active, owner_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  console.log("Dashboard business query:", { userId: user.id, business, bizError });

  if (!business) {
    const admin = createAdminClient();
    const { data: adminCheck } = await admin
      .from("businesses")
      .select("id, name, owner_id, is_active")
      .eq("owner_id", user.id)
      .maybeSingle();
    console.log("Admin bypass RLS check:", adminCheck);
  }

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
    .select("id, customer_name, appointment_datetime, status, booking_source, price, services(name), staff(name)")
    .eq("business_id", business.id)
    .gte("appointment_datetime", startOfDay.toISOString())
    .lt("appointment_datetime", endOfDay.toISOString())
    .order("appointment_datetime", { ascending: true });

  return <DashboardOverviewContent business={business} todays={todays || []} />;
}
