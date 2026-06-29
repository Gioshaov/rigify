import { Suspense } from "react";
import { SiteNav } from "@/components/navigation/SiteNav";
import { createClient } from "@/lib/supabase/server";
import { BusinessPageClient } from "./BusinessPageClient";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BrowseBusinessesPage() {
  const supabase = createClient();

  // Server-side data fetch - runs on each request or after revalidation
  const { data: businessesData } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      city,
      district,
      address,
      description,
      cover_image_url,
      logo_url,
      rating,
      review_count,
      is_active,
      latitude,
      longitude,
      business_categories(category_id)
    `)
    .eq('is_active', true)
    .order('name', { ascending: true });

  const businesses = businessesData || [];

  return (
    <div className="min-h-dvh bg-background">
      <a data-testid="browse-skip-to-main-link" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />

      {/* Hero Section */}
      <header className="w-full h-[353px] md:h-[442px] overflow-hidden flex flex-col justify-center px-4 md:px-margin-desktop">
        <div className="relative max-w-container mx-auto w-full">
          <span className="font-mono text-[12px] leading-[1] tracking-[0.3em] font-medium text-primary uppercase mb-4 block">
            Curated Excellence
          </span>
          <h1 data-testid="browse-studios-hero-title" className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold md:text-[64px] text-primary uppercase max-w-2xl">
            Beauty & Wellness <br />
            in Tbilisi
          </h1>
        </div>
      </header>

      {/* Client-side interactive filtering/sorting */}
      <main id="main-content">
        <Suspense fallback={<div className="px-4 md:px-margin-desktop py-12"><p className="label-mono text-on-surface-variant">Loading...</p></div>}>
          <BusinessPageClient initialBusinesses={businesses} />
        </Suspense>
      </main>

    </div>
  );
}
