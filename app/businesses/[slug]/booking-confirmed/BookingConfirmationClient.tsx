'use client'

import Link from "next/link";
import { UserMenu } from "@/components/ui/UserMenu";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import type { BookingConfirmationData } from "@/lib/bookings/types";

export function BookingConfirmationClient({
  booking,
  canViewPII = false,
}: {
  booking: BookingConfirmationData
  /** True only for the booking's own customer/owner — gates the "View My Bookings" link. */
  canViewPII?: boolean
}) {
  return (
    <div className="min-h-dvh bg-background font-hanken text-on-surface antialiased overflow-x-hidden">
      {/* Stitch Design: booking_confirmed_rigify */}

      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-nav flex items-center justify-between px-margin-mobile h-16 bg-surface border-b border-white/10">
        <div className="flex items-center gap-4">
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
        <BookingConfirmation booking={booking} showMyBookings={canViewPII} />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-nav flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
        <Link data-testid="mobile-nav-home" href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase mt-1">Home</span>
        </Link>
        <Link data-testid="mobile-nav-browse" href="/businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase mt-1">Browse</span>
        </Link>
        <Link data-testid="mobile-nav-my-bookings" href="/customer/dashboard" className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1">
          <span className="material-symbols-outlined">event_available</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase mt-1">My Bookings</span>
        </Link>
      </nav>
    </div>
  );
}
