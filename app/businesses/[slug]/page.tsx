import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserMenu } from "@/components/ui/UserMenu";
import { createClient } from "@/lib/supabase/server";
import { BookServiceButton } from "./BookServiceButton";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_min: number;
  price_max: number;
  category: string | null;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  description: string | null;
  services: Service[];
}

export default async function BusinessProfilePage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = createClient();

  // Fetch business with active services
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
      services!inner(
        id,
        name,
        description,
        duration_minutes,
        price_min,
        price_max,
        category,
        is_active
      )
    `)
    .eq('slug', params.slug)
    .eq('services.is_active', true)
    .single();

  if (error || !business) {
    notFound();
  }

  // Format services array from the nested structure
  const services: Service[] = (business.services as any[]).filter(
    (s: any) => s.is_active
  );

  // Helper to format price range
  const formatPrice = (minGel: number, maxGel: number) => {
    const min = minGel.toFixed(0);
    const max = maxGel.toFixed(0);
    return min === max ? `${min} GEL` : `${min}-${max} GEL`;
  };

  // Helper to format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Fallback values for missing data
  const displayName = business.name || "Business";
  const displayLocation = business.city
    ? `${business.city}, Georgia`
    : "Tbilisi, Georgia";
  const displayAddress = business.address || "Address not available";
  const displayDescription = business.description ||
    "Welcome to our business. Book your appointment today.";

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-50 flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 bg-surface border-b border-white/10">
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
        <nav className="hidden md:flex items-center gap-8">
          <Link
            data-testid="nav-home"
            href="/"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-primary hover:text-primary transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            data-testid="nav-browse"
            href="/businesses"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            Browse
          </Link>
          <Link
            data-testid="nav-my-bookings"
            href="/customer/dashboard"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            My Bookings
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </header>

      <main className="pb-24">
        {/* Hero Section */}
        <section className="relative h-[353px] md:h-[530px] w-full overflow-hidden bg-surface-variant">
          {/* Placeholder gradient for missing cover image */}
          <div className="absolute inset-0 bg-gradient-to-br from-surface-container via-surface to-surface-variant"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full px-margin-mobile md:px-margin-desktop pb-base md:pb-gutter flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-surface-elevated border border-white/10 p-2 relative z-10 flex items-center justify-center">
                <span className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-primary select-none">
                  {displayName.charAt(0).toUpperCase()}
                </span>
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
              {services.length === 0 ? (
                <div className="p-8 bg-surface-container border border-white/5 text-center">
                  <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase">
                    No services available at this time
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/businesses/${business.slug}/book?service=${service.id}`}
                      data-testid={`service-card-${service.id}`}
                      className="group flex items-center justify-between p-6 bg-surface-container border border-white/5 hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <div>
                        <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white group-hover:text-primary transition-colors">
                          {service.name}
                        </h3>
                        <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase mt-1">
                          {formatDuration(service.duration_minutes)}
                          {service.description && ` — ${service.description}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary">
                          {formatPrice(service.price_min, service.price_max)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="md:col-span-4 space-y-12">
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
          </aside>
        </div>
      </main>

      {/* Mobile CTA (Sticky) */}
      <div className="md:hidden fixed bottom-20 left-0 w-full p-4 bg-gradient-to-t from-background to-transparent z-40">
        <BookServiceButton mobile />
      </div>

      {/* Mobile Bottom Navigation */}
      <footer className="fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10 md:hidden">
        <Link data-testid="mobile-nav-home" href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary transition-all">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Home
          </span>
        </Link>
        <Link data-testid="mobile-nav-browse" href="/businesses" className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1">
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Browse
          </span>
        </Link>
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
    </div>
  );
}
