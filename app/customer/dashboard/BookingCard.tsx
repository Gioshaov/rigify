"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatTbilisi } from "@/lib/utils/datetime";
import { cancelBookingAction } from "./actions";
import { LeaveReviewModal } from "./LeaveReviewModal";

type BookingCardProps = {
  booking: {
    id: string;
    appointment_datetime: string;
    status: string;
    business_id: string;
    service_id: string;
    staff_id: string | null;
    businesses: { name: string; address: string };
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
      <article
        data-testid={isPast ? `past-booking-card-${booking.id}` : `booking-card-${booking.id}`}
        className={`relative ${
          isPast
            ? "bg-surface-container-low border border-white/5"
            : "bg-surface-container border border-white/10 hover:bg-surface-container-high transition-all"
        } p-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Content */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Header: Business Name, Service Name, Status */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary mb-1 uppercase">
                  {booking.businesses?.name || "Business"}
                </h3>
                <h4 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white">
                  {booking.services?.name || "Service"}
                </h4>
              </div>
              <span
                className={`px-3 py-1 ${
                  isPast
                    ? "border border-white/5 text-on-surface-variant"
                    : "bg-primary/10 border border-primary/20 text-primary"
                } font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase`}
              >
                {booking.status}
              </span>
            </div>

            {/* Details Grid - Stitch Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 mt-6">
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-muted-gold text-xl">calendar_today</span>
                <div>
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase text-on-surface-variant">
                    Date & Time
                  </p>
                  <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface">
                    {formatTbilisi(booking.appointment_datetime, "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {/* Staff Member */}
              {booking.staff && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 flex-shrink-0">
                    {booking.staff.avatar_url ? (
                      <Image
                        src={booking.staff.avatar_url}
                        alt={booking.staff.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover grayscale"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center">
                        <span className="font-hanken text-[14px] font-bold text-primary select-none">
                          {booking.staff.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase text-on-surface-variant">
                      Staff Member
                    </p>
                    <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface">
                      {booking.staff.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions - Stitch Design */}
          {!isPast && booking.status === "confirmed" && (
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex gap-4">
                <Link
                  data-testid={`manage-btn-${booking.id}`}
                  href={`/customer/bookings/${booking.id}`}
                  className="bg-primary text-on-primary px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase hover:brightness-110 transition-all inline-block text-center"
                >
                  Manage
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

          {/* Leave Review Button - Stitch Design */}
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
      </article>

      {/* Cancel Modal */}
      {showCancelModal && (
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
