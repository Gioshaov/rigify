'use client'

import { createClient } from "@/lib/supabase/client";
import { formatTbilisi } from "@/lib/utils/datetime";
import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/hooks/useTranslations";

export default function CustomerBookingsPage() {
  const { tr, lang } = useTranslations();
  const [user, setUser] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);
      const now = new Date();

      // Get upcoming and past bookings in parallel
      const [
        { data: upcomingData },
        { data: pastData }
      ] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, appointment_datetime, status, business_id, businesses(name, address), services(name), staff(name)")
          .eq("customer_id", currentUser.id)
          .gte("appointment_datetime", now.toISOString())
          .order("appointment_datetime", { ascending: true }),
        supabase
          .from("bookings")
          .select("id, appointment_datetime, status, business_id, businesses(name, address), services(name), staff(name)")
          .eq("customer_id", currentUser.id)
          .lt("appointment_datetime", now.toISOString())
          .order("appointment_datetime", { ascending: false })
          .limit(10)
      ]);

      setUpcoming(upcomingData || []);
      setPast(pastData || []);
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <section>
        <p className="text-on-surface-variant">{tr.common.loading[lang]}</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h1 className="text-headline-md">{tr.customerDashboard.pleaseSignIn[lang]}</h1>
      </section>
    );
  }

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
            {upcoming.map((b: any) => (
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
            {past.map((b: any) => (
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
