"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";

// Mock data - will be replaced with real database queries
const mockBusiness = {
  name: "STERN Barber Shop",
  slug: "stern-barber-shop",
  rating: 5.0,
  location: "Tbilisi, Georgia — Premium Grooming Artistry",
  address: "12 Rustaveli Avenue, Center\nTbilisi, Georgia",
  coverImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&h=800&fit=crop",
  logo: "S",
  about: "STERN is an architectural approach to masculine aesthetics. Located in the heart of the city, we combine traditional European barbering heritage with modern geometric precision. Our artisans specialize in custom-tailored silhouettes that respect individual facial structures and personal identity.",
  services: [
    {
      id: 1,
      name: "Classic Cut",
      description: "45m — Precision Scissors & Clipper Work",
      price: "50 GEL",
    },
    {
      id: 2,
      name: "The Royal Shave",
      description: "60m — Hot Towel, Straight Razor, Essential Oils",
      price: "75 GEL",
    },
    {
      id: 3,
      name: "Beard Sculpture",
      description: "30m — Freehand Shaping & Lineup",
      price: "40 GEL",
    },
  ],
  portfolio: [
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop",
  ],
  staff: [
    {
      id: 1,
      name: "David Stern",
      title: "Master Barber / Founder",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    },
    {
      id: 2,
      name: "Levan G.",
      title: "Senior Stylist",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    },
  ],
  hours: {
    weekday: "10:00 - 21:00",
    weekend: "11:00 - 19:00",
  },
  review: {
    text: "The level of attention to detail is unmatched in this city. It's not just a haircut, it's a structural transformation.",
    author: "Alexander M.",
  },
};

export default function BusinessProfilePage({ params }: { params: { slug: string } }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // In production, fetch business by slug from database
  // const business = await fetchBusinessBySlug(params.slug);
  // if (!business) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-50 flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 bg-surface border-b border-white/10">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer">
            language
          </span>
          <Link href="/">
            <span className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase">
              RIGIFY
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-primary hover:text-primary transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/businesses"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            Browse
          </Link>
          <Link
            href="/customer/dashboard"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            My Bookings
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="w-10 h-10 bg-surface-variant flex items-center justify-center border border-white/10 overflow-hidden">
              <Image
                src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="User"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <Link
              href="/login"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main className="pb-24">
        {/* Hero Section */}
        <section className="relative h-[353px] md:h-[530px] w-full overflow-hidden">
          <Image
            src={mockBusiness.coverImage}
            alt={mockBusiness.name}
            fill
            className="object-cover grayscale brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full px-margin-mobile md:px-margin-desktop pb-base md:pb-gutter flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-surface-elevated border border-white/10 p-2 relative z-10 flex items-center justify-center">
                <span className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-primary select-none">
                  {mockBusiness.logo}
                </span>
              </div>
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="material-symbols-outlined text-primary text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary">
                    {mockBusiness.rating} RATING
                  </span>
                </div>
                <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold md:text-[48px] md:leading-[1.1] uppercase text-white">
                  {mockBusiness.name}
                </h1>
                <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase mt-1">
                  {mockBusiness.location}
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <Link href={`/businesses/${mockBusiness.slug}/book`}>
                <button className="bg-primary text-on-primary px-10 py-5 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:brightness-110 active:scale-95 transition-all">
                  Book Appointment
                </button>
              </Link>
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
                {mockBusiness.about}
              </p>
            </section>

            {/* Services */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-6 bg-primary"></div>
                  <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold uppercase tracking-tight">
                    Services
                  </h2>
                </div>
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant">
                  CURATED SELECTION
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {mockBusiness.services.map((service) => (
                  <div
                    key={service.id}
                    className="group flex items-center justify-between p-6 bg-surface-container border border-white/5 hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div>
                      <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase mt-1">
                        {service.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary">
                        {service.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Gallery */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-primary"></div>
                <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold uppercase tracking-tight">
                  Portfolio
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {mockBusiness.portfolio.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-surface-variant border border-white/10 overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="md:col-span-4 space-y-12">
            {/* Staff Section */}
            <div className="p-8 bg-surface-container-high border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-6 bg-primary"></div>
                <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold uppercase tracking-tight">
                  Artisans
                </h2>
              </div>
              <div className="space-y-6">
                {mockBusiness.staff.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-16 h-16 border border-white/10 grayscale group-hover:grayscale-0 transition-all overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-hanken text-[18px] leading-[1.3] font-semibold text-white group-hover:text-primary transition-colors">
                        {member.name}
                      </p>
                      <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                        {member.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location / Info */}
            <div className="p-8 bg-surface-container border border-white/5">
              <div className="space-y-6">
                <div>
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-2">
                    Location
                  </p>
                  <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface whitespace-pre-line">
                    {mockBusiness.address}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-2">
                    Opening Hours
                  </p>
                  <div className="grid grid-cols-2 gap-y-1 font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface-variant">
                    <span>Mon - Fri</span>
                    <span className="text-right">{mockBusiness.hours.weekday}</span>
                    <span>Sat - Sun</span>
                    <span className="text-right">{mockBusiness.hours.weekend}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Preview */}
            <div className="p-8 border-l border-primary/20 space-y-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">format_quote</span>
                <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary uppercase">
                  Client Voice
                </h3>
              </div>
              <p className="italic font-hanken text-[16px] leading-[1.5] font-normal text-on-surface-variant">
                &ldquo;{mockBusiness.review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-variant border border-white/10"></div>
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase">
                  {mockBusiness.review.author}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile CTA (Sticky) */}
      <div className="md:hidden fixed bottom-20 left-0 w-full p-4 bg-gradient-to-t from-background to-transparent z-40">
        <Link href={`/businesses/${mockBusiness.slug}/book`}>
          <button className="w-full bg-primary text-on-primary py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold active:scale-95 transition-all">
            Book Appointment
          </button>
        </Link>
      </div>

      {/* Mobile Bottom Navigation */}
      <footer className="fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10 md:hidden">
        <Link href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary transition-all">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Home
          </span>
        </Link>
        <Link href="/businesses" className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1">
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Browse
          </span>
        </Link>
        <Link href="/customer/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary transition-all">
          <span className="material-symbols-outlined">event_available</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Bookings
          </span>
        </Link>
        <Link href="/for-businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary transition-all">
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Business
          </span>
        </Link>
      </footer>
    </div>
  );
}
