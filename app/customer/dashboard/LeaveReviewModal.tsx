"use client";

import { useState, useRef, useEffect } from "react";
import { submitReviewAction } from "./review-actions";

type LeaveReviewModalProps = {
  bookingId: string;
  businessName: string;
  serviceName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function LeaveReviewModal({
  bookingId,
  businessName,
  serviceName,
  onClose,
  onSuccess,
}: LeaveReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTab);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
    };
  }, [loading, onClose]);

  const handleSubmit = async () => {
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);

    const result = await submitReviewAction({
      bookingId,
      rating,
      comment,
    });

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || "Failed to submit review");
      setLoading(false);
    }
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-surface border border-white/10 max-w-lg w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="review-modal-title"
          className="font-hanken text-[28px] leading-[1.2] font-semibold text-primary mb-2"
        >
          Leave a Review
        </h3>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface-variant mb-6">
          How was your experience with <span className="text-white font-semibold">{serviceName}</span> at{" "}
          <span className="text-white font-semibold">{businessName}</span>?
        </p>

        {/* Star Rating */}
        <div className="mb-6">
          <label className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-3">
            Rating *
          </label>
          <div className="flex items-center gap-2">
            {stars.map((star) => (
              <button
                key={star}
                type="button"
                data-testid={`star-${star}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={loading}
                className="transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <span
                  className={`material-symbols-outlined text-[36px] ${
                    star <= (hoverRating || rating) ? "text-primary" : "text-white/10"
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 font-hanken text-[18px] font-semibold text-primary">
                {rating} {rating === 1 ? "star" : "stars"}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label
            htmlFor="review-comment"
            className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-3"
          >
            Comment (Optional)
          </label>
          <textarea
            id="review-comment"
            data-testid="review-comment-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
            placeholder="Share your experience..."
            maxLength={1000}
            rows={4}
            className="w-full bg-surface-container border border-white/10 p-4 font-hanken text-[16px] leading-[1.5] text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
          />
          <p className="mt-2 font-mono text-[10px] tracking-[0.15em] text-on-surface-variant text-right">
            {comment.length}/1000
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error/10 border border-error/30 text-error font-mono text-[12px] tracking-[0.15em]">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            data-testid="cancel-review-btn"
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-white/10 text-on-surface font-mono text-[12px] tracking-[0.15em] uppercase py-3 hover:border-white/30 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            ref={submitBtnRef}
            data-testid="submit-review-btn"
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 bg-primary text-on-primary font-mono text-[12px] tracking-[0.15em] uppercase py-3 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
