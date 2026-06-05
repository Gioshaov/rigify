import { createClient } from "@/lib/supabase/server";
import { formatTbilisi } from "@/lib/utils/datetime";
import { getServerTranslations } from "@/lib/utils/server-translations";
import { redirect } from "next/navigation";

export default async function CustomerBookingsPage() {
  const { tr, lang } = getServerTranslations();
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
      .select("id, appointment_datetime, status, business_id, businesses!inner(name, address), services!inner(name), staff!left(name)")
      .eq("customer_id", user.id)
      .gte("appointment_datetime", now.toISOString())
      .order("appointment_datetime", { ascending: true }),
    supabase
      .from("bookings")
      .select("id, appointment_datetime, status, business_id, businesses!inner(name, address), services!inner(name), staff!left(name)")
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
    <section className="space-y-stack-lg">
      <div>
        <h1 className="text-headline-md">{tr.customerDashboard.myBookings[lang]}</h1>
        <p className="mt-stack-sm text-on-surface-variant">
          {tr.customerDashboard.viewAndManage[lang]}
        </p>
      </div>

      <div>
        <p className="label-mono mb-stack-md">{tr.customerDashboard.upcoming[lang]}</p>
        {upcoming && upcoming.length > 0 ? (
          <ul className="divide-y divide-outline-variant border-t border-b border-outline-variant">
            {upcoming.map((b) => (
              <li key={b.id} className="py-stack-md px-stack-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{b.businesses?.name || "—"}</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {b.businesses?.address || tr.customerDashboard.addressNotProvided[lang]}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {b.services?.name || tr.customerDashboard.service[lang]} · {b.staff?.name || tr.customerDashboard.staff[lang]}
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
            {tr.customerDashboard.noUpcomingBookings[lang]}
          </p>
        )}
      </div>

      <div>
        <p className="label-mono mb-stack-md">{tr.customerDashboard.pastBookings[lang]}</p>
        {past && past.length > 0 ? (
          <ul className="divide-y divide-outline-variant border-t border-b border-outline-variant">
            {past.map((b) => (
              <li key={b.id} className="py-stack-md px-stack-sm opacity-60">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{b.businesses?.name || "—"}</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {b.businesses?.address || tr.customerDashboard.addressNotProvided[lang]}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {b.services?.name || tr.customerDashboard.service[lang]} · {b.staff?.name || tr.customerDashboard.staff[lang]}
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
            {tr.customerDashboard.noPastBookings[lang]}
          </p>
        )}
      </div>
    </section>
  );
}
