/**
 * Calendar utility functions for booking UI components
 */

export type CalendarDay = {
  day: number | null;
  disabled: boolean;
};

/**
 * Generate calendar days for a given month
 * @param year - Full year (e.g., 2026)
 * @param month - Month index (0-11)
 * @returns Array of calendar days including leading empty cells
 *
 * Note: Uses browser's local timezone to determine "today". For Tbilisi-specific
 * booking logic, the component should pass a Tbilisi-aware date or add timezone
 * conversion here.
 */
export function generateCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: CalendarDay[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ day: null, disabled: true });
  }

  // Add actual days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    days.push({ day: i, disabled: isPast });
  }

  return days;
}

/**
 * Group time slots by period (morning/afternoon/evening)
 * @param slots - Array of time strings in 12-hour format (e.g., ["9:00 AM", "2:00 PM"])
 * @returns Object with slots grouped by period
 */
export function groupTimeSlots(slots: string[]): {
  morning: string[];
  afternoon: string[];
  evening: string[];
} {
  const morning: string[] = [];
  const afternoon: string[] = [];
  const evening: string[] = [];

  slots.forEach((slot) => {
    const [time, period] = slot.split(" ");
    const [hourStr] = time.split(":");
    const hour = parseInt(hourStr);

    // Convert to 24-hour for comparison
    let hour24 = hour;
    if (period === "PM" && hour !== 12) {
      hour24 = hour + 12;
    } else if (period === "AM" && hour === 12) {
      hour24 = 0;
    }

    if (hour24 < 12) {
      morning.push(slot);
    } else if (hour24 < 18) {
      afternoon.push(slot);
    } else {
      evening.push(slot);
    }
  });

  return { morning, afternoon, evening };
}

/**
 * Month names for calendar display
 */
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Weekday abbreviations for calendar headers
 */
export const WEEKDAY_NAMES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
