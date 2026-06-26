"use client";

import { useEffect, useRef } from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive actions colour the confirm button with the error token. */
  destructive?: boolean;
  /** When true, the confirm button shows a busy state and both buttons disable. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Prefix for the dialog's data-testid attributes (e.g. "delete-service"). */
  testId?: string;
}

/**
 * Compact yes/no confirmation dialog matching the Rigify design system.
 * Driven imperatively via the ConfirmProvider / useConfirm() hook — most call
 * sites should not render this directly.
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
  testId = "confirm-dialog",
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };

    document.addEventListener("keydown", handleEscape);
    // Focus the confirm action so the dialog is keyboard-operable immediately.
    confirmButtonRef.current?.focus();

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={() => !loading && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${testId}-title`}
        aria-describedby={message ? `${testId}-message` : undefined}
        data-testid={testId}
        className="bg-background border border-white/10 w-full max-w-[440px] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id={`${testId}-title`}
          data-testid={`${testId}-title`}
          className="font-hanken text-[22px] leading-[1.3] font-semibold text-on-surface mb-3"
        >
          {title}
        </h2>
        {message && (
          <p
            id={`${testId}-message`}
            className="font-hanken text-[15px] leading-[1.6] text-on-surface-variant mb-8"
          >
            {message}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            data-testid={`${testId}-cancel-btn`}
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 border border-white/10 text-on-surface hover:bg-surface-container-low transition-all font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            data-testid={`${testId}-confirm-btn`}
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 transition-all font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
              destructive
                ? "bg-error text-background hover:brightness-110"
                : "bg-primary text-on-primary hover:bg-primary-container"
            }`}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
