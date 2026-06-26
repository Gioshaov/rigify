"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatTbilisi } from "@/lib/utils/datetime";
import { cancelBookingAction } from "./actions";
import { LeaveReviewModal } from "./LeaveReviewModal";
import { openDirections } from "@/lib/utils/directions";
import { getBusinessFallbackImage } from "@/lib/utils/fallback-images";
import { Portal } from "@/components/ui/Portal";

type BookingCardProps = {
  booking: {
    id: string;
    appointment_datetime: string;
    status: string;
    business_id: string;
    service_id: string;
    staff_id: string | null;
    businesses: {
      name: string;
      address: string;
      latitude: number | null;
      longitude: number | null;
      cover_image_url: string | null;
      business_categories?: Array<{ category_id: string }>;
    };
    services: { name: string };
    staff: { name: string; avatar_url?: string | null } | null;
    hasReview?: boolean;
  };
  hasUsedEmergencyCancel: boolean;
  isPast?: boolean;
};

export function BookingCard({ booking, hasUsedEmergencyCancel, isPast = false }: BookingCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOptimisticallyCancelled, setIsOptimisticallyCancelled] = useState(false);
  const [hasReviewSubmitted, setHasReviewSubmitted] = useState(false);

  const cancelModalRef = useRef<HTMLDivElement>(null);
  const keepBookingBtnRef = useRef<HTMLButtonElement>(null);

  // Calculate hours until appointment for 24h cancellation policy with emergency exception
  // Note: Supabase returns timestamptz as ISO 8601 strings with UTC offset (e.g., "2026-06-20T14:00:00+00:00")
  // new Date() correctly parses these as UTC timestamps
  const appointmentDate = new Date(booking.appointment_datetime);
  const now = new Date();
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isWithin24Hours = hoursUntilAppointment < 24;

  // Can cancel if: (1) >= 24h away, OR (2) <24h but emergency cancel not used yet
  const canCancel = !isWithin24Hours || !hasUsedEmergencyCancel;
  const isEmergencyCancel = isWithin24Hours && !hasUsedEmergencyCancel;

  // Location coordinates (the reused Get directions button requires lat/lng)
  const latitude = booking.businesses?.latitude ?? null;
  const longitude = booking.businesses?.longitude ?? null;
  const hasCoords = latitude != null && longitude != null;

  // Focus trap for cancel modal
  useEffect(() => {
    if (!showCancelModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) setShowCancelModal(false);
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !cancelModalRef.current) return;

      const focusableElements = cancelModalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    // Focus first button on mount
    setTimeout(() => keepBookingBtnRef.current?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [showCancelModal, loading]);


  const handleCancel = async () => {
    // Re-check 24h policy at action time (not just page load) to prevent stale checks
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isCurrentlyWithin24Hours = hoursUntilAppointment < 24;

    if (isCurrentlyWithin24Hours && hasUsedEmergencyCancel) {
      setError("Cannot cancel within 24 hours of appointment. You have already used your one-time emergency cancellation. Please contact the business directly if you need to cancel.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await cancelBookingAction(booking.id);

    if (result.success) {
      // Optimistically hide the booking immediately
      setLoading(false);
      setIsOptimisticallyCancelled(true);
      setShowCancelModal(false);
      // revalidatePath in server action will update data in background
    } else {
      setError(result.error || "Failed to cancel booking");
      setLoading(false);
    }
  };

  // Hide booking if optimistically cancelled
  if (isOptimisticallyCancelled) {
    return null;
  }

  return (
    <>
      {/* Stitch Design: Booking card */}
      {/* Stitch Design: stitch_my_bookings — horizontal card (thumbnail | content | staff) */}
      <article
        data-testid={isPast ? `past-booking-card-${booking.id}` : `booking-card-${booking.id}`}
        className={`group relative flex flex-col md:flex-row ${
          isPast
            ? "bg-surface-container-low border border-white/5"
            : "bg-surface-container border border-white/10 hover:bg-surface-container-high transition-all"
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* LEFT: business cover thumbnail (greyscale → colour + subtle zoom on hover) */}
        <div className="relative w-full aspect-[4/3] md:w-56 md:aspect-auto md:self-stretch shrink-0 overflow-hidden border-b border-white/10 md:border-b-0 md:border-r">
          <Image
            src={getBusinessFallbackImage(booking.businesses?.cover_image_url ?? null, booking.businesses?.business_categories)}
            alt={booking.businesses?.name || "Business"}
            fill
            sizes="(max-width: 768px) 100vw, 224px"
            className="object-cover object-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-[filter,transform] duration-700"
          />
        </div>

        {/* BODY */}
        <div className="relative flex-1 p-6">
          {/* Status badge — top-right */}
          <span
            className={`absolute top-6 right-6 px-3 py-1 ${
              isPast
                ? "border border-white/5 text-on-surface-variant"
                : "bg-primary/10 border border-primary/20 text-primary"
            } font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase`}
          >
            {booking.status}
          </span>

          <div className="flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
            {/* CENTER: details + actions */}
            <div className="flex-1 min-w-0">
              <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold mb-1 uppercase pr-24">
                {booking.businesses?.name || "Business"}
              </h3>
              <h4 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white">
                {booking.services?.name || "Service"}
              </h4>

              {/* Date & Time, Location */}
              <div className="mt-6 space-y-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-muted-gold text-xl mt-0.5">calendar_today</span>
                  <div>
                    <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase text-on-surface-variant">
                      Date & Time
                    </p>
                    <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface">
                      {formatTbilisi(booking.appointment_datetime, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                {/* Location — tappable address opens maps on Upcoming (coords present); plain text otherwise */}
                <div data-testid="booking-location" className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-muted-gold text-xl mt-0.5">location_on</span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase text-on-surface-variant">
                      Location
                    </p>
                    {!isPast && hasCoords ? (
                      <button
                        type="button"
                        data-testid="booking-directions-link"
                        onClick={() => openDirections(latitude as number, longitude as number)}
                        aria-label={`Open directions to ${booking.businesses?.address || "this location"}`}
                        className="text-left font-hanken text-[16px] leading-[1.5] font-normal text-on-surface hover:text-primary hover:underline cursor-pointer transition-colors"
                      >
                        {booking.businesses?.address || "Address unavailable"}
                      </button>
                    ) : (
                      <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface">
                        {booking.businesses?.address || "Address unavailable"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!isPast && booking.status === "confirmed" && (
                <div className="mt-8 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <Link
                      data-testid={`manage-btn-${booking.id}`}
                      href={`/customer/bookings/${booking.id}`}
                      className="bg-primary text-on-primary px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase hover:brightness-110 transition-all inline-block text-center"
                    >
                      View
                    </Link>
                    <button
                      data-testid={`cancel-btn-${booking.id}`}
                      onClick={() => {
                        setError(null);
                        setShowCancelModal(true);
                      }}
                      disabled={!canCancel}
                      title={
                        !canCancel
                          ? "You have already used your one-time emergency cancellation. Please contact the business directly."
                          : isEmergencyCancel
                          ? "Emergency cancellation available - this is your one-time exception"
                          : ""
                      }
                      className={`border px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase transition-all ${
                        canCancel
                          ? isEmergencyCancel
                            ? "border-primary/30 text-primary hover:border-primary hover:text-primary cursor-pointer"
                            : "border-white/20 text-on-surface hover:border-error hover:text-error cursor-pointer"
                          : "border-white/5 text-on-surface-variant opacity-50 cursor-not-allowed"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                  {isWithin24Hours && (
                    <p
                      className="font-mono text-[10px] leading-[1.5] tracking-[0.1em] text-on-surface-variant"
                      role="status"
                      aria-live="polite"
                    >
                      {isEmergencyCancel ? (
                        <span className="text-primary">
                          ⚠️ Emergency cancellation available. This is your one-time exception to the 24-hour policy. After using it, you won&apos;t be able to cancel within 24 hours again.
                        </span>
                      ) : (
                        "Cancellation requires 24-hour notice. You have already used your one-time emergency cancellation. Please contact the business directly if you need to cancel."
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Leave Review Button */}
              {isPast && booking.status === "completed" && !booking.hasReview && !hasReviewSubmitted && (
                <div className="mt-8">
                  <button
                    data-testid={`leave-review-btn-${booking.id}`}
                    onClick={() => setShowReviewModal(true)}
                    className="bg-primary text-on-primary px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase hover:brightness-110 transition-all"
                  >
                    Leave Review
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Staff Member — label + name + circular avatar */}
            {booking.staff && (
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase text-on-surface-variant">
                    Staff Member
                  </p>
                  <p className="font-hanken text-[18px] leading-[1.4] font-semibold text-on-surface">
                    {booking.staff.name}
                  </p>
                </div>
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden border border-primary/40 shrink-0">
                  {booking.staff.avatar_url ? (
                    <Image
                      src={booking.staff.avatar_url}
                      alt={booking.staff.name}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center">
                      <span className="font-hanken text-[40px] font-bold text-primary select-none">
                        {booking.staff.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Cancel Modal */}
      {showCancelModal && (
        <Portal testId="booking-card-cancel-modal-portal">
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => !loading && setShowCancelModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div
            ref={cancelModalRef}
            className="bg-surface border border-white/10 max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="cancel-modal-title" className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-4">
              {isEmergencyCancel ? "Emergency Cancellation" : "Cancel Booking?"}
            </h3>
            <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface-variant mb-6">
              Are you sure you want to cancel your appointment at{" "}
              <span className="text-primary font-semibold">{booking.businesses?.name}</span> on{" "}
              {formatTbilisi(booking.appointment_datetime, "MMM d, yyyy 'at' HH:mm")}?
            </p>

            {isEmergencyCancel && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/30 text-primary font-mono text-[11px] leading-[1.5] tracking-[0.1em]">
                ⚠️ This is your one-time emergency cancellation. After using it, you won&apos;t be able to cancel within 24 hours of future appointments.
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/30 text-error font-mono text-[12px] tracking-[0.15em]">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                ref={keepBookingBtnRef}
                data-testid={`keep-booking-btn-${booking.id}`}
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
                className="flex-1 border border-white/10 text-on-surface font-mono text-[12px] tracking-[0.15em] uppercase py-3 hover:border-white/30 transition-colors disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                data-testid={`confirm-cancel-btn-${booking.id}`}
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-error text-white font-mono text-[12px] tracking-[0.15em] uppercase py-3 hover:bg-error/80 transition-colors disabled:opacity-50"
              >
                {loading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* Leave Review Modal */}
      {showReviewModal && (
        <LeaveReviewModal
          bookingId={booking.id}
          businessName={booking.businesses?.name || "Business"}
          serviceName={booking.services?.name || "Service"}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setHasReviewSubmitted(true);
            setShowReviewModal(false);
          }}
        />
      )}
    </>
  );
}
