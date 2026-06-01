import { createClient, createAdminClient } from "@/lib/supabase/server";
import { formatTbilisi } from "@/lib/utils/datetime";

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("Dashboard getUser:", { user: user?.id, error: userError });

  if (!user) {
    // Middleware should have caught this, but double-check
    return (
      <section>
        <h1 className="text-headline-md">Session invalid</h1>
        <p className="mt-stack-md text-on-surface-variant">
          Please <a href="/login" className="underline">sign in again</a>.
        </p>
      </section>
    );
  }

  // owner's business (single-tenant model for now)
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("id, name, salome_enabled, is_active, owner_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  console.log("Dashboard business query:", { userId: user.id, business, bizError });

  // DEBUG: check if business exists but RLS is blocking it
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

  return (
    <section className="space-y-stack-lg">
      <div>
        <p className="label-mono text-primary">TODAY</p>
        <h1 className="mt-stack-sm text-headline-md">{business.name}</h1>
        {!business.is_active && (
          <p className="mt-stack-md font-mono text-data-label text-primary">
            ⚠ Business is inactive — activate it from Settings before it appears in search.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant">
        <Metric label="APPOINTMENTS TODAY" value={String(todays?.length ?? 0)} />
        <Metric label="SALOME" value={business.salome_enabled ? "ON" : "OFF"} />
        <Metric label="STATUS" value={business.is_active ? "LIVE" : "DRAFT"} />
      </div>

      <div>
        <p className="label-mono mb-stack-md">UPCOMING TODAY</p>
        {todays && todays.length > 0 ? (
          <ul className="divide-y divide-outline-variant border-t border-b border-outline-variant">
            {todays.map((b: any) => (
              <li key={b.id} className="grid grid-cols-12 gap-stack-md py-stack-md px-stack-sm">
                <span className="col-span-2 font-mono text-data-numeric">
                  {formatTbilisi(b.appointment_datetime, "HH:mm")}
                </span>
                <span className="col-span-4">{b.customer_name}</span>
                <span className="col-span-3 text-on-surface-variant">{b.services?.name ?? "—"}</span>
                <span className="col-span-2 text-on-surface-variant">{b.staff?.name ?? "—"}</span>
                <span className="col-span-1 label-mono text-primary">{b.booking_source.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-on-surface-variant border border-outline-variant p-gutter">
            No appointments today. Voice bookings via Salome will appear here when Phase 4 ships.
          </p>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-gutter">
      <p className="label-mono">{label}</p>
      <p className="mt-stack-sm font-mono text-2xl text-primary">{value}</p>
    </div>
  );
}
