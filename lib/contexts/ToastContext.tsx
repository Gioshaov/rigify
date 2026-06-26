"use client";

import { createContext, useContext, useCallback, useRef, useState } from "react";
import { Toast, type ToastType } from "@/components/ui/Toast";

type ShowToast = (message: string, type?: ToastType, duration?: number) => void;

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

const ToastContext = createContext<ShowToast | null>(null);

/**
 * App-wide toast notifications. Renders a stacked, screen-reader-announced
 * region and exposes useToast() returning `showToast(message, type?, duration?)`
 * — replaces ad-hoc per-component toast state and the browser `alert()`.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback<ShowToast>((message, type = "success", duration = 3000) => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className="fixed bottom-8 right-8 z-[60] flex flex-col gap-3 items-end pointer-events-none"
        data-testid="toast-region"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={() => remove(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
