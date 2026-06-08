import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookAppointmentContent } from "./BookAppointmentContent";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_min: number;
  price_max: number;
}

export default async function BookAppointmentPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { service?: string };
}) {
  const supabase = createClient();

  // Fetch business (only if active)
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (businessError || !business) {
    notFound();
  }

  // Fetch active services for this business
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, name, description, duration_minutes, price_min, price_max')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (servicesError) {
    console.error('Error fetching services:', servicesError);
  }

  // Find selected service if service ID provided in URL
  const selectedServiceId = searchParams.service;
  const selectedService = services?.find(s => s.id === selectedServiceId);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="font-hanken text-[14px] text-on-surface-variant">Loading booking page...</p>
        </div>
      </div>
    }>
      <BookAppointmentContent
        business={business}
        services={services || []}
        selectedService={selectedService || null}
      />
    </Suspense>
  );
}
