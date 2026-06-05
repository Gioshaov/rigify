'use client'

import Link from "next/link";
import { useTranslations } from "@/lib/hooks/useTranslations";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

type BookingData = {
  appointment_datetime: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  price: number | null;
  services: {
    name: string;
    duration_minutes: number;
    price: number;
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
  const { tr, lang } = useTranslations();

  // Format date with translated weekday and month
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const weekdayIndex = date.getDay();
    const monthIndex = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();

    const weekdayNames = [
      tr.booking.weekdays.sunday,
      tr.booking.weekdays.monday,
      tr.booking.weekdays.tuesday,
      tr.booking.weekdays.wednesday,
      tr.booking.weekdays.thursday,
      tr.booking.weekdays.friday,
      tr.booking.weekdays.saturday,
    ];

    const monthNames = [
      tr.booking.months.january,
      tr.booking.months.february,
      tr.booking.months.march,
      tr.booking.months.april,
      tr.booking.months.may,
      tr.booking.months.june,
      tr.booking.months.july,
      tr.booking.months.august,
      tr.booking.months.september,
      tr.booking.months.october,
      tr.booking.months.november,
      tr.booking.months.december,
    ];

    const weekday = weekdayNames[weekdayIndex][lang];
    const month = monthNames[monthIndex][lang];

    return `${weekday}, ${month} ${day}, ${year}`;
  }

  const business = booking.businesses;
  const service = booking.services;
  const staff = booking.staff;

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
          <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
            RIGIFY
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-margin-mobile md:px-margin-desktop py-section-gap">
        {/* Success Message */}
        <div className="border border-primary bg-surface p-gutter mb-gutter text-center">
          <div className="text-6xl mb-stack-md">✓</div>
          <h1 className="text-display-md mb-stack-sm">{tr.bookingConfirmed.confirmed[lang]}</h1>
          <p className="text-body-lg text-on-surface-variant">
            {tr.bookingConfirmed.successMessage[lang]}
          </p>
        </div>

        {/* Booking Details */}
        <div className="border border-outline-variant bg-surface">
          <div className="px-gutter py-stack-lg border-b border-outline-variant">
            <h2 className="text-headline-lg">{tr.bookingConfirmed.bookingDetails[lang]}</h2>
          </div>

          <div className="px-gutter py-stack-lg space-y-stack-md">
            <div>
              <p className="label-mono text-on-surface-variant mb-stack-xs">{tr.bookingConfirmed.business[lang]}</p>
              <p className="text-headline-sm">{business.name}</p>
            </div>

            <div>
              <p className="label-mono text-on-surface-variant mb-stack-xs">{tr.bookingConfirmed.service[lang]}</p>
              <p className="text-headline-sm">{service.name}</p>
            </div>

            {staff && (
              <div>
                <p className="label-mono text-on-surface-variant mb-stack-xs">{tr.bookingConfirmed.staffMember[lang]}</p>
                <p className="text-headline-sm">{staff.name}</p>
              </div>
            )}

            <div>
              <p className="label-mono text-on-surface-variant mb-stack-xs">{tr.bookingConfirmed.dateAndTime[lang]}</p>
              <p className="text-headline-sm">
                {formatDate(booking.appointment_datetime)}
              </p>
              <p className="text-body-lg text-on-surface-variant">
                {new Date(booking.appointment_datetime).toLocaleTimeString(lang === 'ka' ? 'ka-GE' : 'en-US', { hour: '2-digit', minute: '2-digit' })} ({service.duration_minutes} {tr.bookingConfirmed.minutes[lang]})
              </p>
            </div>

            <div>
              <p className="label-mono text-on-surface-variant mb-stack-xs">{tr.bookingConfirmed.customer[lang]}</p>
              {canViewPII ? (
                <>
                  <p className="text-headline-sm">{booking.customer_name}</p>
                  <p className="text-body-md text-on-surface-variant">{booking.customer_phone}</p>
                  {booking.customer_email && (
                    <p className="text-body-md text-on-surface-variant">{booking.customer_email}</p>
                  )}
                </>
              ) : (
                <p className="text-body-md text-on-surface-variant">Private booking</p>
              )}
            </div>

            <div>
              <p className="label-mono text-on-surface-variant mb-stack-xs">{tr.bookingConfirmed.location[lang]}</p>
              <p className="text-body-md">{business.address}</p>
              <p className="text-body-md text-on-surface-variant">{business.city}</p>
              {business.phone && (
                <p className="text-body-md text-primary mt-stack-xs">
                  <a href={`tel:${business.phone}`}>{business.phone}</a>
                </p>
              )}
            </div>

            <div>
              <p className="label-mono text-on-surface-variant mb-stack-xs">{tr.bookingConfirmed.price[lang]}</p>
              <p className="text-headline-lg">₾{booking.price || service.price}</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="border border-outline-variant bg-surface p-gutter mt-gutter">
          <p className="label-mono mb-stack-md">{tr.bookingConfirmed.whatsNext[lang]}</p>
          <ul className="space-y-stack-sm text-body-md text-on-surface-variant list-disc list-inside">
            <li>{tr.bookingConfirmed.confirmationSMS[lang]}</li>
            <li>{tr.bookingConfirmed.arriveearly[lang]}</li>
            <li>{tr.bookingConfirmed.cancelReschedule[lang]}</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-gutter flex flex-col sm:flex-row gap-stack-md">
          <Link href={`/businesses/${business.slug}`} className="btn-secondary flex-1">
            {tr.bookingConfirmed.backTo[lang]} {business.name}
          </Link>
          <Link href="/businesses" className="btn-primary flex-1">
            {tr.bookingConfirmed.browseMore[lang]}
          </Link>
        </div>
      </div>
    </main>
  );
}
