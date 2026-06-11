'use client'

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { TBILISI_TZ } from "@/lib/utils/datetime";
import { MONTH_NAMES } from "@/lib/utils/calendar";
import { DayAppointments } from "./DayAppointments";

type Booking = {
  id: string;
  appointment_datetime: string;
  status: string;
  duration_minutes: number;
  services: { name: string } | { name: string }[];
  staff: { name: string } | { name: string }[] | null;
  customer_name: string;
};

type CalendarViewProps = {
  bookings: Booking[];
  businessId: string;
};

export function CalendarView({ bookings, businessId }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Generate calendar days
  function generateCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    // Previous month placeholders
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        day: i,
        isCurrentMonth: true,
        date: date,
        isToday: date.getTime() === today.getTime(),
      });
    }

    // Next month placeholders
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  }

  // Get bookings for a specific date (using Tbilisi timezone)
  function getBookingsForDate(date: Date): Booking[] {
    // Format both dates in Tbilisi timezone to avoid UTC shifts
    const dateStr = formatInTimeZone(date, TBILISI_TZ, 'yyyy-MM-dd');
    return bookings.filter(b => {
      const bookingDate = formatInTimeZone(new Date(b.appointment_datetime), TBILISI_TZ, 'yyyy-MM-dd');
      return bookingDate === dateStr;
    });
  }

  // Count bookings for a date
  function getBookingCount(date: Date): number {
    return getBookingsForDate(date).length;
  }

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

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setSelectedDate(date);
  };

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const selectedDayBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Calendar Grid */}
      <div className="lg:col-span-8">
        <div className="bg-surface-container border border-white/5 p-8">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary uppercase">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-primary/30 transition-colors"
                data-testid="prev-month-btn"
              >
                <span className="material-symbols-outlined text-primary">chevron_left</span>
              </button>
              <button
                onClick={handleNextMonth}
                className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-primary/30 transition-colors"
                data-testid="next-month-btn"
              >
                <span className="material-symbols-outlined text-primary">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center">
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayObj, index) => {
              const bookingCount = getBookingCount(dayObj.date);
              const isSelected = selectedDate?.getTime() === dayObj.date.getTime();

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(dayObj.date, dayObj.isCurrentMonth)}
                  disabled={!dayObj.isCurrentMonth}
                  className={`
                    aspect-square flex flex-col items-center justify-center border transition-all relative
                    ${
                      !dayObj.isCurrentMonth
                        ? "text-on-surface-variant/20 border-white/5 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary/10 border-primary text-primary cursor-pointer"
                        : dayObj.isToday
                        ? "border-primary text-primary cursor-pointer hover:bg-surface-variant"
                        : "text-on-surface border-white/5 hover:bg-surface-variant hover:border-primary/30 cursor-pointer"
                    }
                  `}
                  data-testid={`calendar-day-${dayObj.day}`}
                >
                  <span className="font-hanken text-[16px] leading-[1.5] font-normal">
                    {dayObj.day}
                  </span>
                  {dayObj.isCurrentMonth && bookingCount > 0 && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {bookingCount <= 3 ? (
                        Array.from({ length: bookingCount }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 ${isSelected ? 'bg-primary' : 'bg-muted-gold'}`}
                          />
                        ))
                      ) : (
                        <span className={`font-mono text-[8px] leading-[1] tracking-[0.2em] font-medium ${isSelected ? 'text-primary' : 'text-muted-gold'}`}>
                          {bookingCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-primary"></div>
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                Today
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted-gold"></div>
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                Has Bookings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Appointments Sidebar */}
      <div className="lg:col-span-4">
        <DayAppointments
          selectedDate={selectedDate}
          bookings={selectedDayBookings}
          onClose={() => setSelectedDate(null)}
        />
      </div>
    </div>
  );
}
