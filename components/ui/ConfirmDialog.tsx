"use client";

import { useEffect, useRef } from "react";
import { Portal } from "@/components/ui/Portal";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive actions colour the confirm button with the error token. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Prefix for the dialog's data-testid attributes (e.g. "delete-service"). */
  testId?: string;
}

/**
 * Compact yes/no confirmation dialog matching the Rigify design system.
 * Driven imperatively via the ConfirmProvider / useConfirm() hook — most call
 * sites should not render this directly.
 *
 * Accessibility: role="alertdialog", focuses the confirm button on open, traps
 * Tab focus between the two buttons, returns focus to the trigger on close, and
 * cancels on Escape or backdrop click.
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
  testId = "confirm-dialog",
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember what had focus so we can restore it when the dialog closes.
    // (Focus-on-open is handled by autoFocus on the confirm button, which is
    // reliable through the Portal's async mount where a manual focus() races.)
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      // Trap focus: only the two buttons are focusable, so cycle between them.
      if (e.key === "Tab") {
        const first = cancelRef.current;
        const last = confirmRef.current;
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <Portal testId="confirm-dialog-portal">
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-modal p-4"
      onClick={onCancel}
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
            ref={cancelRef}
            type="button"
            data-testid={`${testId}-cancel-btn`}
            onClick={onCancel}
            className="flex-1 py-3 border border-white/10 text-on-surface hover:bg-surface-container-low transition-all font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the primary action when the dialog opens
            autoFocus
            type="button"
            data-testid={`${testId}-confirm-btn`}
            onClick={onConfirm}
            className={`flex-1 py-3 transition-all font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold active:scale-[0.98] ${
              destructive
                ? "bg-error text-background hover:brightness-110"
                : "bg-primary text-on-primary hover:bg-primary-container"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
