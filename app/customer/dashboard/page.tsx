import { createClient } from "@/lib/supabase/server";
import { formatTbilisi } from "@/lib/utils/datetime";

export default async function CustomerBookingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section>
        <h1 className="text-headline-md">Please sign in</h1>
      </section>
    );
  }

  const now = new Date();

  // Get upcoming bookings (future appointments)
  const { data: upcoming } = await supabase
    .from("bookings")
    .select("id, appointment_datetime, status, business_id, businesses(name, city), services(name), staff(name)")
    .eq("customer_id", user.id)
    .gte("appointment_datetime", now.toISOString())
    .order("appointment_datetime", { ascending: true });

  // Get past bookings (completed or past appointments)
  const { data: past } = await supabase
    .from("bookings")
    .select("id, appointment_datetime, status, business_id, businesses(name, city), services(name), staff(name)")
    .eq("customer_id", user.id)
    .lt("appointment_datetime", now.toISOString())
    .order("appointment_datetime", { ascending: false })
    .limit(10);

  return (
    <section className="space-y-stack-lg">
      <div>
        <h1 className="text-headline-md">My Bookings</h1>
        <p className="mt-stack-sm text-on-surface-variant">
          View and manage your appointments
        </p>
      </div>

      <div>
        <p className="label-mono mb-stack-md">UPCOMING</p>
        {upcoming && upcoming.length > 0 ? (
          <ul className="divide-y divide-outline-variant border-t border-b border-outline-variant">
            {upcoming.map((b: any) => (
              <li key={b.id} className="py-stack-md px-stack-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{b.businesses?.name || "—"}</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {b.services?.name || "Service"} · {b.staff?.name || "Staff"}
                    </p>
                    <p className="font-mono text-data-numeric mt-2">
                      {formatTbilisi(b.appointment_datetime, "MMM d, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                  <span className="label-mono text-primary">{b.status.toUpperCase()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-on-surface-variant border border-outline-variant p-gutter">
            No upcoming bookings.
          </p>
        )}
      </div>

      <div>
        <p className="label-mono mb-stack-md">PAST BOOKINGS</p>
        {past && past.length > 0 ? (
          <ul className="divide-y divide-outline-variant border-t border-b border-outline-variant">
            {past.map((b: any) => (
              <li key={b.id} className="py-stack-md px-stack-sm opacity-60">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{b.businesses?.name || "—"}</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {b.services?.name || "Service"} · {b.staff?.name || "Staff"}
                    </p>
                    <p className="font-mono text-data-numeric mt-2">
                      {formatTbilisi(b.appointment_datetime, "MMM d, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                  <span className="label-mono text-on-surface-variant">{b.status.toUpperCase()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-on-surface-variant border border-outline-variant p-gutter">
            No past bookings.
          </p>
        )}
      </div>
    </section>
  );
}
