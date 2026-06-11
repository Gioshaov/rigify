/**
 * Time format conversion utilities
 */

/**
 * Convert 24-hour time to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export function convertTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMin = String(minutes).padStart(2, '0');
  return `${displayHour}:${displayMin} ${ampm}`;
}

/**
 * Convert 12-hour time with AM/PM to 24-hour format
 * @param time12 - Time in 12-hour format (e.g., "2:30 PM")
 * @returns Time in 24-hour format (e.g., "14:30")
 */
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

/**
 * Generate test ID-safe string from time slot
 * @param timeSlot - Time slot string (e.g., "2:30 PM")
 * @returns Kebab-case string for test IDs (e.g., "2-30-PM")
 */
export function generateTimeSlotTestId(timeSlot: string): string {
  return timeSlot.replace(/[: ]/g, '-');
}
