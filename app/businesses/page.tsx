import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "@/components/ui/UserMenu";
import { BrowseLink } from "@/components/navigation/BrowseLink";
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
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 w-full z-50 flex items-center justify-between px-4 md:px-margin-desktop h-16 bg-surface border-b border-white/10">
        <div className="flex items-center gap-4">
          <span data-testid="language-toggle" className="material-symbols-outlined text-primary cursor-pointer">
            language
          </span>
          <Link data-testid="logo-link" href="/">
            <span className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase">
              RIGIFY
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            data-testid="nav-home"
            href="/"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            Home
          </Link>
          <BrowseLink
            testId="nav-browse"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-primary border-b border-primary pt-1"
          >
            Browse
          </BrowseLink>
          <Link
            data-testid="nav-my-bookings"
            href="/customer/dashboard"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            My Bookings
          </Link>
          <Link
            data-testid="nav-for-business"
            href="/for-businesses"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            For Business
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </nav>

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
      <Suspense fallback={<div className="px-4 md:px-margin-desktop py-12"><p className="label-mono text-on-surface-variant">Loading...</p></div>}>
        <BusinessPageClient initialBusinesses={businesses} />
      </Suspense>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-20 px-4 border-t border-white/10">
        <Link data-testid="mobile-nav-home" href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Home
          </span>
        </Link>
        <BrowseLink testId="mobile-nav-browse" className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            search
          </span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Browse
          </span>
        </BrowseLink>
        <Link data-testid="mobile-nav-my-bookings" href="/customer/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">event_available</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Bookings
          </span>
        </Link>
        <Link data-testid="mobile-nav-business" href="/for-businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Business
          </span>
        </Link>
      </nav>
    </div>
  );
}
