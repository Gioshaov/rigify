"use client";

import { useState, useEffect } from "react";
import { rescheduleBookingAction } from "./actions";

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

// Generate calendar days for current month
function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ day: null, disabled: true });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    days.push({ day: i, disabled: isPast });
  }

  return days;
}

export function RescheduleModal({ booking, staff, onClose }: RescheduleModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(booking.staff_id || "any");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
        const staffParam = selectedStaff && selectedStaff !== "any" ? `&staffId=${selectedStaff}` : '';
        const response = await fetch(
          `/api/availability?businessId=${booking.business_id}&serviceId=${booking.service_id}&date=${bookingDate}${staffParam}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }

        const data = await response.json();
        // Convert 24-hour slots to 12-hour format
        const slots12h = data.slots.map((slot24: string) => {
          const [hours, minutes] = slot24.split(':').map(Number);
          const ampm = hours >= 12 ? "PM" : "AM";
          const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
          const displayMin = String(minutes).padStart(2, '0');
          return `${displayHour}:${displayMin} ${ampm}`;
        });
        setAvailableSlots(slots12h);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setError('Failed to load available slots. Please try again.');
        setAvailableSlots([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, currentMonth, currentYear, selectedStaff, booking.business_id, booking.service_id]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  // Convert 12-hour time to 24-hour for submission
  const convertTo24Hour = (time12: string): string => {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return;

    setLoading(true);
    setError(null);

    const bookingDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const time24 = convertTo24Hour(selectedTime);

    const result = await rescheduleBookingAction({
      bookingId: booking.id,
      newDate: bookingDate,
      newTime: time24,
      staffId: selectedStaff,
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Failed to reschedule booking");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-y-auto py-8"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-surface border border-white/10 max-w-3xl w-full p-8 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-hanken text-[28px] leading-[1.3] font-semibold text-white mb-2">
          Reschedule Booking
        </h3>
        <p className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant mb-6">
          {booking.services.name} at <span className="text-primary font-semibold">{booking.businesses.name}</span>
        </p>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 text-error font-mono text-[12px] tracking-[0.15em]">
            {error}
          </div>
        )}

        {/* Staff Selection */}
        {staff.length > 0 && (
          <div className="mb-6">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase block mb-2">
              Select Staff Member
            </label>
            <select
              data-testid="reschedule-staff-select"
              value={selectedStaff ?? ""}
              onChange={(e) => setSelectedStaff(e.target.value || null)}
              className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer transition-colors font-hanken text-[14px]"
            >
              <option value="" disabled>Choose your staff member...</option>
              <option value="any">Any Available Staff</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Calendar */}
        <div className="mb-6">
          <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase block mb-3">
            Select Date
          </label>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-primary">chevron_left</span>
            </button>
            <span className="font-mono text-[14px] tracking-[0.15em] text-white uppercase">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-primary">chevron_right</span>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="text-center font-mono text-[10px] tracking-[0.2em] text-on-surface-variant uppercase py-2"
              >
                {day}
              </div>
            ))}
            {calendarDays.map((dayObj, index) => (
              <button
                key={index}
                type="button"
                disabled={!dayObj.day || dayObj.disabled}
                onClick={() => dayObj.day && setSelectedDate(dayObj.day)}
                className={`aspect-square flex items-center justify-center font-mono text-[14px] transition-all ${
                  !dayObj.day
                    ? "invisible"
                    : dayObj.disabled
                    ? "text-on-surface-variant/30 cursor-not-allowed"
                    : selectedDate === dayObj.day
                    ? "bg-primary text-background font-bold"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {dayObj.day}
              </button>
            ))}
          </div>
        </div>

        {/* Available Time Slots */}
        {selectedDate && (
          <div className="mb-6">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase block mb-3">
              Select Time
            </label>

            {isLoadingAvailability ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="font-mono text-[12px] tracking-[0.15em] text-on-surface-variant uppercase">
                  Loading available slots...
                </p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 bg-surface-container-low border border-white/5 p-6">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-3 block">
                  event_busy
                </span>
                <p className="font-mono text-[12px] tracking-[0.15em] text-on-surface-variant uppercase">
                  No available slots for this date
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`px-4 py-3 font-mono text-[12px] tracking-[0.15em] transition-all ${
                      selectedTime === slot
                        ? "bg-primary text-background font-bold"
                        : "bg-surface-container-low border border-white/10 text-white hover:border-primary/30"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            data-testid={`reschedule-cancel-btn-${booking.id}`}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-white/10 text-on-surface font-mono text-[12px] tracking-[0.15em] uppercase py-3 hover:border-white/30 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            data-testid={`confirm-reschedule-btn-${booking.id}`}
            type="button"
            onClick={handleReschedule}
            disabled={loading || !selectedDate || !selectedTime}
            className="flex-1 bg-primary text-background font-mono text-[12px] tracking-[0.15em] uppercase py-3 hover:bg-primary-fixed transition-colors disabled:opacity-50"
          >
            {loading ? "Rescheduling..." : "Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
