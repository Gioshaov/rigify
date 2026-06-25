/**
 * Human-facing confirmation code derived from a booking UUID.
 * Single source of truth — used by the bookings API (emails) and the
 * confirmation UI so the two can never drift.
 */
export function getConfirmationId(bookingId: string): string {
  return `RG-${bookingId.slice(0, 8).toUpperCase()}`;
}
