"use client";

import { useState, useTransition } from "react";

type Action = (formData: FormData) => Promise<{ error?: string; success?: boolean } | void>;

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export function CustomerProfileForm({ action, customer }: { action: Action; customer: Customer }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await action(formData);
          if (result && "error" in result) {
            setError(result.error || null);
          } else if (result && "success" in result && result.success) {
            setSuccess(true);
          }
        });
      }}
      className="bg-surface-container border border-white/5 p-8 space-y-8"
    >
      {/* Full Name */}
      <div>
        <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
          Full Name *
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[20px]">
            person
          </span>
          <input
            data-testid="profile-name-input"
            name="name"
            type="text"
            required
            defaultValue={customer.name}
            className="w-full bg-background border border-white/10 focus:border-primary pl-14 pr-4 py-4 text-on-surface placeholder:text-outline outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
            placeholder="Your full name"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
          Phone Number *
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[20px]">
            phone
          </span>
          <input
            data-testid="profile-phone-input"
            name="phone"
            type="tel"
            required
            defaultValue={customer.phone}
            className="w-full bg-background border border-white/10 focus:border-primary pl-14 pr-4 py-4 text-on-surface placeholder:text-outline outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
            placeholder="+995 555 123 456"
          />
        </div>
      </div>

      {/* Email (Disabled) */}
      <div>
        <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
          Email Address
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
            mail
          </span>
          <input
            data-testid="profile-email-input"
            name="email"
            type="email"
            required
            defaultValue={customer.email}
            disabled
            className="w-full bg-surface-container-low border border-white/5 pl-14 pr-4 py-4 text-text-secondary placeholder:text-outline outline-none font-hanken text-[16px] leading-[1.5] cursor-not-allowed opacity-60"
            placeholder="you@example.com"
          />
        </div>
        <p className="mt-2 flex items-start gap-2 text-text-secondary">
          <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
          <span className="font-hanken text-[14px] leading-[1.5] font-normal">
            Email cannot be changed for security reasons
          </span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 border border-error/20 bg-error/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
            <p className="font-hanken text-[14px] leading-[1.5] font-normal text-error" role="alert">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 border border-primary/20 bg-primary/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className="font-hanken text-[14px] leading-[1.5] font-normal text-primary" role="alert">
              Profile updated successfully
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        data-testid="profile-save-btn"
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-background py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-background border-t-transparent animate-spin"></div>
            Saving...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save Changes
          </>
        )}
      </button>
    </form>
  );
}
