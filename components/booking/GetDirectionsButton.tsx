"use client";

import { openDirections } from "@/lib/utils/directions";

interface GetDirectionsButtonProps {
  latitude: number;
  longitude: number;
}

/**
 * Opens the device's maps app with driving directions to the given coordinates
 * (shared logic in lib/utils/directions). Pure URL deep-linking — no API calls.
 */
export function GetDirectionsButton({ latitude, longitude }: GetDirectionsButtonProps) {
  const handleClick = () => {
    openDirections(latitude, longitude);
  };

  return (
    <button
      type="button"
      data-testid="get-directions-button"
      onClick={handleClick}
      className="w-full mt-6 py-4 flex items-center justify-center gap-3 bg-surface border border-white/10 rounded-[4px] text-primary font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase hover:border-primary hover:bg-surface-container-high transition-colors active:scale-95"
    >
      <span className="material-symbols-outlined text-[18px]">directions</span>
      Get Directions
    </button>
  );
}
