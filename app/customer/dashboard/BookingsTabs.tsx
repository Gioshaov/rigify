"use client";

import { useState } from "react";
import Link from "next/link";
import { BookingCard } from "./BookingCard";
import { useEmergencyCancelFlag } from "./useEmergencyCancelFlag";

type Booking = {
  id: string;
  appointment_datetime: string;
  status: string;
  business_id: string;
  service_id: string;
  staff_id: string | null;
  businesses: { name: string; address: string };
  services: { name: string };
  staff: { name: string; avatar_url?: string | null } | null;
};

interface BookingsTabsProps {
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  customerId: string;
  initialHasUsedEmergencyCancel: boolean;
}

export function BookingsTabs({ upcomingBookings, pastBookings, customerId, initialHasUsedEmergencyCancel }: BookingsTabsProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Real-time subscription to emergency cancel flag (prevents multi-tab race conditions)
  const hasUsedEmergencyCancel = useEmergencyCancelFlag(customerId, initialHasUsedEmergencyCancel);

  return (
    <>
      {/* Tabs - Stitch Design */}
      <div className="flex border-b border-white/10 mb-10 overflow-x-auto no-scrollbar" data-testid="bookings-tabs" role="tablist">
        <button
          data-testid="tab-upcoming"
          role="tab"
          aria-selected={activeTab === 'upcoming'}
          aria-controls="upcoming-bookings-content"
          onClick={() => setActiveTab('upcoming')}
          className={`px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase transition-all border-b-2 ${
            activeTab === 'upcoming'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Upcoming
        </button>
        <button
          data-testid="tab-past"
          role="tab"
          aria-selected={activeTab === 'past'}
          aria-controls="past-bookings-content"
          onClick={() => setActiveTab('past')}
          className={`px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase transition-all border-b-2 ${
            activeTab === 'past'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Past
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6" data-testid="upcoming-bookings-content" role="tabpanel" id="upcoming-bookings-content" aria-labelledby="tab-upcoming">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} hasUsedEmergencyCancel={hasUsedEmergencyCancel} />
            ))
          ) : (
            <div className="bg-surface-container border border-white/10 p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-primary text-[32px]">event_busy</span>
              </div>
              <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface-variant mb-6">
                No upcoming bookings
              </p>
              <Link
                data-testid="browse-salons-btn"
                href="/businesses"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:brightness-110 transition-all"
              >
                Browse Salons
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-6" data-testid="past-bookings-content" role="tabpanel" id="past-bookings-content" aria-labelledby="tab-past">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isPast hasUsedEmergencyCancel={hasUsedEmergencyCancel} />
            ))
          ) : (
            <div className="bg-surface-container-low border border-white/5 p-8 text-center">
              <p className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant">
                No past bookings
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
