"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

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
      className="fixed bottom-8 right-8 z-50 animate-slide-up"
      data-testid="toast-notification"
    >
      <div
        className={`flex items-center gap-3 px-6 py-4 border-2 min-w-[300px] max-w-md shadow-lg ${colors[type]}`}
      >
        <span
          className="material-symbols-outlined text-[24px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icons[type]}
        </span>
        <p className="font-hanken text-[14px] leading-[1.5] font-normal flex-1">
          {message}
        </p>
        <button
          onClick={onClose}
          className="opacity-60 hover:opacity-100 transition-opacity"
          data-testid="close-toast-btn"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
  );
}
