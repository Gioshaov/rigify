"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createService } from "../actions";
import { Toast } from "@/components/ui/Toast";

interface NewServiceFormProps {
  businessId: string;
}

const CATEGORIES = [
  { id: "hair", label: "Hair" },
  { id: "beard", label: "Beard" },
  { id: "nails", label: "Nails" },
  { id: "massage", label: "Massage" },
  { id: "skincare", label: "Skincare" },
  { id: "other", label: "Other (Custom)" },
];

const DURATION_OPTIONS = [
  15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 210, 240,
];

export function NewServiceForm({ businessId }: NewServiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!name.trim()) {
      setError("Service name is required");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    if (category === "other" && !customCategory.trim()) {
      setError("Please enter a custom category name");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price (minimum ₾0)");
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum < 15) {
      setError("Duration must be at least 15 minutes");
      return;
    }

    // Submit form
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("custom_category", customCategory.trim());
      formData.append("price", price);
      formData.append("duration_minutes", duration);

      const result = await createService(businessId, formData);

      if (result.success) {
        setToast({
          message: result.message,
          type: "success",
        });
        // Redirect after short delay to show toast
        setTimeout(() => {
          router.push("/dashboard/services");
        }, 1500);
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Banner */}
        {error && (
          <div
            className="p-4 border border-error/20 bg-error/10"
            data-testid="form-error-banner"
          >
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

        {/* Service Name */}
        <div>
          <label
            htmlFor="name"
            className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
          >
            Service Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="name"
            data-testid="service-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Haircut, Beard Trim, Manicure"
            maxLength={100}
            className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
          >
            Description
          </label>
          <textarea
            id="description"
            data-testid="service-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description of the service"
            rows={3}
            maxLength={500}
            className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors font-hanken text-[16px] leading-[1.5] resize-none"
          />
          <p className="mt-2 font-mono text-[10px] leading-[1] tracking-[0.15em] text-on-surface-variant">
            {description.length}/500 characters
          </p>
        </div>

        {/* Category & Custom Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="category"
              className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
            >
              Category <span className="text-error">*</span>
            </label>
            <select
              id="category"
              data-testid="service-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer transition-colors"
              required
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {category === "other" && (
            <div>
              <label
                htmlFor="customCategory"
                className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
              >
                Custom Category <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="customCategory"
                data-testid="service-custom-category-input"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter category name"
                maxLength={50}
                className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
                required={category === "other"}
              />
            </div>
          )}
        </div>

        {/* Price & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="price"
              className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
            >
              Price (GEL) <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-hanken text-[18px] font-semibold">
                ₾
              </span>
              <input
                type="number"
                id="price"
                data-testid="service-price-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full bg-surface-container border border-white/10 focus:border-primary pl-10 pr-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="duration"
              className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3"
            >
              Duration <span className="text-error">*</span>
            </label>
            <select
              id="duration"
              data-testid="service-duration-select"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer transition-colors"
              required
            >
              {DURATION_OPTIONS.map((minutes) => {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                const label =
                  hours > 0
                    ? mins > 0
                      ? `${hours}h ${mins}m`
                      : `${hours}h`
                    : `${minutes}m`;
                return (
                  <option key={minutes} value={minutes}>
                    {label} ({minutes} minutes)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-white/10">
          <Link
            href="/dashboard/services"
            className="flex-1 py-3 border border-white/10 text-on-surface hover:bg-surface-container-low transition-all text-center font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium"
            data-testid="cancel-create-service-btn"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3 bg-primary text-background hover:bg-primary-fixed transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium flex items-center justify-center gap-2"
            data-testid="submit-create-service-btn"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent animate-spin rounded-full"></div>
                Creating Service...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                Create Service
              </>
            )}
          </button>
        </div>
      </form>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
