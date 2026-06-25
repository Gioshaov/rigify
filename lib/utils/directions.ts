/**
 * Maps directions deep-linking — single source of truth.
 * iOS → Apple Maps; everything else (Android/desktop, and the safe default) →
 * Google Maps, which deep-links into the Maps app when installed and falls back
 * to the browser otherwise. Coordinate-based. Pure URL deep-linking — no API calls.
 */
export function getDirectionsUrl(latitude: number, longitude: number): string {
  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isIOS
    ? `https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

/** Open device maps directions to the coordinates in a new tab (noopener/noreferrer). */
export function openDirections(latitude: number, longitude: number): void {
  window.open(getDirectionsUrl(latitude, longitude), "_blank", "noopener,noreferrer");
}
