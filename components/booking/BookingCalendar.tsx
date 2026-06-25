"use client";

import { generateCalendarDays, MONTH_NAMES } from "@/lib/utils/calendar";

interface BookingCalendarProps {
  currentMonth: number;
  currentYear: number;
  /** Selected day-of-month (within currentMonth/currentYear), or null. */
  selectedDate: number | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (day: number) => void;
}

/**
 * Rigify month-grid date picker. Pure presentation — month navigation and the
 * selected day are controlled by the parent (so the parent can build the booking
 * date and fetch availability). Styling/testids preserved from the original
 * inline booking calendar.
 */
export function BookingCalendar({
  currentMonth,
  currentYear,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: BookingCalendarProps) {
  const calendarDays = generateCalendarDays(currentYear, currentMonth);

  const now = new Date();
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();
  const todayDate = now.getDate();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-hanken text-[18px] leading-[1.3] font-semibold text-pure-white">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            data-testid="calendar-prev-month"
            onClick={onPrevMonth}
            className="w-9 h-9 flex items-center justify-center bg-surface border border-white/10 rounded-[4px] text-on-surface hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            type="button"
            data-testid="calendar-next-month"
            onClick={onNextMonth}
            className="w-9 h-9 flex items-center justify-center bg-surface border border-white/10 rounded-[4px] text-on-surface hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 text-center border-b border-white/10 mb-4">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
          <div
            key={day}
            className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant pb-3"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div data-testid="booking-calendar" className="grid grid-cols-7 gap-2">
        {calendarDays.map((dayObj, index) => {
          if (!dayObj.day) {
            return <div key={index} aria-hidden="true" className="aspect-square" />;
          }
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayObj.day).padStart(2, "0")}`;
          const isToday = isCurrentMonth && dayObj.day === todayDate;
          const isSelected = dayObj.day === selectedDate;
          return (
            <button
              key={index}
              type="button"
              data-testid={`calendar-day-${dateStr}`}
              disabled={dayObj.disabled}
              onClick={() => !dayObj.disabled && onSelectDate(dayObj.day as number)}
              className={`aspect-square flex items-center justify-center font-mono text-[13px] leading-[1] tracking-[0.1em] font-medium border rounded-[4px] transition-all ${
                dayObj.disabled
                  ? "bg-transparent text-on-surface-variant/30 border-transparent cursor-not-allowed"
                  : isSelected
                  ? "bg-primary text-background border-primary font-semibold cursor-pointer"
                  : isToday
                  ? "bg-surface text-on-surface border-primary cursor-pointer hover:bg-surface-container-high"
                  : "bg-surface text-on-surface border-white/10 cursor-pointer hover:bg-surface-container-high hover:border-primary"
              }`}
            >
              {dayObj.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
