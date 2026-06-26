"use client";

import { useEffect, useRef } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  id: number;
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

/**
 * A single toast pill. Positioning is owned by the ToastProvider's stack
 * region — render toasts via useToast() rather than mounting this directly.
 */
export function Toast({
  id,
  message,
  type = "success",
  onClose,
  duration = 3000,
}: ToastProps) {
  // Keep the latest onClose in a ref so the dismiss timer runs exactly once for
  // the toast's lifetime — depending on onClose would restart the countdown
  // every time the provider re-renders (e.g. when another toast is added).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const icons = {
    success: "check_circle",
    error: "error",
    info: "info",
  };

  const colors = {
    success: "border-primary bg-primary/10 text-primary",
    error: "border-error bg-error/10 text-error",
    info: "border-on-surface-variant bg-surface-container text-on-surface",
  };

  return (
    <div
      className={`pointer-events-auto animate-slide-up flex items-center gap-3 px-6 py-4 border-2 min-w-[300px] max-w-md shadow-lg ${colors[type]}`}
      data-testid={`toast-notification-${id}`}
    >
      <span
        className="material-symbols-outlined text-[24px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
        aria-hidden="true"
      >
        {icons[type]}
      </span>
      <p className="font-hanken text-[14px] leading-[1.5] font-normal flex-1">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="opacity-60 hover:opacity-100 transition-opacity"
        data-testid={`close-toast-btn-${id}`}
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
      </button>
    </div>
  );
}
