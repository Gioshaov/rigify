"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { rescheduleBookingAction } from "./actions";
import { formatTbilisi } from "@/lib/utils/datetime";
import { generateCalendarDays, groupTimeSlots, MONTH_NAMES } from "@/lib/utils/calendar";
import { convertTo12Hour, convertTo24Hour, generateTimeSlotTestId } from "@/lib/utils/time-format";

type RescheduleModalProps = {
  booking: {
    id: string;
    appointment_datetime: string;
    business_id: string;
    service_id: string;
    staff_id: string | null;
    businesses: { name: string };
    services: { name: string };
  };
  staff: Array<{ id: string; name: string; specialty: string | null }>;
  onClose: () => void;
};

export function RescheduleModal({ booking, staff, onClose }: RescheduleModalProps) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => now.getMonth());
  const [currentYear, setCurrentYear] = useState(() => now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(booking.staff_id || null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
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

    // Focus first focusable element on mount
    setTimeout(() => firstFocusableRef.current?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [loading, onClose]);

  const calendarDays = useMemo(() => generateCalendarDays(currentYear, currentMonth), [currentYear, currentMonth]);

  // Fetch available slots when date or staff changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) {
        setAvailableSlots([]);
        return;
      }

      setIsLoadingAvailability(true);
      setError(null);
      setSelectedTime(null);

      const bookingDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

      try {
        const params = new URLSearchParams({
          businessId: booking.business_id,
          serviceId: booking.service_id,
          date: bookingDate
        });
        if (selectedStaff) {
          params.set('staffId', selectedStaff);
        }
        const response = await fetch(`/api/availability?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }

        const data = await response.json();
        // Convert 24-hour slots to 12-hour format
        const slots12h = data.slots.map(convertTo12Hour);
        setAvailableSlots(slots12h);
      } catch (err) {
        console.error('Availability fetch error:', err);
        setError('Failed to load available time slots');
        setAvailableSlots([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, currentMonth, currentYear, selectedStaff, booking.business_id, booking.service_id]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime || !selectedStaff) {
      setError("Please select a date, time, and staff member");
      return;
    }

    setLoading(true);
    setError(null);

    // Convert 12-hour format back to 24-hour
    const time24 = convertTo24Hour(selectedTime);
    const newDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

    const result = await rescheduleBookingAction({
      bookingId: booking.id,
      newDate,
      newTime: time24,
      staffId: selectedStaff
    });

    if (result.success) {
      setSuccess(true);
      setLoading(false);
      // Auto-close after 2 seconds to show success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(result.error || "Failed to reschedule booking");
      setLoading(false);
    }
  };

  const groupedSlots = useMemo(() => groupTimeSlots(availableSlots), [availableSlots]);

  // Format current appointment date/time
  const currentDateTime = formatTbilisi(booking.appointment_datetime, "EEEE, MMM d 'at' h:mm a");

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8 overflow-y-auto"
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-modal-title"
    >
      {/* Stitch Design: reschedule_booking_rigify */}
      <div
        ref={modalRef}
        className="bg-surface border border-white/10 max-w-5xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <button
            ref={firstFocusableRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex items-center text-primary hover:opacity-80 transition-opacity"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 id="reschedule-modal-title" className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary tracking-tight">
            Reschedule Booking
          </h1>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Success Message */}
          {success && (
            <div className="flex flex-col items-center justify-center py-12" data-testid="reschedule-success">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-green-500 text-[48px]">check_circle</span>
              </div>
              <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-2">
                Booking Rescheduled Successfully
              </h2>
              <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant text-center max-w-md">
                Your appointment has been rescheduled. Check your bookings for the updated details.
              </p>
            </div>
          )}

          {/* Booking Form (hidden when success) */}
          {!success && (
            <>
          {/* Current Booking Context */}
          <div className="p-6 bg-surface-container-low border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-muted-gold uppercase bg-surface-container-highest px-2 py-1">
                Current Appointment
              </span>
            </div>
            <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-2">
              {booking.services.name}
            </h2>
            <div className="flex items-center gap-2 text-on-surface-variant mb-4">
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span className="font-hanken text-[16px] leading-[1.5]">{booking.businesses.name}</span>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase">{currentDateTime}</span>
              </div>
            </div>
          </div>

          {/* Staff Selection */}
          {staff.length > 0 && (
            <div>
              <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase block mb-3">
                Select Staff Member
              </label>
              <select
                data-testid="reschedule-staff-select"
                value={selectedStaff ?? ""}
                onChange={(e) => setSelectedStaff(e.target.value || null)}
                className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none cursor-pointer transition-colors font-hanken text-[14px]"
                required
              >
                <option value="" disabled>Choose your staff member...</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase text-primary flex items-center gap-2">
                  <span className="w-4 h-px bg-primary"></span>
                  Select New Date
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                    aria-label="Previous month"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                    aria-label="Next month"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="bg-surface-container border border-white/5 p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 text-center mb-4">
                  {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day, idx) => (
                    <div
                      key={day}
                      className={`font-mono text-[10px] leading-[1] tracking-[0.2em] pb-2 ${
                        idx === 6 ? "text-error/60" : "text-on-surface-variant"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayObj, index) => (
                    <button
                      key={`day-${index}`}
                      type="button"
                      onClick={() => !dayObj.disabled && setSelectedDate(dayObj.day!)}
                      disabled={dayObj.disabled || !dayObj.day}
                      className={`aspect-square flex items-center justify-center font-mono text-[12px] transition-all ${
                        selectedDate === dayObj.day
                          ? "bg-primary text-background font-bold border border-primary"
                          : dayObj.disabled || !dayObj.day
                          ? "text-on-surface-variant/20 cursor-not-allowed"
                          : "border border-transparent hover:border-primary/30"
                      }`}
                      data-testid={dayObj.day ? `calendar-day-${dayObj.day}` : undefined}
                    >
                      {dayObj.day || ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-6">
              <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase text-primary flex items-center gap-2">
                <span className="w-4 h-px bg-primary"></span>
                Available Slots
              </h3>

              {!selectedDate ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] mb-4 block opacity-30">calendar_month</span>
                  <p className="font-hanken text-[14px] leading-[1.5]">Select a date to see available times</p>
                </div>
              ) : isLoadingAvailability ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
                  <p className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant">Loading available slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] mb-4 block opacity-30">event_busy</span>
                  <p className="font-hanken text-[14px] leading-[1.5]">No available slots for this date</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Morning */}
                  {groupedSlots.morning.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-on-surface-variant uppercase mb-4">
                        Morning
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {groupedSlots.morning.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`h-12 font-mono text-[12px] transition-all ${
                              selectedTime === slot
                                ? "border border-primary bg-primary/10 text-primary font-bold"
                                : "border border-white/10 text-on-surface hover:border-primary hover:text-primary"
                            }`}
                            data-testid={`time-slot-${generateTimeSlotTestId(slot)}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afternoon */}
                  {groupedSlots.afternoon.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-on-surface-variant uppercase mb-4">
                        Afternoon
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {groupedSlots.afternoon.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`h-12 font-mono text-[12px] transition-all ${
                              selectedTime === slot
                                ? "border border-primary bg-primary/10 text-primary font-bold"
                                : "border border-white/10 text-on-surface hover:border-primary hover:text-primary"
                            }`}
                            data-testid={`time-slot-${generateTimeSlotTestId(slot)}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evening */}
                  {groupedSlots.evening.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-on-surface-variant uppercase mb-4">
                        Evening
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {groupedSlots.evening.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`h-12 font-mono text-[12px] transition-all ${
                              selectedTime === slot
                                ? "border border-primary bg-primary/10 text-primary font-bold"
                                : "border border-white/10 text-on-surface hover:border-primary hover:text-primary"
                            }`}
                            data-testid={`time-slot-${generateTimeSlotTestId(slot)}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-error/10 border border-error/30 text-error font-mono text-[12px] tracking-[0.15em]">
              {error}
            </div>
          )}
          </>
          )}
        </div>

        {/* Footer Actions */}
        {!success && (
        <div className="px-6 py-4 border-t border-white/10 bg-surface-container">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="hidden md:block">
              {selectedDate && selectedTime ? (
                <div>
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-on-surface-variant uppercase">
                    New Appointment Selection
                  </p>
                  <p className="font-hanken text-[16px] leading-[1.5] text-primary font-bold">
                    {MONTH_NAMES[currentMonth]} {selectedDate}, {currentYear} @ {selectedTime}
                  </p>
                </div>
              ) : (
                <p className="font-mono text-[12px] text-on-surface-variant">
                  Select a date and time to continue
                </p>
              )}
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                data-testid={`reschedule-cancel-btn-${booking.id}`}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 md:flex-none border border-white/10 text-on-surface font-mono text-[12px] tracking-[0.15em] uppercase py-3 px-8 hover:border-white/30 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                data-testid={`confirm-reschedule-btn-${booking.id}`}
                type="button"
                onClick={handleReschedule}
                disabled={loading || !selectedDate || !selectedTime || !selectedStaff}
                className="flex-1 md:flex-none bg-primary text-on-primary font-hanken text-[24px] leading-[1.3] font-semibold uppercase tracking-tight px-12 py-3 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(230,195,100,0.15)]"
              >
                {loading ? "Confirming..." : "Confirm New Time"}
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
