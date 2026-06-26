import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const TBILISI_TZ = "Asia/Tbilisi";

export function formatTbilisi(date: Date | string, pattern = "yyyy-MM-dd HH:mm"): string {
  return formatInTimeZone(new Date(date), TBILISI_TZ, pattern);
}

// Combine a Tbilisi-local date (YYYY-MM-DD) + time (HH:mm) into a UTC Date.
export function combineLocalDateTime(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, TBILISI_TZ);
}

/**
 * Calculate end time given a start time and duration
 * @param startTime - Time in HH:MM format (e.g., "14:30")
 * @param durationMinutes - Duration in minutes (e.g., 60)
 * @returns Object with end time in HH:MM format and whether it crosses midnight
 */
export function calculateEndTime(startTime: string, durationMinutes: number): {
  time: string;
  crossesMidnight: boolean;
} {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const crossesMidnight = totalMinutes >= 24 * 60
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMins = totalMinutes % 60
  return {
    time: `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`,
    crossesMidnight
  }
}

// Convert 24-hour time (e.g. "14:30") to 12-hour with AM/PM (e.g. "2:30 PM").
export function convertTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMin = String(minutes).padStart(2, '0');
  return `${displayHour}:${displayMin} ${ampm}`;
}

// Convert 12-hour time with AM/PM (e.g. "2:30 PM") to 24-hour (e.g. "14:30").
export function convertTo24Hour(time12: string): string {
  const [time, period] = time12.split(" ");
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr);

  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, '0')}:${minuteStr}`;
}

// Kebab-case a time slot like "2:30 PM" → "2-30-PM" for use in test IDs.
export function generateTimeSlotTestId(timeSlot: string): string {
  return timeSlot.replace(/[: ]/g, '-');
}
