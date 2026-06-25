"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { formatPrice, formatDuration } from "@/lib/utils/formatting";
import { MONTH_NAMES } from "@/lib/utils/calendar";
import { convertTo12Hour, convertTo24Hour } from "@/lib/utils/time-format";
import { validators, errorMessages } from "@/lib/utils/validation";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import type { BookingConfirmationData } from "@/lib/bookings/types";

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

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  staff: Staff[];
  services: Service[];
  initialService: Service | null;
  /** Guests (not logged in) must provide an email. */
  isAuthenticated?: boolean;
}

export function BookingModal({ isOpen, onClose, business, staff, services, initialService, isAuthenticated = false }: BookingModalProps) {
  const router = useRouter();

  // Guests must provide an email so they receive a confirmation.
  const emailRequired = !isAuthenticated;

  // The service being booked. Preset (and locked) when opened from a service card;
  // chosen via a dropdown when opened from the generic "Book Now" CTA.
  const [selectedService, setSelectedService] = useState<Service | null>(initialService);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null); // null = nothing chosen
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [countryCode, setCountryCode] = useState("+995"); // Default Georgia
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Field-level validation errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Date popover
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const dateFieldRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Service dropdown (custom, so names render gold and prices align — like the cards)
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const serviceFieldRef = useRef<HTMLDivElement>(null);

  // After a successful booking, the modal swaps to the shared confirmation view.
  const [confirmation, setConfirmation] = useState<BookingConfirmationData | null>(null);

  // Combine country code + phone number whenever either changes.
  // Strip internal spaces so the stored value matches the register flow's E.164.
  useEffect(() => {
    setCustomerPhone(phoneNumber ? `${countryCode} ${phoneNumber.replace(/\s/g, "")}` : "");
  }, [countryCode, phoneNumber]);

  // Sync the chosen service to the trigger's context each time the modal opens.
  useEffect(() => {
    if (isOpen) setSelectedService(initialService);
  }, [isOpen, initialService]);

  // Fetch available slots when date / service / artisan changes.
  // Aborts an in-flight request when the selection changes so a slow earlier
  // response can't overwrite the slots for a newer selection.
  useEffect(() => {
    if (!selectedDate || !selectedService) {
      setAvailableSlots([]);
      return;
    }

    const controller = new AbortController();

    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      setBookingError(null);

      const bookingDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;

      try {
        const staffParam = selectedStaff && selectedStaff !== "any" ? `&staffId=${selectedStaff}` : "";
        const response = await fetch(
          `/api/availability?businessId=${business.id}&serviceId=${selectedService.id}&date=${bookingDate}${staffParam}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch availability");
        }

        const data = await response.json();
        const slots12h = data.slots.map(convertTo12Hour);
        setAvailableSlots(slots12h);
      } catch (error) {
        // Superseded by a newer selection — ignore, the new run owns the state.
        if (controller.signal.aborted) return;
        console.error("Error fetching availability:", error);
        setBookingError("Failed to load available slots. Please try again.");
        setAvailableSlots([]);
      } finally {
        if (!controller.signal.aborted) setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();

    return () => controller.abort();
  }, [selectedDate, currentMonth, currentYear, selectedService, selectedStaff, business.id]);

  // Body scroll lock + focus management while open.
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the dialog on open
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  // Close the date popover on outside click
  useEffect(() => {
    if (!isCalendarOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (dateFieldRef.current && !dateFieldRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [isCalendarOpen]);

  // Close the service dropdown on outside click
  useEffect(() => {
    if (!isServiceOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (serviceFieldRef.current && !serviceFieldRef.current.contains(e.target as Node)) {
        setIsServiceOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [isServiceOpen]);

  // When the confirmation view appears, move focus to its heading (a11y).
  useEffect(() => {
    if (!confirmation) return;
    const raf = requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>('[data-testid="booking-confirmed-title"]')
        ?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [confirmation]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    setSelectedDate(day);
    setSelectedTime(null); // reset time when date changes
    setIsCalendarOpen(false);
  };

  const dateLabel =
    selectedDate != null
      ? `${MONTH_NAMES[currentMonth].slice(0, 3)} ${selectedDate}, ${currentYear}`
      : "Select a date";

  // "Book Now" (no preselected service) lets the user pick the service in-modal.
  const canSelectService = initialService === null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (isServiceOpen) {
        setIsServiceOpen(false);
      } else if (isCalendarOpen) {
        setIsCalendarOpen(false);
      } else {
        onClose();
      }
      return;
    }
    if (e.key === "Tab") {
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const list = Array.from(focusables);
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  // Submission — identical payload and flow to the old /book page.
  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setBookingError(null);
    setNameError(null);
    setPhoneError(null);
    setEmailError(null);

    const name = customerName.trim();
    const phone = customerPhone.trim();
    const email = customerEmail.trim();

    let hasError = false;

    if (!validators.required(name)) {
      setNameError(errorMessages.required);
      hasError = true;
    } else if (!validators.name(name)) {
      setNameError(errorMessages.name);
      hasError = true;
    }

    if (!validators.required(phone)) {
      setPhoneError(errorMessages.required);
      hasError = true;
    } else if (!validators.phone(phone)) {
      setPhoneError(errorMessages.phone);
      hasError = true;
    }

    if (emailRequired && !validators.required(email)) {
      setEmailError(errorMessages.required);
      hasError = true;
    } else if (email && !validators.email(email)) {
      setEmailError(errorMessages.email);
      hasError = true;
    }

    if (hasError) {
      setBookingError("Please fix the errors above and try again.");
      return;
    }

    setIsBooking(true);

    const bookingDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;
    const time24 = convertTo24Hour(selectedTime);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: selectedService.id,
          date: bookingDate,
          startTime: time24,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || null,
          staffId: selectedStaff === "any" ? null : selectedStaff, // "any" = auto-assign
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsBooking(false);
        setBookingError(result.error || "Failed to create booking. Please try again.");
        return;
      }

      // Success — the POST already returned the full confirmation; show it inline.
      if (result.booking) {
        setConfirmation(result.booking);
        setIsBooking(false);
        return;
      }
      // Fallback: if confirmation data is missing, use the standalone page.
      setIsBooking(false);
      onClose();
      router.push(`/businesses/${business.slug}/booking-confirmed?id=${result.bookingId}`);
    } catch (error) {
      setIsBooking(false);
      setBookingError("Network error. Please check your connection and try again.");
    }
  };

  const labelClass =
    "font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2";
  const inputClass =
    "w-full bg-surface border px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary transition-colors";

  const confirmDisabled =
    !selectedService ||
    !selectedDate ||
    !selectedTime ||
    !customerName.trim() ||
    !customerPhone.trim() ||
    (emailRequired && !customerEmail.trim()) ||
    (staff.length > 0 && !selectedStaff) ||
    isBooking;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-[#0a0a0a]/70 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={confirmation ? undefined : "booking-modal-title"}
        aria-label={confirmation ? "Booking confirmed" : undefined}
        tabIndex={-1}
        data-testid="booking-modal"
        className={`w-full ${confirmation ? "max-w-[920px]" : "max-w-[520px]"} my-4 bg-surface border border-white/10 rounded-[4px] flex flex-col ${confirmation ? "max-h-[95vh]" : "max-h-[92vh]"} outline-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-white/10 shrink-0">
          {!confirmation && (
            <h2
              id="booking-modal-title"
              className="font-hanken text-[20px] leading-[1.3] font-semibold text-pure-white"
            >
              {selectedService ? `Book ${selectedService.name}` : "New booking"}
            </h2>
          )}
          <button
            type="button"
            data-testid="booking-modal-close"
            onClick={onClose}
            aria-label="Close booking dialog"
            className="w-9 h-9 flex items-center justify-center bg-surface border border-white/10 rounded-[4px] text-on-surface hover:border-primary hover:text-primary transition-colors shrink-0 ml-auto"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {confirmation ? (
          <div data-testid="booking-confirmation-view" className="px-6 py-6 overflow-y-auto">
            <BookingConfirmation booking={confirmation} onDone={onClose} compact showMyBookings={isAuthenticated} />
          </div>
        ) : (
          <>
        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-6">
          {/* 1. Service — dropdown when opened via "Book Now", locked summary from a card */}
          {canSelectService ? (
            <div className="relative" ref={serviceFieldRef}>
              <label className={labelClass}>
                Service <span className="text-error">*</span>
              </label>
              <button
                type="button"
                data-testid="booking-service-select"
                onClick={() => setIsServiceOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={isServiceOpen}
                className="w-full flex items-center justify-between gap-3 bg-surface border border-white/10 rounded-[4px] px-4 py-3 text-left outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <span
                  className={`font-hanken text-[16px] font-semibold truncate ${
                    selectedService ? "text-primary" : "text-on-surface-variant/60"
                  }`}
                >
                  {selectedService ? selectedService.name : "Choose a service..."}
                </span>
                <span className="flex items-center gap-3 shrink-0">
                  {selectedService && (
                    <span className="font-hanken text-[16px] font-bold text-primary whitespace-nowrap">
                      {formatPrice(selectedService.price_min ?? 0, selectedService.price_max)}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
                </span>
              </button>

              {isServiceOpen && (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-2 z-20 max-h-60 overflow-y-auto bg-surface-container-low border border-white/10 rounded-[4px] py-1"
                >
                  {services.map((s) => {
                    const isSel = selectedService?.id === s.id;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSel}
                          onClick={() => {
                            setSelectedService(s);
                            setSelectedTime(null); // availability is per-service
                            setIsServiceOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-high ${
                            isSel ? "bg-surface-container-high" : ""
                          }`}
                        >
                          <span className="font-hanken text-[15px] font-semibold text-primary truncate">{s.name}</span>
                          <span className="font-hanken text-[15px] font-bold text-primary whitespace-nowrap">
                            {formatPrice(s.price_min ?? 0, s.price_max)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : selectedService ? (
            <div className="bg-surface-container-low border border-white/10 rounded-[4px] p-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold mb-1">
                  SELECTED SERVICE
                </p>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-primary">
                  {selectedService.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
                  <span className="font-mono text-[11px] leading-[1] tracking-[0.15em] font-medium text-on-surface">
                    {formatDuration(selectedService.duration_minutes)}
                  </span>
                </div>
              </div>
              <span className="font-hanken text-[24px] leading-[1.2] tracking-tighter font-bold text-primary whitespace-nowrap">
                {formatPrice(selectedService.price_min ?? 0, selectedService.price_max)}
              </span>
            </div>
          ) : (
            <div className="bg-surface-container-low border border-error/40 rounded-[4px] p-4">
              <p className="font-hanken text-[14px] leading-[1.5] text-error">No service selected.</p>
            </div>
          )}

          {/* 2. Artisan */}
          <div>
            <label htmlFor="booking-artisan-select" className={labelClass}>
              Artisan{staff.length > 0 && <span className="text-error"> *</span>}
            </label>
            {staff.length > 0 ? (
              <select
                id="booking-artisan-select"
                data-testid="booking-artisan-select"
                value={selectedStaff ?? ""}
                onChange={(e) => setSelectedStaff(e.target.value || null)}
                className="w-full bg-surface border border-white/10 focus:border-primary rounded-[4px] px-4 py-3 font-mono text-[12px] tracking-[0.15em] font-medium text-on-surface uppercase outline-none appearance-none cursor-pointer transition-colors"
                required
              >
                <option value="" disabled>
                  Choose your artisan...
                </option>
                <option value="any">Any Available Staff</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="font-mono text-[11px] leading-[1.5] tracking-[0.1em] text-on-surface-variant">
                One will be assigned automatically.
              </p>
            )}
          </div>

          {/* 3. Date (popover calendar) */}
          <div className="relative" ref={dateFieldRef}>
            <label className={labelClass}>
              Date <span className="text-error">*</span>
            </label>
            <button
              type="button"
              data-testid="booking-date-field"
              onClick={() => setIsCalendarOpen((o) => !o)}
              aria-haspopup="dialog"
              aria-expanded={isCalendarOpen}
              className="w-full flex items-center justify-between bg-surface border border-white/10 rounded-[4px] px-4 py-3 text-left outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <span
                className={`font-mono text-[12px] tracking-[0.15em] ${
                  selectedDate != null ? "text-on-surface" : "text-on-surface-variant/50"
                }`}
              >
                {dateLabel}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">calendar_month</span>
            </button>

            {isCalendarOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-surface-container-low border border-white/10 rounded-[4px] p-4 shadow-xl">
                <BookingCalendar
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  selectedDate={selectedDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onSelectDate={handleSelectDate}
                />
              </div>
            )}
          </div>

          {/* 4. Time */}
          <div>
            <label htmlFor="booking-time-select" className={labelClass}>
              Time <span className="text-error">*</span>
            </label>
            <select
              id="booking-time-select"
              data-testid="booking-time-select"
              value={selectedTime ?? ""}
              onChange={(e) => setSelectedTime(e.target.value || null)}
              disabled={!selectedDate || isLoadingAvailability}
              className="w-full bg-surface border border-white/10 focus:border-primary rounded-[4px] px-4 py-3 font-mono text-[12px] tracking-[0.15em] font-medium text-on-surface uppercase outline-none appearance-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {!selectedDate
                  ? "Select a date first"
                  : isLoadingAvailability
                  ? "Loading slots..."
                  : availableSlots.length === 0
                  ? "No times available"
                  : "Choose a time..."}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Full name */}
          <div>
            <label className={labelClass}>
              Full Name <span className="text-error">*</span>
            </label>
            <input
              data-testid="customer-name-input"
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setNameError(null);
              }}
              placeholder="Enter your name"
              className={`${inputClass} ${nameError ? "border-error" : "border-white/10"}`}
              required
            />
            {nameError && (
              <p className="mt-1 text-error font-mono text-[10px] tracking-[0.15em] uppercase">{nameError}</p>
            )}
          </div>

          {/* 6. Phone (reused GE +995 selector) */}
          <div>
            <label className={labelClass}>
              Phone Number <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              <CountryCodeSelect
                testId="country-code-select"
                value={countryCode}
                onChange={(dial) => {
                  setCountryCode(dial);
                  setPhoneError(null);
                }}
                hasError={!!phoneError}
              />
              <input
                data-testid="customer-phone-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9\s]/g, "");
                  setPhoneNumber(value);
                  setPhoneError(null);
                }}
                placeholder="555 123 456"
                className={`flex-1 min-w-0 ${inputClass} ${phoneError ? "border-error" : "border-white/10"}`}
                required
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-error font-mono text-[10px] tracking-[0.15em] uppercase">{phoneError}</p>
            )}
          </div>

          {/* 7. Email — required for guests */}
          <div>
            <label className={labelClass}>
              Email{emailRequired ? <span className="text-error"> *</span> : " (Optional)"}
            </label>
            <input
              data-testid="customer-email-input"
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                setEmailError(null);
              }}
              placeholder="your@email.com"
              className={`${inputClass} ${emailError ? "border-error" : "border-white/10"}`}
            />
            {emailError && (
              <p className="mt-1 text-error font-mono text-[10px] tracking-[0.15em] uppercase">{emailError}</p>
            )}
          </div>

          {/* Error */}
          {bookingError && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-[4px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">error</span>
                <p className="font-hanken text-[14px] leading-[1.5] text-error">{bookingError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Confirm */}
        <div className="px-6 py-5 border-t border-white/10 shrink-0">
          <button
            type="button"
            data-testid="booking-confirm"
            onClick={handleConfirmBooking}
            disabled={confirmDisabled}
            className="w-full bg-primary text-background font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium py-4 rounded-[4px] hover:bg-primary-fixed-dim transition-all active:scale-[0.98] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBooking ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-background border-t-transparent animate-spin rounded-full"></span>
                Creating Booking...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
