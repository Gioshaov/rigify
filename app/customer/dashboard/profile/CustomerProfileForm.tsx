"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatTbilisi } from "@/lib/utils/datetime";

type Action = (formData: FormData) => Promise<{ error?: string; success?: boolean } | void>;

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
}

export function CustomerProfileForm({
  action,
  customer,
  bookingCount,
}: {
  action: Action;
  customer: Customer;
  bookingCount: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format member since date in Tbilisi timezone
  const memberSince = formatTbilisi(customer.created_at, "MMMM yyyy");

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Sign out failed:", signOutError);
    }
    router.push("/login");
  };

  // Cleanup success timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-16">
      {/* Stitch Design: Profile Header */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 bg-surface-container border border-white/10">
        {/* Avatar Placeholder */}
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 border-2 border-primary/20 p-1">
            <div className="w-full h-full bg-surface flex items-center justify-center">
              <span className="font-hanken text-[64px] font-bold text-primary select-none">
                {customer.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Upload photo - coming soon"
            title="Upload photo coming soon"
            disabled
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col justify-center text-center md:text-left space-y-2">
          <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-on-surface uppercase">
            {customer.name}
          </h2>
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase">
            Member since {memberSince}
          </p>
          <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
            <span className="px-3 py-1 border border-white/10 text-on-surface-variant font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase">
              {bookingCount} {bookingCount === 1 ? "BOOKING" : "BOOKINGS"}
            </span>
          </div>
        </div>
      </section>

      {/* Profile Form */}
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setSuccess(false);
          // Clear any existing timeout
          if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
          }
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await action(formData);
            if (result && "error" in result) {
              setError(result.error || null);
            } else if (result && "success" in result && result.success) {
              setSuccess(true);
              // Clear password fields after successful save
              if (formRef.current) {
                const currentPwdInput = formRef.current.querySelector<HTMLInputElement>(
                  'input[name="current_password"]'
                );
                const newPwdInput = formRef.current.querySelector<HTMLInputElement>(
                  'input[name="new_password"]'
                );
                if (currentPwdInput) currentPwdInput.value = "";
                if (newPwdInput) newPwdInput.value = "";
              }
              // Use ref for timeout cleanup
              successTimeoutRef.current = setTimeout(() => setSuccess(false), 3000);
            }
          });
        }}
        className="space-y-12"
      >
        {/* Personal Details Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="h-px flex-grow bg-white/10"></span>
            <h3 className="font-mono text-[12px] leading-[1] tracking-[0.3em] font-medium text-on-surface-variant uppercase">
              Personal Details
            </h3>
            <span className="h-px flex-grow bg-white/10"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase ml-1"
              >
                Full Name
              </label>
              <input
                id="name"
                data-testid="profile-name-input"
                name="name"
                type="text"
                required
                defaultValue={customer.name}
                className="w-full bg-surface-container border border-white/10 focus:border-primary focus:ring-0 text-on-surface font-hanken text-[16px] leading-[1.5] py-4 px-4 transition-colors outline-none"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase ml-1"
              >
                Email Address
              </label>
              <input
                id="email"
                data-testid="profile-email-input"
                name="email"
                type="email"
                required
                defaultValue={customer.email}
                disabled
                className="w-full bg-surface-container-high border border-white/5 text-on-surface-variant font-hanken text-[16px] leading-[1.5] py-4 px-4 cursor-not-allowed opacity-60"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="phone"
                className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase ml-1"
              >
                Phone Number
              </label>
              <div className="flex">
                <span className="bg-surface-container-high border border-white/10 border-r-0 px-4 flex items-center text-on-surface-variant font-mono text-[12px]">
                  +995
                </span>
                <input
                  id="phone"
                  data-testid="profile-phone-input"
                  name="phone"
                  type="tel"
                  required
                  defaultValue={customer.phone.replace(/^\+?995/, "").trim()}
                  className="w-full bg-surface-container border border-white/10 focus:border-primary focus:ring-0 text-on-surface font-hanken text-[16px] leading-[1.5] py-4 px-4 transition-colors outline-none"
                  placeholder="555 123 456"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-8 pt-4">
          <div className="flex items-center gap-4">
            <span className="h-px flex-grow bg-white/10"></span>
            <h3 className="font-mono text-[12px] leading-[1] tracking-[0.3em] font-medium text-on-surface-variant uppercase">
              Security
            </h3>
            <span className="h-px flex-grow bg-white/10"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current Password */}
            <div className="space-y-2">
              <label
                htmlFor="current-password"
                className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase ml-1"
              >
                Current Password
              </label>
              <input
                id="current-password"
                data-testid="profile-current-password-input"
                name="current_password"
                type="password"
                className="w-full bg-surface-container border border-white/10 focus:border-primary focus:ring-0 text-on-surface font-hanken text-[16px] leading-[1.5] py-4 px-4 transition-colors outline-none"
                placeholder="••••••••••••"
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant uppercase ml-1"
              >
                New Password
              </label>
              <input
                id="new-password"
                data-testid="profile-new-password-input"
                name="new_password"
                type="password"
                className="w-full bg-surface-container border border-white/10 focus:border-primary focus:ring-0 text-on-surface font-hanken text-[16px] leading-[1.5] py-4 px-4 transition-colors outline-none placeholder:text-white/20"
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-error/10 border border-error/30 text-error font-mono text-[12px] tracking-[0.15em]">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-primary/10 border border-primary/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span className="text-primary font-mono text-[12px] tracking-[0.15em]">Profile Updated</span>
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-6 pt-10">
          <button
            data-testid="profile-save-btn"
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium py-6 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Save Changes</span>
                <span className="material-symbols-outlined text-sm">check_circle</span>
              </>
            )}
          </button>

          <div className="flex flex-col items-center gap-4">
            <button
              data-testid="profile-signout-btn"
              type="button"
              onClick={handleSignOut}
              className="text-on-surface-variant hover:text-error transition-colors font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium flex items-center gap-2 group"
            >
              <span className="material-symbols-outlined text-lg group-hover:text-error">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
