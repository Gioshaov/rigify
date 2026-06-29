"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Mock confirmation data - will be replaced with real booking data
const mockBooking = {
  confirmationId: "RG-99421-B",
  service: "Classic Cut & Steam",
  business: "STERN Barber Shop",
  businessImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=300&fit=crop",
  date: "Oct 12, 2024",
  dayOfWeek: "Saturday",
  time: "10:15 AM",
  artisan: "Julian Vance",
  artisanTitle: "Master Barber",
  address: "12 Rustaveli Avenue",
  notes: "Please arrive 5-10 minutes early. We are located at 12 Rustaveli Avenue. Feel free to use our private lounge upon arrival.",
  mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=400&fit=crop",
};

export default function BookingConfirmedPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-dvh bg-background font-hanken text-on-surface antialiased overflow-x-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-nav flex items-center justify-between px-margin-mobile h-16 bg-surface border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link data-testid="nav-logo" href="/">
            <span className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase">
              RIGIFY
            </span>
          </Link>
        </div>
        <div className="flex items-center">
          {user && (
            <div data-testid="user-avatar" className="w-8 h-8 bg-surface-container-highest border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[16px]">person</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-12 pb-32">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="mb-6 flex items-center justify-center w-20 h-20 border border-primary/20 bg-primary/5">
            <span
              className="material-symbols-outlined text-5xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold md:text-[48px] md:leading-[1.1] text-primary mb-2">
            BOOKING CONFIRMED
          </h1>
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-text-secondary uppercase">
            Confirmation ID: #{mockBooking.confirmationId}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Summary Card */}
          <section data-testid="booking-summary" className="md:col-span-7 bg-surface-container border border-white/5 hover:border-primary/30 transition-all p-8 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-2">
                  Service Details
                </span>
                <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-1">
                  {mockBooking.service}
                </h2>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-sm">storefront</span>
                  <span className="font-hanken text-[16px] leading-[1.5] font-normal">
                    {mockBooking.business}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-24 h-32 border border-white/10 overflow-hidden">
                  <Image
                    src={mockBooking.businessImage}
                    alt={mockBooking.business}
                    width={96}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-8 border-t border-white/5 pt-8">
              <div>
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase block mb-2">
                  Date & Time
                </span>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary mt-1">
                    calendar_today
                  </span>
                  <div>
                    <p className="text-primary font-hanken text-[18px] leading-[1.6] font-normal">
                      {mockBooking.date}
                    </p>
                    <p className="text-text-secondary">
                      {mockBooking.dayOfWeek}, {mockBooking.time}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase block mb-2">
                  Artisan
                </span>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary mt-1">person</span>
                  <div>
                    <p className="text-primary font-hanken text-[18px] leading-[1.6] font-normal">
                      {mockBooking.artisan}
                    </p>
                    <p className="text-text-secondary">{mockBooking.artisanTitle}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 border-l-2 border-primary">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase block mb-2">
                Preparation Notes
              </span>
              <p className="text-text-secondary font-hanken text-[16px] leading-[1.5] font-normal">
                {mockBooking.notes}
              </p>
            </div>
          </section>

          {/* Sidebar Actions & Integration */}
          <div className="md:col-span-5 flex flex-col gap-gutter">
            {/* Map Integration */}
            <div className="bg-surface-container border border-white/5 hover:border-primary/30 transition-all h-48 relative overflow-hidden group">
              <Image
                src={mockBooking.mapImage}
                alt="Location Map"
                fill
                className="object-cover opacity-50 group-hover:opacity-60 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-6 h-6 bg-primary rotate-45 flex items-center justify-center border-2 border-background">
                  <span
                    className="material-symbols-outlined text-background text-xs -rotate-45"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    location_on
                  </span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-background/90 px-3 py-1 text-[10px] text-primary uppercase tracking-tighter font-mono font-medium">
                {mockBooking.address}
              </div>
            </div>

            {/* Calendar Integration */}
            <section className="bg-surface-container border border-white/5 hover:border-primary/30 transition-all p-8">
              <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary uppercase mb-6">
                Calendar Integration
              </h3>
              <div className="flex flex-col gap-3">
                <button data-testid="add-to-google-calendar-btn" className="w-full py-4 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95 group">
                  <span className="material-symbols-outlined text-primary">
                    calendar_add_on
                  </span>
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-text-primary group-hover:text-primary transition-colors">
                    Add to Google Calendar
                  </span>
                </button>
                <button data-testid="add-to-apple-calendar-btn" className="w-full py-4 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95 group">
                  <span className="material-symbols-outlined text-primary">event</span>
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-text-primary group-hover:text-primary transition-colors">
                    Add to Apple Calendar
                  </span>
                </button>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <Link href="/customer/dashboard">
                <button data-testid="view-my-bookings-btn" className="w-full h-16 bg-primary text-background font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-colors active:scale-95">
                  View My Bookings
                </button>
              </Link>
              <Link href="/">
                <button data-testid="back-to-home-btn" className="w-full h-16 border border-primary text-primary font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase hover:bg-primary/5 transition-colors active:scale-95">
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-nav flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
        <Link data-testid="mobile-nav-home" href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Home
          </span>
        </Link>
        <Link data-testid="mobile-nav-browse" href="/businesses?reset=1" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Browse
          </span>
        </Link>
        <Link data-testid="mobile-nav-business" href="/for-businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            For Business
          </span>
        </Link>
      </nav>
    </div>
  );
}
