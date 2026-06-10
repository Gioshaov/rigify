'use client'

import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "@/components/ui/UserMenu";

type BookingData = {
  id: string;
  appointment_datetime: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  price: number | null;
  services: {
    name: string;
    duration_minutes: number;
    price_min: number;
    price_max: number;
  };
  staff: {
    name: string;
  } | null;
  businesses: {
    name: string;
    slug: string;
    phone: string | null;
    address: string;
    city: string;
  };
};

export function BookingConfirmationClient({
  booking,
  canViewPII = false
}: {
  booking: BookingData
  canViewPII?: boolean
}) {
  const business = booking.businesses;
  const service = booking.services;
  const staff = booking.staff;

  // Format date
  const date = new Date(booking.appointment_datetime);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Generate confirmation ID from booking ID
  const confirmationId = `RG-${booking.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-background font-hanken text-on-surface antialiased overflow-x-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface border-b border-white/10">
        <div className="flex items-center gap-4">
          <span data-testid="language-toggle" className="material-symbols-outlined text-primary">language</span>
          <Link data-testid="logo-link" href="/">
            <span className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase">
              RIGIFY
            </span>
          </Link>
        </div>
        <div className="flex items-center">
          <UserMenu />
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
          <h1 data-testid="booking-confirmed-title" className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold md:text-[48px] md:leading-[1.1] text-primary mb-2">
            BOOKING CONFIRMED
          </h1>
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-text-secondary uppercase">
            Confirmation ID: #{confirmationId}
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
                  {service.name}
                </h2>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-sm">storefront</span>
                  <span data-testid="booking-confirmed-business-name" className="font-hanken text-[16px] leading-[1.5] font-normal">
                    {business.name}
                  </span>
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
                      {formattedDate}
                    </p>
                    <p className="text-text-secondary">
                      {dayOfWeek}, {time}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase block mb-2">
                  {staff ? 'Artisan' : 'Duration'}
                </span>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary mt-1">
                    {staff ? 'person' : 'schedule'}
                  </span>
                  <div>
                    <p className="text-primary font-hanken text-[18px] leading-[1.6] font-normal">
                      {staff ? staff.name : `${service.duration_minutes} min`}
                    </p>
                    {staff && (
                      <p className="text-text-secondary">Professional</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 border-l-2 border-primary">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase block mb-2">
                Location Details
              </span>
              <p className="text-text-secondary font-hanken text-[16px] leading-[1.5] font-normal">
                {business.address}, {business.city}
                {business.phone && (
                  <>
                    <br />
                    Contact: <a href={`tel:${business.phone}`} className="text-primary hover:underline">{business.phone}</a>
                  </>
                )}
              </p>
            </div>

            {canViewPII && (
              <div className="bg-surface-container-low p-6 border-l-2 border-primary/30">
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2">
                  Your Information
                </span>
                <p className="text-on-surface font-hanken text-[16px] leading-[1.5] font-normal">
                  {booking.customer_name}
                  <br />
                  {booking.customer_phone}
                  {booking.customer_email && (
                    <>
                      <br />
                      {booking.customer_email}
                    </>
                  )}
                </p>
              </div>
            )}
          </section>

          {/* Sidebar Actions & Integration */}
          <div className="md:col-span-5 flex flex-col gap-gutter">
            {/* Price Display */}
            <div className="bg-surface-container border border-white/5 hover:border-primary/30 transition-all p-8">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2">
                Total Price
              </span>
              <p className="font-hanken text-[48px] leading-[1.2] tracking-tighter font-bold text-primary">
                ₾{(booking.price ?? service.price_min ?? 0).toFixed(2)}
              </p>
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
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
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
        <Link
          data-testid="mobile-nav-my-bookings"
          href="/customer/dashboard"
          className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1"
        >
          <span className="material-symbols-outlined">event_available</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            My Bookings
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
