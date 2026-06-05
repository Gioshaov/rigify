"use client";

import { useTranslations } from "@/lib/hooks/useTranslations";
import { formatTbilisi } from "@/lib/utils/datetime";

type Business = {
  id: string;
  name: string;
  salome_enabled: boolean;
  is_active: boolean;
};

type Booking = {
  id: string;
  customer_name: string;
  appointment_datetime: string;
  booking_source: string;
  services: { name: string } | null;
  staff: { name: string } | null;
};

export function DashboardOverviewContent({
  business,
  todays,
}: {
  business: Business;
  todays: Booking[];
}) {
  const { tr, lang } = useTranslations();

  return (
    <section className="space-y-stack-lg">
      <div>
        <p className="label-mono text-primary">{tr.dashboard.overview.today[lang]}</p>
        <h1 className="mt-stack-sm text-headline-md">{business.name}</h1>
        {!business.is_active && (
          <p className="mt-stack-md font-mono text-data-label text-primary">
            {tr.dashboard.overview.businessInactive[lang]}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant">
        <Metric label={tr.dashboard.overview.appointmentsToday[lang]} value={String(todays?.length ?? 0)} />
        <Metric
          label={tr.dashboard.overview.salome[lang]}
          value={business.salome_enabled ? tr.dashboard.overview.on[lang] : tr.dashboard.overview.off[lang]}
        />
        <Metric
          label={tr.dashboard.overview.status[lang]}
          value={business.is_active ? tr.dashboard.overview.live[lang] : tr.dashboard.overview.draft[lang]}
        />
      </div>

      <div>
        <p className="label-mono mb-stack-md">{tr.dashboard.overview.upcomingToday[lang]}</p>
        {todays && todays.length > 0 ? (
          <ul className="divide-y divide-outline-variant border-t border-b border-outline-variant">
            {todays.map((b) => (
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
            {tr.dashboard.overview.noAppointments[lang]}
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
