"use client";

import { useState, useTransition } from "react";
import { deleteService } from "@/app/dashboard/services/actions";

interface DeleteServiceModalProps {
  serviceName: string;
  serviceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteServiceModal({
  serviceName,
  serviceId,
  onClose,
  onSuccess,
}: DeleteServiceModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteService(serviceId);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div
        className="bg-surface-container border-2 border-error/30 max-w-md w-full p-8"
        data-testid="delete-service-modal"
      >
        {/* Icon */}
        <div className="w-16 h-16 bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-6">
          <span
            className="material-symbols-outlined text-error text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            warning
          </span>
        </div>

        {/* Title */}
        <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-pure-white text-center mb-3">
          Delete Service?
        </h2>

        {/* Message */}
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface-variant text-center mb-2">
          Are you sure you want to delete{" "}
          <span className="text-primary font-semibold">{serviceName}</span>?
        </p>
        <p className="font-mono text-[10px] leading-[1.4] tracking-[0.15em] uppercase text-on-surface-variant text-center mb-8">
          This action cannot be undone.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-error/20 bg-error/10">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px] mt-0.5">
                error
              </span>
              <p className="font-hanken text-[14px] leading-[1.5] text-error">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-3 border border-white/10 text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium"
            data-testid="cancel-delete-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 py-3 bg-error text-on-error hover:bg-error/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium flex items-center justify-center gap-2"
            data-testid="confirm-delete-btn"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-on-error border-t-transparent animate-spin rounded-full"></div>
                Deleting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">
                  delete
                </span>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
