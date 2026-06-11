"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTbilisi } from "@/lib/utils/datetime";
import { formatPrice, formatDuration } from "@/lib/utils/formatting";
import { getBusinessFallbackImage } from "@/lib/utils/fallback-images";
import { cancelBookingAction } from "@/app/customer/dashboard/actions";

type ManageBookingClientProps = {
  booking: {
    id: string;
    appointment_datetime: string;
    status: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    business_id: string;
    service_id: string;
    staff_id: string | null;
    businesses: {
      name: string;
      slug: string;
      address: string;
      city: string;
      phone: string | null;
      cover_image_url: string | null;
    };
    services: {
      name: string;
      description: string | null;
      duration_minutes: number;
      price_min: number;
      price_max: number;
    };
    staff: {
      name: string;
      specialty: string | null;
      avatar_url: string | null;
    } | null;
  };
};

export function ManageBookingClient({ booking }: ManageBookingClientProps) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmationId = `RG-${booking.id.slice(0, 8).toUpperCase()}`;
  const canManage = booking.status === "confirmed";

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    const result = await cancelBookingAction(booking.id);

    if (result.success) {
      // Redirect back to bookings list
      router.push('/customer/dashboard');
    } else {
      setError(result.error || "Failed to cancel booking");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Stitch Design: Manage Booking Page */}
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Navigation */}
        <header
          data-testid="manage-booking-header"
          className="sticky top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface border-b border-white/10"
        >
          <button
            data-testid="back-btn"
            onClick={() => router.back()}
            className="flex items-center justify-center p-2 hover:bg-white/5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-primary">arrow_back_ios_new</span>
          </button>
          <h1 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary tracking-tight">
            Manage Booking
          </h1>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </header>

        <main className="max-w-container mx-auto w-full pb-32">
          {/* Hero Section */}
          <section className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
            <Image
              src={getBusinessFallbackImage(booking.businesses.cover_image_url, [])}
              alt={booking.businesses.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-margin-mobile md:p-margin-desktop">
              <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium bg-primary text-background px-3 py-1 inline-block mb-2 uppercase">
                Premium Studio
              </span>
              <h2 className="font-hanken text-[36px] leading-[1.2] md:text-[48px] tracking-tighter font-bold text-pure-white">
                {booking.businesses.name}
              </h2>
            </div>
          </section>

          <div className="px-margin-mobile md:px-margin-desktop mt-base grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Left Column: Details */}
            <div className="md:col-span-7 space-y-gutter">
              {/* Status & ID Section */}
              <div
                data-testid="booking-status-card"
                className="bg-surface-container border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-primary"></span>
                    <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary uppercase">
                      {booking.status}
                    </span>
                  </div>
                  <p className="font-hanken text-[16px] leading-[1.5] text-on-surface-variant">
                    Booking ID: <span className="font-mono text-[12px] tracking-[0.15em] text-pure-white">#{confirmationId}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                      Date & Time
                    </span>
                    <span className="font-hanken text-[18px] leading-[1.6] text-pure-white">
                      {formatTbilisi(booking.appointment_datetime, "MMM d, yyyy 'at' HH:mm")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Details Card */}
              <div className="bg-surface-container border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase mb-4">
                    Service Details
                  </h3>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-hanken text-[24px] leading-[1.3] font-semibold text-pure-white mb-1">
                        {booking.services.name}
                      </h4>
                      {booking.services.description && (
                        <p className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant mt-2 max-w-md">
                          {booking.services.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span className="text-sm">{formatDuration(booking.services.duration_minutes)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          <span className="text-sm">{formatPrice(booking.services.price_min, booking.services.price_max)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Staff Member */}
                {booking.staff && (
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-variant border border-primary/30 overflow-hidden">
                        {booking.staff.avatar_url ? (
                          <Image
                            src={booking.staff.avatar_url}
                            alt={booking.staff.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-surface flex items-center justify-center">
                            <span className="font-hanken text-[20px] font-bold text-primary select-none">
                              {booking.staff.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase text-on-surface-variant">
                          Staff Member
                        </p>
                        <p className="font-hanken text-[18px] leading-[1.6] text-pure-white">
                          {booking.staff.name}
                        </p>
                        {booking.staff.specialty && (
                          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-on-surface-variant uppercase mt-1">
                            {booking.staff.specialty}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Actions & Location */}
            <div className="md:col-span-5 space-y-gutter">
              {/* Action Buttons */}
              {canManage && (
                <div className="bg-surface-elevated border border-white/10 p-6 space-y-4">
                  <Link
                    data-testid="reschedule-btn"
                    href={`/customer/bookings/${booking.id}/reschedule`}
                    className="w-full bg-primary text-background font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold py-4 hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center"
                  >
                    Reschedule Appointment
                  </Link>
                  <button
                    data-testid="cancel-booking-btn"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full border border-error/30 text-error font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase py-4 hover:bg-error/10 transition-all active:scale-[0.98]"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}

              {/* Location Card */}
              <div className="bg-surface-container border border-white/10 p-6">
                <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary uppercase mb-4">
                  Location
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-1">location_on</span>
                    <div>
                      <p className="font-hanken text-[16px] leading-[1.5] text-on-surface">
                        {booking.businesses.address}
                      </p>
                      <p className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant">
                        {booking.businesses.city}
                      </p>
                    </div>
                  </div>
                  {booking.businesses.phone && (
                    <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                      <span className="material-symbols-outlined text-primary text-xl">phone</span>
                      <p className="font-hanken text-[16px] leading-[1.5] text-on-surface">
                        {booking.businesses.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-surface-container-low border border-white/10 p-6">
                <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase mb-4">
                  Your Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase text-on-surface-variant mb-1">
                      Name
                    </p>
                    <p className="font-hanken text-[16px] leading-[1.5] text-on-surface">
                      {booking.customer_name}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase text-on-surface-variant mb-1">
                      Phone
                    </p>
                    <p className="font-hanken text-[16px] leading-[1.5] text-on-surface">
                      {booking.customer_phone}
                    </p>
                  </div>
                  {booking.customer_email && (
                    <div>
                      <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase text-on-surface-variant mb-1">
                        Email
                      </p>
                      <p className="font-hanken text-[16px] leading-[1.5] text-on-surface">
                        {booking.customer_email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => !loading && setShowCancelModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-surface border border-white/10 max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-4">
              Cancel Booking?
            </h3>
            <p className="font-hanken text-[16px] leading-[1.5] text-on-surface-variant mb-6">
              Are you sure you want to cancel your appointment at{" "}
              <span className="text-primary font-semibold">{booking.businesses.name}</span> on{" "}
              {formatTbilisi(booking.appointment_datetime, "MMM d, yyyy 'at' HH:mm")}?
            </p>

            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/30 text-error font-mono text-[12px] tracking-[0.15em]">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                data-testid="keep-booking-btn"
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
                className="flex-1 border border-white/10 text-on-surface font-mono text-[12px] tracking-[0.15em] uppercase py-3 hover:border-white/30 transition-colors disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                data-testid="confirm-cancel-btn"
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
    </>
  );
}
