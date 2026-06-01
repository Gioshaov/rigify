import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const TBILISI_TZ = "Asia/Tbilisi";

export function formatTbilisi(date: Date | string, pattern = "yyyy-MM-dd HH:mm"): string {
  return formatInTimeZone(new Date(date), TBILISI_TZ, pattern);
}

// Combine a Tbilisi-local date (YYYY-MM-DD) + time (HH:mm) into a UTC Date.
export function combineLocalDateTime(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, TBILISI_TZ);
}
