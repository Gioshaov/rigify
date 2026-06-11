"use client";

import Link from "next/link";
import { formatDuration, formatPrice } from "@/lib/utils/formatting";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_min: number;
  price_max: number;
}

interface ServicesListProps {
  services: Service[];
  businessSlug: string;
}

export function ServicesList({ services, businessSlug }: ServicesListProps) {

  if (services.length === 0) {
    return (
      <div className="p-8 bg-surface-container border border-white/5 text-center">
        <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase">
          No services available at this time
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {services.map((service) => {
        const bookingUrl = `/businesses/${encodeURIComponent(businessSlug)}/book?service=${encodeURIComponent(service.id)}`;

        return (
          <Link
            key={service.id}
            href={bookingUrl}
            data-testid={`service-card-${service.id}`}
            className="flex items-center justify-between p-6 bg-surface-container border border-white/10 hover:border-primary hover:bg-surface-container-high transition-colors cursor-pointer group block"
          >
            <div className="flex-1">
              <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white group-hover:text-primary transition-colors mb-1">
                {service.name}
              </h3>
              <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase mt-1 line-clamp-2">
                {formatDuration(service.duration_minutes)}
                {service.description && ` — ${service.description.slice(0, 100)}`}
              </p>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              <span className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary group-hover:brightness-110 transition-[filter]">
                {service.price_min !== null ? formatPrice(service.price_min, service.price_max) : "Price on request"}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
