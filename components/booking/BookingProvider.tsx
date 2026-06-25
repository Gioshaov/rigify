"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BookingModal } from "@/components/booking/BookingModal";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_min: number;
  price_max: number;
}

interface Staff {
  id: string;
  name: string;
  specialty: string | null;
}

interface Business {
  id: string;
  name: string;
  slug: string;
}

interface BookingContextValue {
  /** Open the booking modal. Pass a serviceId to preselect it; otherwise the first service is used. */
  openBooking: (serviceId?: string) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return ctx;
}

interface BookingProviderProps {
  business: Business;
  services: Service[];
  staff: Staff[];
  /** Whether the viewer is logged in. Guests must provide an email when booking. */
  isAuthenticated?: boolean;
  children: ReactNode;
}

export function BookingProvider({ business, services, staff, isAuthenticated = false, children }: BookingProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceId, setServiceId] = useState<string | null>(null);

  const openBooking = (id?: string) => {
    setServiceId(id ?? null);
    setIsOpen(true);
  };

  // Explicit when opened from a service card; null when opened via the generic "Book Now".
  const initialService = services.find((s) => s.id === serviceId) ?? null;

  return (
    <BookingContext.Provider value={{ openBooking }}>
      {children}
      {isOpen && (
        <BookingModal
          isOpen
          onClose={() => setIsOpen(false)}
          business={business}
          staff={staff}
          services={services}
          initialService={initialService}
          isAuthenticated={isAuthenticated}
        />
      )}
    </BookingContext.Provider>
  );
}
