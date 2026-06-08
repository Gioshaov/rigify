"use client";

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
  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-12">
        <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-4">
          Today's Overview
        </span>
        <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary mb-2">
          {business.name}
        </h1>
        {!business.is_active && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-error/10 border border-error/20 mt-4">
            <span className="material-symbols-outlined text-error text-[14px]">warning</span>
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-error uppercase">
              Business Inactive
            </span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-surface-container border border-white/5 p-8">
          <div className="flex items-start justify-between mb-4">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              Appointments Today
            </span>
            <span className="material-symbols-outlined text-primary text-[24px]">event</span>
          </div>
          <p className="font-hanken text-[48px] leading-[1.1] font-bold text-primary">
            {todays?.length ?? 0}
          </p>
        </div>

        <div className="bg-surface-container border border-white/5 p-8">
          <div className="flex items-start justify-between mb-4">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              Salome AI
            </span>
            <span className="material-symbols-outlined text-primary text-[24px]">mic</span>
          </div>
          <p className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary">
            {business.salome_enabled ? "Active" : "Inactive"}
          </p>
        </div>

        <div className="bg-surface-container border border-white/5 p-8">
          <div className="flex items-start justify-between mb-4">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              Business Status
            </span>
            <span className="material-symbols-outlined text-primary text-[24px]">
              {business.is_active ? "check_circle" : "draft"}
            </span>
          </div>
          <p className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary">
            {business.is_active ? "Live" : "Draft"}
          </p>
        </div>
      </div>

      {/* Today's Appointments */}
      <section>
        <h2 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary uppercase mb-6">
          Today's Schedule
        </h2>
        {todays && todays.length > 0 ? (
          <div className="bg-surface-container border border-white/5">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-surface-container-low">
              <div className="col-span-2">
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
                  Time
                </span>
              </div>
              <div className="col-span-3">
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
                  Customer
                </span>
              </div>
              <div className="col-span-3">
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
                  Service
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
                  Staff
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
                  Source
                </span>
              </div>
            </div>

            {/* Table Rows */}
            <div>
              {todays.map((b, index) => (
                <div
                  key={b.id}
                  data-testid={`appointment-row-${b.id}`}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors ${
                    index !== todays.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
                    <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold">
                      {formatTbilisi(b.appointment_datetime, "HH:mm")}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface">
                      {b.customer_name}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
                      {b.services?.name ?? "—"}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
                      {b.staff?.name ?? "—"}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="px-2 py-1 bg-primary/10 border border-primary/20 font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase">
                      {b.booking_source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-surface-container border border-white/5 p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-[32px]">event_busy</span>
            </div>
            <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
              No appointments scheduled for today
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
