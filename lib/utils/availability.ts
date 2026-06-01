// A slot is unavailable if any existing booking overlaps with it.
// Overlap condition: existing.start < requested.end AND existing.end > requested.start.
// The old n8n implementation used exact time-match — that misses overlaps. This is the fix.

export function hasOverlap(
  existingStart: Date,
  existingEnd: Date,
  requestedStart: Date,
  requestedEnd: Date
): boolean {
  return existingStart < requestedEnd && existingEnd > requestedStart;
}

export interface BookingRange {
  appointment_datetime: string | Date;
  end_datetime: string | Date;
}

export function isSlotFree(
  existingBookings: BookingRange[],
  requestedStart: Date,
  requestedEnd: Date
): boolean {
  return !existingBookings.some((b) =>
    hasOverlap(
      new Date(b.appointment_datetime),
      new Date(b.end_datetime),
      requestedStart,
      requestedEnd
    )
  );
}
