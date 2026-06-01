import { createClient } from "@/lib/supabase/server";
import { formatTbilisi } from "@/lib/utils/datetime";

export default async function StaffDashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Get staff record
  const { data: staff } = await supabase
    .from("staff")
    .select("id, name, business_id, businesses!inner(name)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!staff) {
    return (
      <section>
        <h1 className="text-headline-md">No staff account found.</h1>
        <p className="mt-stack-md text-on-surface-variant max-w-xl">
          Your staff account may be inactive. Contact your business administrator.
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
    .select("id, customer_name, appointment_datetime, status, booking_source, services(name), staff(name)")
    .eq("business_id", staff.business_id)
    .gte("appointment_datetime", startOfDay.toISOString())
    .lt("appointment_datetime", endOfDay.toISOString())
    .order("appointment_datetime", { ascending: true });

  return (
    <section className="space-y-stack-lg">
      <div>
        <p className="label-mono text-primary">TODAY</p>
        <h1 className="mt-stack-sm text-headline-md">{staff.businesses.name}</h1>
        <p className="mt-stack-sm text-on-surface-variant">Welcome, {staff.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant">
        <Metric label="APPOINTMENTS TODAY" value={String(todays?.length ?? 0)} />
        <Metric label="YOUR ROLE" value={staff.name} />
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
            No appointments today.
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
