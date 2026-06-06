"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const mockBusinesses = [
  {
    id: 1,
    slug: "aurelia-studio",
    name: "AURELIA STUDIO",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
    icon: "content_cut",
    rating: 4.8,
    reviewCount: 120,
    location: "VAKE, TBILISI",
    tags: ["HAIR", "COLORING", "SPA"],
  },
  {
    id: 2,
    slug: "craft-and-co",
    name: "CRAFT & CO",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop",
    icon: "face",
    rating: 4.9,
    reviewCount: 84,
    location: "SABURTALO, TBILISI",
    tags: ["BARBER", "SHAVE"],
  },
  {
    id: 3,
    slug: "zenith-wellness",
    name: "ZENITH WELLNESS",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop",
    icon: "spa",
    rating: 4.7,
    reviewCount: 215,
    location: "OLD TBILISI, TBILISI",
    tags: ["MASSAGE", "FACIAL", "YOGA"],
  },
  {
    id: 4,
    slug: "gloss-and-grit",
    name: "GLOSS & GRIT",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop",
    icon: "brush",
    rating: 4.8,
    reviewCount: 56,
    location: "VAKE, TBILISI",
    tags: ["MANICURE", "PEDICURE"],
  },
  {
    id: 5,
    slug: "derma-elite",
    name: "DERMA ELITE",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop",
    icon: "health_and_safety",
    rating: 4.9,
    reviewCount: 142,
    location: "SABURTALO, TBILISI",
    tags: ["SKINCARE", "LASER"],
  },
  {
    id: 6,
    slug: "prana-house",
    name: "PRANA HOUSE",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
    icon: "self_improvement",
    rating: 5.0,
    reviewCount: 92,
    location: "OLD TBILISI, TBILISI",
    tags: ["YOGA", "MEDITATION"],
  },
];

export default function BrowseBusinessesPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 w-full z-50 flex items-center justify-between px-4 md:px-margin-desktop h-16 bg-surface border-b border-white/10">
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

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/businesses"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-primary border-b border-primary pt-1"
          >
            Browse
          </Link>
          <Link
            href="/customer/dashboard"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            My Bookings
          </Link>
          <Link
            href="/for-businesses"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            For Business
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden sharp-border">
              <Image
                src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="Profile"
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
      </nav>

      {/* Hero Section */}
      <header className="relative w-full h-[353px] md:h-[442px] overflow-hidden flex flex-col justify-center px-4 md:px-margin-desktop">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1613145997165-cc9d0c847c5f?w=1920&h=800&fit=crop"
            alt="Tbilisi Architecture"
            fill
            className="object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-container mx-auto w-full">
          <span className="font-mono text-[12px] leading-[1] tracking-[0.3em] font-medium text-primary uppercase mb-4 block">
            Curated Excellence
          </span>
          <h1 className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold md:text-[64px] text-primary uppercase max-w-2xl">
            Beauty & Wellness <br />
            in Tbilisi
          </h1>
        </div>
      </header>

      {/* Search & Filters */}
      <section className="relative z-20 -mt-12 px-4 md:px-margin-desktop">
        <div className="max-w-container mx-auto bg-surface-elevated sharp-border p-6 md:p-8 flex flex-col md:flex-row gap-4 items-end">
          {/* Search Box */}
          <div className="flex-1 w-full">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2 block">
              Find Artisan
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-12 py-3 text-on-surface placeholder:text-outline outline-none transition-all"
                placeholder="Salon, Barber, or Stylist..."
                type="text"
              />
            </div>
          </div>

          {/* District Dropdown */}
          <div className="w-full md:w-64">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2 block">
              District
            </label>
            <select className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer">
              <option>All Districts</option>
              <option>Saburtalo</option>
              <option>Vake</option>
              <option>Old Tbilisi</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-64">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2 block">
              Category
            </label>
            <select className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer">
              <option>All Categories</option>
              <option>Hair Styling</option>
              <option>Spa & Massage</option>
              <option>Nail Art</option>
              <option>Barbershop</option>
            </select>
          </div>

          {/* Search Button */}
          <button className="bg-primary text-on-secondary px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-colors h-[50px] w-full md:w-auto">
            Discover
          </button>
        </div>
      </section>

      {/* Business Grid */}
      <main className="max-w-container mx-auto px-4 md:px-margin-desktop py-16">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="h-1 w-12 bg-primary mt-2"></div>
          </div>
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-outline uppercase">
            {mockBusinesses.length} RESULTS FOUND
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockBusinesses.map((business) => (
            <article
              key={business.id}
              className="group bg-surface-container-low sharp-border hover:border-primary/40 transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={business.image}
                  alt={business.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 group-hover:grayscale-0 grayscale"
                />
                <div className="absolute -bottom-6 right-6 w-16 h-16 bg-surface-elevated sharp-border p-2 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    {business.icon}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/businesses/${business.slug}`}>
                    <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary uppercase group-hover:text-primary-fixed transition-colors">
                      {business.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 text-primary">
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium">
                      {business.rating}
                    </span>
                    <span className="text-outline text-[10px]">
                      ({business.reviewCount})
                    </span>
                  </div>
                </div>
                <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-outline uppercase mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    location_on
                  </span>
                  {business.location}
                </p>
                <div className="flex flex-wrap gap-2">
                  {business.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 border border-white/5 bg-white/5 font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-16 flex justify-center items-center gap-4">
          <button className="w-12 h-12 flex items-center justify-center sharp-border text-outline hover:text-primary transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex gap-2">
            <button className="w-12 h-12 flex items-center justify-center bg-primary text-on-secondary font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium">
              01
            </button>
            <button className="w-12 h-12 flex items-center justify-center sharp-border text-on-surface font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium hover:text-primary transition-colors">
              02
            </button>
            <button className="w-12 h-12 flex items-center justify-center sharp-border text-on-surface font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium hover:text-primary transition-colors">
              03
            </button>
          </div>
          <button className="w-12 h-12 flex items-center justify-center sharp-border text-outline hover:text-primary transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Home
          </span>
        </Link>
        <Link
          href="/businesses"
          className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1 scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Browse
          </span>
        </Link>
        <Link
          href="/customer/dashboard"
          className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">event_available</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            My Bookings
          </span>
        </Link>
        <Link
          href="/for-businesses"
          className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            For Business
          </span>
        </Link>
      </nav>

      {/* Spacer for mobile nav */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}
