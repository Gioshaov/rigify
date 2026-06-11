'use client'

import Link from "next/link";
import { UserMenu } from "@/components/ui/UserMenu";
import { formatTbilisi } from "@/lib/utils/datetime";

type BookingData = {
  id: string;
  appointment_datetime: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string | null;
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

  // Format date with Tbilisi timezone
  const formattedDate = formatTbilisi(booking.appointment_datetime, "MMM d, yyyy");
  const dayOfWeek = formatTbilisi(booking.appointment_datetime, "EEEE");
  const time = formatTbilisi(booking.appointment_datetime, "h:mm a");

  // Generate confirmation ID from booking ID
  const confirmationId = `RG-${booking.id.slice(0, 8).toUpperCase()}`;

  // Calendar export functions
  const addToGoogleCalendar = () => {
    const startDate = new Date(booking.appointment_datetime);
    const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000);

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${service.name} at ${business.name}`,
      dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      details: `Service: ${service.name}${staff ? `\nStaff: ${staff.name}` : ''}\nBusiness: ${business.name}\nAddress: ${business.address}, ${business.city}`,
      location: `${business.address}, ${business.city}`,
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  const addToAppleCalendar = () => {
    const startDate = new Date(booking.appointment_datetime);
    const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${service.name} at ${business.name}`,
      `DESCRIPTION:Service: ${service.name}${staff ? `\\nStaff: ${staff.name}` : ''}\\nBusiness: ${business.name}`,
      `LOCATION:${business.address}, ${business.city}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rigify-booking-${booking.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background font-hanken text-on-surface antialiased overflow-x-hidden">
      {/* Stitch Design: booking_confirmed_rigify */}

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

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 pb-32">
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
          <h1 data-testid="booking-confirmed-title" className="font-hanken text-[36px] leading-[1.2] tracking-tight md:text-[48px] md:leading-[1.1] font-bold text-primary mb-2 uppercase">
            Booking Confirmed
          </h1>
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-text-secondary uppercase">
            Confirmation ID: #{confirmationId}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Summary Card */}
          <section data-testid="booking-summary" className="md:col-span-7 bg-surface-container border border-white/5 hover:border-primary/30 transition-colors p-8 flex flex-col gap-8">
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
                  <span data-testid="business-name" className="font-hanken text-[16px] leading-[1.5]">{business.name}</span>
                </div>
              </div>
            </div>

            {/* Date, Time, Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 border-t border-white/5 pt-8">
              {/* Date & Time */}
              <div>
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-text-secondary uppercase block mb-2">
                  Date & Time
                </span>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary mt-1">calendar_today</span>
                  <div>
                    <p className="text-primary font-hanken text-[18px] leading-[1.6] font-normal">{formattedDate}</p>
                    <p className="text-text-secondary font-hanken text-[14px]">{dayOfWeek}, {time}</p>
                  </div>
                </div>
              </div>

              {/* Artisan */}
              {staff && (
                <div>
                  <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-text-secondary uppercase block mb-2">
                    Artisan
                  </span>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary mt-1">person</span>
                    <div>
                      <p className="text-primary font-hanken text-[18px] leading-[1.6] font-normal">{staff.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preparation Notes */}
            <div className="bg-surface-container-low p-6 border-l-2 border-primary">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-primary uppercase block mb-2">
                Preparation Notes
              </span>
              <p className="text-text-secondary font-hanken text-[16px] leading-[1.5]">
                Please arrive 5-10 minutes early. {business.address && `We are located at ${business.address}.`} Feel free to contact us if you have any questions.
              </p>
            </div>
          </section>

          {/* Sidebar Actions & Integration */}
          <div className="md:col-span-5 flex flex-col gap-gutter">
            {/* Location */}
            <div className="bg-surface-container border border-white/5 p-6">
              <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] text-primary uppercase block mb-3">
                Location
              </span>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary mt-1">location_on</span>
                <div>
                  <p className="text-on-surface font-hanken text-[16px] leading-[1.5]">
                    {business.address}
                  </p>
                  <p className="text-text-secondary font-hanken text-[14px]">{business.city}</p>
                  {business.phone && (
                    <p className="text-text-secondary font-hanken text-[14px] mt-2">
                      {business.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Calendar Integration */}
            <section className="bg-surface-container border border-white/5 p-8">
              <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] text-primary uppercase mb-6">
                Calendar Integration
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={addToGoogleCalendar}
                  className="w-full py-4 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-primary">calendar_add_on</span>
                  <span className="font-mono text-[12px] tracking-[0.15em] uppercase text-on-surface group-hover:text-primary transition-colors">
                    Add to Google Calendar
                  </span>
                </button>
                <button
                  onClick={addToAppleCalendar}
                  className="w-full py-4 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-primary">event</span>
                  <span className="font-mono text-[12px] tracking-[0.15em] uppercase text-on-surface group-hover:text-primary transition-colors">
                    Add to Apple Calendar
                  </span>
                </button>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <Link
                href="/customer/dashboard"
                className="w-full h-16 bg-primary text-on-primary font-mono text-[12px] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-colors active:scale-95 flex items-center justify-center"
              >
                View My Bookings
              </Link>
              <Link
                href="/"
                className="w-full h-16 border border-primary text-primary font-mono text-[12px] tracking-[0.15em] uppercase hover:bg-primary/5 transition-colors active:scale-95 flex items-center justify-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
        <Link href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase mt-1">Home</span>
        </Link>
        <Link href="/businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase mt-1">Browse</span>
        </Link>
        <Link href="/customer/dashboard" className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1">
          <span className="material-symbols-outlined">event_available</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase mt-1">My Bookings</span>
        </Link>
      </nav>
    </div>
  );
}
