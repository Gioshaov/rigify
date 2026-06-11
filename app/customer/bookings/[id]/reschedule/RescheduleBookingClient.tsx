"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatTbilisi } from "@/lib/utils/datetime";
import { rescheduleBookingAction } from "@/app/customer/dashboard/actions";
import { generateCalendarDays, groupTimeSlots, MONTH_NAMES, WEEKDAY_NAMES } from "@/lib/utils/calendar";
import { convertTo12Hour, convertTo24Hour, generateTimeSlotTestId } from "@/lib/utils/time-format";

type RescheduleBookingClientProps = {
  booking: {
    id: string;
    appointment_datetime: string;
    business_id: string;
    service_id: string;
    staff_id: string | null;
    businesses: {
      name: string;
      address: string;
      city: string;
    };
    services: {
      name: string;
      duration_minutes: number;
    };
  };
  staff: Array<{ id: string; name: string; specialty: string | null }>;
};

export function RescheduleBookingClient({ booking, staff }: RescheduleBookingClientProps) {
  const router = useRouter();
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
      // Redirect back to booking details page
      router.push(`/customer/bookings/${booking.id}`);
    } else {
      setError(result.error || "Failed to reschedule booking");
      setLoading(false);
    }
  };

  const groupedSlots = useMemo(() => groupTimeSlots(availableSlots), [availableSlots]);

  // Pre-calculate formatted dates for render (efficiency)
  const formattedDate = useMemo(() =>
    formatTbilisi(booking.appointment_datetime, "EEEE, MMM d"),
    [booking.appointment_datetime]
  );

  const formattedStartTime = useMemo(() =>
    formatTbilisi(booking.appointment_datetime, "HH:mm"),
    [booking.appointment_datetime]
  );

  const formattedEndTime = useMemo(() => {
    const endDateTime = new Date(new Date(booking.appointment_datetime).getTime() + booking.services.duration_minutes * 60000);
    return formatTbilisi(endDateTime.toISOString(), "HH:mm");
  }, [booking.appointment_datetime, booking.services.duration_minutes]);

  return (
    <>
      {/* Stitch Design: design-assets/stitch_rigify/reschedule_booking_rigify/ */}
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Navigation */}
        <header
          data-testid="reschedule-booking-header"
          className="sticky top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface border-b border-white/10"
        >
          <button
            data-testid="back-btn"
            onClick={() => router.back()}
            className="flex items-center justify-center p-2 hover:bg-white/5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary tracking-tight">
            Reschedule Booking
          </h1>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </header>

        <main className="flex-1 max-w-container mx-auto w-full px-margin-mobile md:px-margin-desktop py-8 pb-32">
          {/* Current Booking Context */}
          <section className="mb-10">
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
                  <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase">
                    {formattedDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase">
                    {formattedStartTime} — {formattedEndTime}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Staff Selection (if multiple staff available) */}
          {staff.length > 1 && (
            <section className="mb-10">
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
                    {member.name} {member.specialty && `— ${member.specialty}`}
                  </option>
                ))}
              </select>
            </section>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calendar Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase text-primary flex items-center gap-2">
                  <span className="w-4 h-px bg-primary"></span>
                  Select New Date
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    data-testid="prev-month-btn"
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
                    data-testid="next-month-btn"
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
                  {WEEKDAY_NAMES.map((day, idx) => (
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
            </section>

            {/* Time Slot Picker */}
            <section className="space-y-6">
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
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                            data-testid={`time-slot-${generateTimeSlotTestId(slot)}`}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`h-12 font-mono text-[12px] transition-all ${
                              selectedTime === slot
                                ? "border border-primary bg-primary/10 text-primary font-bold"
                                : "border border-white/10 text-on-surface hover:border-primary hover:text-primary"
                            }`}
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
                            data-testid={`time-slot-${generateTimeSlotTestId(slot)}`}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`h-12 font-mono text-[12px] transition-all ${
                              selectedTime === slot
                                ? "border border-primary bg-primary/10 text-primary font-bold"
                                : "border border-white/10 text-on-surface hover:border-primary hover:text-primary"
                            }`}
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
                            data-testid={`time-slot-${generateTimeSlotTestId(slot)}`}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`h-12 font-mono text-[12px] transition-all ${
                              selectedTime === slot
                                ? "border border-primary bg-primary/10 text-primary font-bold"
                                : "border border-white/10 text-on-surface hover:border-primary hover:text-primary"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Detail Section */}
          <section className="mt-16 border-t border-white/10 pt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h4 className="font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase text-primary">
                  Why reschedule?
                </h4>
                <p className="text-on-surface-variant font-hanken text-[18px] leading-[1.6]">
                  We understand that plans change. Our rescheduling policy allows you to modify your booking up to 12 hours before the service at no additional cost.
                </p>
                <div className="flex items-center gap-4 text-primary">
                  <span className="material-symbols-outlined">info</span>
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase">Booking Policy applies</span>
                </div>
              </div>
              <div className="space-y-3 bg-surface-container border border-white/10 p-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                  <div>
                    <p className="font-hanken text-[16px] leading-[1.5] text-on-surface">
                      {booking.businesses.address}
                    </p>
                    <p className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant">
                      {booking.businesses.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="mt-8 p-4 bg-error/10 border border-error/30 text-error font-mono text-[12px] tracking-[0.15em]">
              {error}
            </div>
          )}
        </main>

        {/* Fixed Footer Action Bar */}
        <footer className="fixed bottom-0 left-0 w-full bg-surface border-t border-white/10 p-margin-mobile z-50">
          <div className="max-w-container mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="hidden md:block">
              {selectedDate && selectedTime ? (
                <>
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-on-surface-variant uppercase">
                    New Appointment Selection
                  </p>
                  <p className="font-hanken text-[16px] leading-[1.5] text-primary font-bold">
                    {MONTH_NAMES[currentMonth]} {selectedDate}, {currentYear} @ {selectedTime}
                  </p>
                </>
              ) : (
                <p className="font-mono text-[12px] text-on-surface-variant">
                  Select a date and time to continue
                </p>
              )}
            </div>
            <button
              data-testid="confirm-reschedule-btn"
              type="button"
              onClick={handleReschedule}
              disabled={loading || !selectedDate || !selectedTime || !selectedStaff}
              className="w-full md:w-auto px-12 py-5 bg-primary text-on-primary font-hanken text-[24px] leading-[1.3] font-semibold uppercase tracking-tight hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(230,195,100,0.15)]"
            >
              {loading ? "Confirming..." : "Confirm New Time"}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
