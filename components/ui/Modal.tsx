"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Portal } from "@/components/ui/Portal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeButtonTestId?: string;
}

export function Modal({ isOpen, onClose, children, closeButtonTestId }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal testId="modal-portal">
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-background w-full max-w-[800px] mx-4 p-12 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          data-testid={closeButtonTestId}
          onClick={onClose}
          className="absolute top-6 right-6 z-10 text-zinc-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
        {children}
      </div>
    </div>
    </Portal>
  );
}
