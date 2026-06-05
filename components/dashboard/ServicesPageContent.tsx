"use client";

import { useTranslations } from "@/lib/hooks/useTranslations";
import { ServicesList } from "@/app/dashboard/services/ServicesList";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
};

export function ServicesPageContent({
  businessId,
  services,
}: {
  businessId: string;
  services: Service[];
}) {
  const { tr, lang } = useTranslations();

  return (
    <section>
      <div className="mb-stack-lg">
        <p className="label-mono text-primary">{tr.dashboard.nav.services[lang]}</p>
        <h1 className="mt-stack-sm text-headline-md">{tr.dashboard.services.title[lang]}</h1>
        <p className="mt-stack-md text-on-surface-variant max-w-xl">
          {tr.dashboard.services.pageDescription[lang]}
        </p>
      </div>

      <ServicesList businessId={businessId} services={services} />
    </section>
  );
}
