import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { TopNav } from "@/components/navigation/TopNav";
import { BrowseLink } from "@/components/navigation/BrowseLink";
import { createClient } from "@/lib/supabase/server";
import { BookServiceButton } from "./BookServiceButton";
import { ServicesList } from "./ServicesList";
import { ReviewsSection } from "./ReviewsSection";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { getBusinessFallbackImage } from "@/lib/utils/fallback-images";

// Dynamic import to prevent 1.7MB Mapbox bundle from being included in initial page load
const BusinessLocationMap = dynamic(
  () => import('./BusinessLocationMap').then(mod => ({ default: mod.BusinessLocationMap })),
  { ssr: false, loading: () => <div className="w-full h-64 bg-surface-container-low animate-pulse" /> }
);

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_min: number;
  price_max: number;
  category: string | null;
  is_active: boolean;
}

interface Staff {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  description: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  review_count: number;
  services: Service[];
  staff: Staff[];
  business_categories?: Array<{ category_id: string }>;
}

export default async function BusinessProfilePage({
  params
}: {
  params: { slug: string }
}) {
  // Validate slug to prevent excessive database load and invalid characters
  if (!params.slug || params.slug.length > 100 || !/^[a-z0-9-]+$/.test(params.slug)) {
    notFound();
  }

  const supabase = createClient();

  // Fetch business with active services and staff
  const { data: business, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      address,
      city,
      phone,
      description,
      cover_image_url,
      logo_url,
      latitude,
      longitude,
      rating,
      review_count,
      business_categories(category_id),
      services!left(
        id,
        name,
        description,
        duration_minutes,
        price_min,
        price_max,
        category,
        is_active
      ),
      staff!left(
        id,
        name,
        specialty,
        bio,
        avatar_url,
        is_active
      )
    `)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('[BusinessProfilePage] Supabase error:', error.message);
  }
  if (error || !business) {
    notFound();
  }

  // Format services array from the nested structure
  const services: Service[] = Array.isArray(business.services)
    ? business.services.filter((s): s is Service => s !== null && s.is_active === true)
    : [];

  // Format staff array from the nested structure
  const staff: Staff[] = Array.isArray(business.staff)
    ? business.staff.filter((s): s is Staff => s !== null && s.is_active === true)
    : [];

  // Fetch reviews for this business (most recent first, limit 10)
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, customer_name, rating, comment, created_at')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const reviewsList: Review[] = reviews || [];

  // Auth state — guests (not logged in) must provide an email when booking.
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Fallback values for missing data
  const displayName = business.name || "Business";
  const displayLocation = business.city
    ? `${business.city}, Georgia`
    : "Tbilisi, Georgia";
  const displayAddress = business.address || "Address not available";
  const displayDescription = business.description ||
    "Welcome to our business. Book your appointment today.";

  return (
    <div className="min-h-dvh bg-background">
      <BookingProvider
        business={{ id: business.id, name: displayName, slug: business.slug }}
        services={services}
        staff={staff}
        isAuthenticated={isAuthenticated}
      >
      {/* Top Navigation */}
      <TopNav />

      <main className="pb-[calc(6rem_+_env(safe-area-inset-bottom))]">
        {/* Hero Section */}
        <section className="relative h-[353px] md:h-[530px] w-full overflow-hidden bg-surface-variant">
          {/* Cover Image with Unsplash Fallback */}
          <Image
            src={getBusinessFallbackImage(business.cover_image_url, business.business_categories)}
            alt={displayName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full px-margin-mobile md:px-margin-desktop pb-base md:pb-gutter flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-6">
              {/* Logo or Initial */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-surface-elevated border border-white/10 p-2 relative z-10 flex items-center justify-center overflow-hidden">
                {business.logo_url ? (
                  <Image
                    src={business.logo_url}
                    alt={`${displayName} logo`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-primary select-none">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="mb-2">
                <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold md:text-[48px] md:leading-[1.1] uppercase text-white">
                  {displayName}
                </h1>
                <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase mt-1">
                  {displayLocation}
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <BookServiceButton />
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mt-12 grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Left Column: Details */}
          <div className="md:col-span-8 space-y-16">
            {/* About */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-primary"></div>
                <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold uppercase tracking-tight">
                  About the Studio
                </h2>
              </div>
              <p className="font-hanken text-[18px] leading-[1.6] font-normal text-on-surface-variant max-w-2xl">
                {displayDescription}
              </p>
            </section>

            {/* Services */}
            <section id="services-section">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-6 bg-primary"></div>
                  <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold uppercase tracking-tight">
                    Services
                  </h2>
                </div>
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant">
                  AVAILABLE NOW
                </span>
              </div>
              <ServicesList services={services} />
            </section>

            {/* Reviews */}
            <ReviewsSection
              businessName={displayName}
              averageRating={business.rating || 0}
              reviewCount={business.review_count || 0}
              reviews={reviewsList}
            />

            {/* Portfolio section removed until portfolio_images table is implemented */}
            {/* TODO: Add Portfolio section back when real data exists - see design-assets/stitch_rigify/stern_barber_shop/ for design */}
          </div>

          {/* Right Column: Sidebar */}
          <aside className="md:col-span-4 space-y-12">
            {/* Map */}
            {business.latitude && business.longitude && (
              <div className="bg-surface-container border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase">
                    Location on Map
                  </p>
                </div>
                <BusinessLocationMap
                  name={displayName}
                  latitude={business.latitude}
                  longitude={business.longitude}
                  address={displayAddress}
                />
              </div>
            )}

            {/* Location / Info */}
            <div className="p-8 bg-surface-container border border-white/5">
              <div className="space-y-6">
                <div>
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-2">
                    Location
                  </p>
                  <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface whitespace-pre-line">
                    {displayAddress}
                  </p>
                </div>
                {business.phone && (
                  <div>
                    <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-2">
                      Contact
                    </p>
                    <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface">
                      {business.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Artisans - Stitch Design: design-assets/stitch_rigify/stern_barber_shop/ */}
            {staff.length > 0 && (
              <div className="p-8 bg-surface-container-high border border-white/10" data-testid="business-profile-artisans-section">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-6 bg-primary"></div>
                  <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold uppercase tracking-tight">
                    Artisans
                  </h2>
                </div>
                <div className="space-y-6">
                  {staff.map((member) => (
                    <div
                      key={member.id}
                      data-testid={`artisan-card-${member.id}`}
                      className="flex items-center gap-4"
                    >
                      {/* Avatar */}
                      <div className="w-16 h-16 border border-white/10 grayscale overflow-hidden">
                        {member.avatar_url ? (
                          <Image
                            src={member.avatar_url}
                            alt={member.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-surface flex items-center justify-center">
                            <span className="font-hanken text-[28px] leading-[1] font-bold text-primary select-none">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <p className="font-hanken text-[18px] leading-[1.4] font-semibold text-white">
                          {member.name}
                        </p>
                        {member.specialty && (
                          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase text-on-surface-variant">
                            {member.specialty}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Mobile CTA (Sticky) */}
      <div className="md:hidden fixed bottom-[calc(5rem_+_env(safe-area-inset-bottom))] left-0 w-full p-4 bg-gradient-to-t from-background to-transparent z-40">
        <BookServiceButton mobile />
      </div>

      {/* Mobile Bottom Navigation */}
      <footer className="fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface bottom-nav-safe px-margin-mobile border-t border-white/10 md:hidden">
        <Link data-testid="mobile-nav-home" href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary transition-all">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Home
          </span>
        </Link>
        <BrowseLink testId="mobile-nav-browse" className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1">
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Browse
          </span>
        </BrowseLink>
        <Link data-testid="mobile-nav-my-bookings" href="/customer/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary transition-all">
          <span className="material-symbols-outlined">event_available</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Bookings
          </span>
        </Link>
        <Link data-testid="mobile-nav-business" href="/for-businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary transition-all">
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Business
          </span>
        </Link>
      </footer>
      </BookingProvider>
    </div>
  );
}
