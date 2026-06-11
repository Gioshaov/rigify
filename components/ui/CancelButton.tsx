"use client";

import Link from "next/link";

interface CancelButtonProps {
  onClose?: () => void;
  fallbackHref: string;
  testId?: string;
}

export function CancelButton({ onClose, fallbackHref, testId }: CancelButtonProps) {
  const className = "flex-1 py-3 border border-white/10 text-on-surface hover:bg-surface-container-low transition-all text-center font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium";

  if (onClose) {
    return (
      <button
        type="button"
        onClick={onClose}
        className={className}
        data-testid={testId}
      >
        Cancel
      </button>
    );
  }

  return (
    <Link href={fallbackHref} className={className} data-testid={testId}>
      Cancel
    </Link>
  );
}
