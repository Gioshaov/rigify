"use client";

import { useBooking } from "@/components/booking/BookingProvider";

interface BookServiceButtonProps {
  mobile?: boolean;
}

export function BookServiceButton({ mobile }: BookServiceButtonProps) {
  const { openBooking } = useBooking();

  if (mobile) {
    return (
      <button
        data-testid="open-booking-modal-mobile"
        onClick={() => openBooking()}
        className="w-full bg-primary text-on-primary py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold active:scale-95 transition-all"
      >
        Book Now
      </button>
    );
  }

  return (
    <button
      data-testid="open-booking-modal"
      onClick={() => openBooking()}
      className="bg-primary text-on-primary px-10 py-5 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:brightness-110 active:scale-95 transition-all"
    >
      Book Now
    </button>
  );
}
