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
 * @returns End time in HH:MM format (e.g., "15:30")
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMins = totalMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
}
