"use client";

import { useState, useEffect } from "react";
import { formatTbilisi } from "@/lib/utils/datetime";
import { cancelBookingAction } from "./actions";
import { RescheduleModal } from "./RescheduleModal";
import { createClient } from "@/lib/supabase/client";

// Client-side cache for staff lists (per business)
const staffCache = new Map<string, Array<{ id: string; name: string; specialty: string | null }>>();

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
    staff: { name: string } | null;
  };
  isPast?: boolean;
};

export function BookingCard({ booking, isPast = false }: BookingCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState<Array<{ id: string; name: string; specialty: string | null }>>([]);

  // Fetch staff when reschedule modal opens (with client-side caching)
  useEffect(() => {
    if (showRescheduleModal) {
      // Check cache first
      const cached = staffCache.get(booking.business_id);
      if (cached) {
        setStaff(cached);
        return;
      }

      // Fetch and cache if not available
      const fetchStaff = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('staff')
          .select('id, name, specialty')
          .eq('business_id', booking.business_id)
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (data) {
          staffCache.set(booking.business_id, data);
          setStaff(data);
        }
      };
      fetchStaff();
    }
  }, [showRescheduleModal, booking.business_id]);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    // Optimistic update - provide immediate visual feedback
    const cardElement = document.querySelector(`[data-testid="${isPast ? 'past-' : ''}booking-card-${booking.id}"]`);
    if (cardElement) {
      (cardElement as HTMLElement).style.opacity = '0.5';
      (cardElement as HTMLElement).style.pointerEvents = 'none';
    }

    const result = await cancelBookingAction(booking.id);

    if (result.success) {
      setShowCancelModal(false);
      // Reload page to refresh booking list (lightweight, no server rebuild)
      window.location.reload();
    } else {
      // Revert optimistic update on error
      if (cardElement) {
        (cardElement as HTMLElement).style.opacity = '1';
        (cardElement as HTMLElement).style.pointerEvents = 'auto';
      }
      setError(result.error || "Failed to cancel booking");
      setLoading(false);
    }
  };

  return (
    <>
      <article
        data-testid={isPast ? `past-booking-card-${booking.id}` : `booking-card-${booking.id}`}
        className={`${
          isPast
            ? "bg-surface-container-low border border-white/5 p-6"
            : "bg-surface-container border border-white/5 hover:border-primary/30 transition-all p-6"
        }`}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            {/* Business Name */}
            <h3
              className={`font-hanken ${
                isPast ? "text-[18px] leading-[1.6] font-normal" : "text-[20px] leading-[1.4] font-semibold"
              } ${isPast ? "text-on-surface" : "text-primary"} mb-${isPast ? "2" : "3"}`}
            >
              {booking.businesses?.name || "—"}
            </h3>

            {/* Service & Staff */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined ${isPast ? "text-text-secondary text-[14px]" : "text-primary text-[16px]"}`}>
                cut
              </span>
              <span className={`font-hanken text-[14px] leading-[1.5] font-normal ${isPast ? "text-text-secondary" : "text-on-surface"}`}>
                {booking.services?.name || "Service"}
              </span>
              {booking.staff && isPast && (
                <>
                  <span className="text-text-secondary">·</span>
                  <span className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
                    {booking.staff.name}
                  </span>
                </>
              )}
            </div>

            {booking.staff && !isPast && (
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[16px]">
                  person
                </span>
                <span className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface">
                  {booking.staff.name}
                </span>
              </div>
            )}

            {/* Date & Time */}
            <div className={`flex items-center gap-2 ${isPast ? "" : "mb-3"}`}>
              <span className={`material-symbols-outlined ${isPast ? "text-text-secondary text-[14px]" : "text-primary text-[16px]"}`}>
                schedule
              </span>
              <span className={`font-mono ${isPast ? "text-[10px]" : "text-[12px]"} leading-[1] tracking-[0.${isPast ? "2" : "15"}em] font-medium ${isPast ? "text-text-secondary" : "text-muted-gold"}`}>
                {formatTbilisi(booking.appointment_datetime, "MMM d, yyyy 'at' HH:mm")}
              </span>
            </div>

            {/* Address */}
            {!isPast && booking.businesses?.address && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-text-secondary text-[16px]">
                  location_on
                </span>
                <span className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
                  {booking.businesses.address}
                </span>
              </div>
            )}
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col items-end gap-4">
            <span
              className={`px-3 py-1 ${
                isPast
                  ? "border border-white/5"
                  : "bg-primary/10 border border-primary/20"
              } font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium ${
                isPast ? "text-text-secondary" : "text-primary"
              } uppercase`}
            >
              {booking.status}
            </span>
            {!isPast && booking.status === "confirmed" && (
              <div className="flex gap-2">
                <button
                  data-testid={`reschedule-btn-${booking.id}`}
                  onClick={() => setShowRescheduleModal(true)}
                  className="px-4 py-2 border border-white/10 font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface hover:border-primary/30 hover:text-primary transition-all uppercase"
                >
                  Reschedule
                </button>
                <button
                  data-testid={`cancel-btn-${booking.id}`}
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 border border-white/10 font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface hover:border-error/30 hover:text-error transition-all uppercase"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => !loading && setShowCancelModal(false)}
        >
          <div
            className="bg-surface border border-white/10 max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-4">
              Cancel Booking?
            </h3>
            <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface-variant mb-6">
              Are you sure you want to cancel your appointment at{" "}
              <span className="text-primary font-semibold">{booking.businesses?.name}</span> on{" "}
              {formatTbilisi(booking.appointment_datetime, "MMM d, yyyy 'at' HH:mm")}?
            </p>

            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/30 text-error font-mono text-[12px] tracking-[0.15em]">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
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

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <RescheduleModal
          booking={{
            id: booking.id,
            appointment_datetime: booking.appointment_datetime,
            business_id: booking.business_id,
            service_id: booking.service_id,
            staff_id: booking.staff_id,
            businesses: booking.businesses,
            services: booking.services,
          }}
          staff={staff}
          onClose={() => setShowRescheduleModal(false)}
        />
      )}
    </>
  );
}
