"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { GetDirectionsButton } from "@/components/booking/GetDirectionsButton";
import { formatTbilisi } from "@/lib/utils/datetime";
import { getConfirmationId } from "@/lib/bookings/confirmation-id";
import type { BookingConfirmationData } from "@/lib/bookings/types";

// Lazy, client-only (Mapbox GL accesses window and the bundle is large).
const BusinessLocationMap = dynamic(
  () =>
    import("@/app/businesses/[slug]/BusinessLocationMap").then((mod) => ({
      default: mod.BusinessLocationMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-56 rounded-[4px] border border-white/10 bg-surface-container-low animate-pulse" />
    ),
  }
);

interface BookingConfirmationProps {
  booking: BookingConfirmationData;
  /**
   * When provided (modal context), the secondary action is a "Done" button that
   * calls this instead of the "Back to Home" link used on the standalone page.
   */
  onDone?: () => void;
  /** Tightens spacing so the confirmation fits inside the modal without scrolling. */
  compact?: boolean;
  /**
   * Whether to offer the "View My Bookings" link. Only true for an authenticated
   * customer — `/customer/dashboard` is middleware-protected, so showing it to a
   * guest would just bounce them to /login. Guests get a "Browse Salons" link.
   */
  showMyBookings?: boolean;
}

/**
 * The single source of truth for the booking-confirmation UI. Rendered by both
 * the standalone Booking Confirmed page and the booking modal.
 */
export function BookingConfirmation({ booking, onDone, compact = false, showMyBookings = false }: BookingConfirmationProps) {
  const business = booking.businesses;
  const service = booking.services;
  const staff = booking.staff;

  const formattedDate = formatTbilisi(booking.appointment_datetime, "MMM d, yyyy");
  const dayOfWeek = formatTbilisi(booking.appointment_datetime, "EEEE");
  const time = formatTbilisi(booking.appointment_datetime, "h:mm a");

  const confirmationId = getConfirmationId(booking.id);
  const hasCoordinates = business.latitude != null && business.longitude != null;
  const actionBtnClass = `w-full ${compact ? "h-14" : "h-16"} font-mono text-[12px] tracking-[0.15em] uppercase transition-colors active:scale-95 flex items-center justify-center`;

  return (
    <div>
      {/* Success Header */}
      <div className={`flex flex-col items-center text-center ${compact ? "mb-6" : "mb-16"}`}>
        <h1
          data-testid="booking-confirmed-title"
          tabIndex={-1}
          className={`font-hanken ${compact ? "text-[28px] md:text-[34px]" : "text-[36px] md:text-[48px]"} leading-[1.2] md:leading-[1.1] tracking-tight font-bold text-primary mb-2 uppercase outline-none`}
        >
          Booking Confirmed
        </h1>
        <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-text-secondary uppercase">
          Confirmation ID: #{confirmationId}
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-12 ${compact ? "gap-4" : "gap-gutter"}`}>
        {/* Summary Card */}
        <section
          data-testid="booking-summary"
          className={`md:col-span-7 bg-surface-container border border-white/5 hover:border-primary/30 transition-colors ${compact ? "p-6 gap-6" : "p-8 gap-8"} flex flex-col`}
        >
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
                <span data-testid="business-name" className="font-hanken text-[16px] leading-[1.5]">
                  {business.name}
                </span>
              </div>
            </div>
          </div>

          {/* Date, Time, Staff Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-y-8 border-t border-white/5 ${compact ? "pt-6" : "pt-8"}`}>
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

        {/* Sidebar: Location & Actions */}
        <div className={`md:col-span-5 flex flex-col ${compact ? "gap-4" : "gap-gutter"}`}>
          {/* Location Map */}
          <section className={`bg-surface-container border border-white/5 ${compact ? "p-6" : "p-8"}`}>
            <h3 className={`font-mono text-[12px] leading-[1] tracking-[0.15em] text-primary uppercase ${compact ? "mb-4" : "mb-6"}`}>
              Getting There
            </h3>

            {hasCoordinates ? (
              <BusinessLocationMap
                name={business.name}
                latitude={business.latitude as number}
                longitude={business.longitude as number}
                address={business.address}
                testId="confirmation-map"
                className={`w-full ${compact ? "h-40" : "h-56"} rounded-[4px] border border-white/10 bg-surface-container-low`}
              />
            ) : (
              <div
                data-testid="confirmation-map"
                className={`w-full ${compact ? "h-40" : "h-56"} rounded-[4px] border border-white/10 bg-surface-container-low flex items-center justify-center`}
              >
                <p className="font-mono text-[12px] tracking-[0.15em] uppercase text-text-secondary">
                  Map location unavailable
                </p>
              </div>
            )}

            <div data-testid="confirmation-location-description" className="mt-6">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-text-secondary uppercase block mb-2">
                Address
              </span>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary mt-1">location_on</span>
                <div>
                  <p className="text-on-surface font-hanken text-[16px] leading-[1.5]">{business.address}</p>
                  <p className="text-text-secondary font-hanken text-[14px]">{business.city}</p>
                  {business.phone && (
                    <p className="text-text-secondary font-hanken text-[14px] mt-2">{business.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {hasCoordinates && (
              <GetDirectionsButton
                latitude={business.latitude as number}
                longitude={business.longitude as number}
              />
            )}
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            {showMyBookings ? (
              <Link
                data-testid="confirmation-view-bookings-link"
                href="/customer/dashboard"
                className={`${actionBtnClass} bg-primary text-on-primary font-bold hover:bg-primary-fixed`}
              >
                View My Bookings
              </Link>
            ) : (
              <Link
                data-testid="confirmation-browse-link"
                href="/businesses"
                className={`${actionBtnClass} bg-primary text-on-primary font-bold hover:bg-primary-fixed`}
              >
                Browse Salons
              </Link>
            )}
            {onDone ? (
              <button
                type="button"
                data-testid="confirmation-done-btn"
                onClick={onDone}
                className={`${actionBtnClass} border border-primary text-primary hover:bg-primary/5`}
              >
                Done
              </button>
            ) : (
              <Link
                data-testid="confirmation-back-home-link"
                href="/"
                className={`${actionBtnClass} border border-primary text-primary hover:bg-primary/5`}
              >
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
