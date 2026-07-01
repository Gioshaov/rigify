'use client'

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if user has valid reset token (from URL hash)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Token exchanged successfully — user can now set password
          setIsReady(true);
        } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
          // No valid recovery session
          router.push('/login?error=invalid_reset_link');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password.length > 72) {
      setError("Password must be 72 characters or less");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        // Map known errors to user-friendly messages
        const friendlyError = updateError.message.includes('different from the old password')
          ? 'New password must be different from your current password'
          : updateError.message.includes('password')
          ? updateError.message
          : 'Failed to update password. Your reset link may have expired';
        setError(friendlyError);
        return;
      }

      // Sign out the recovery session explicitly
      await supabase.auth.signOut();

      setSuccess(true);

      // Redirect to login after 2 seconds
      redirectTimerRef.current = setTimeout(() => {
        router.push('/login');
      }, 2000);
    } finally {
      setLoading(false);
    }
  }

  // Show loading while waiting for auth state
  if (!isReady && !success) {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center px-margin-mobile">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p data-testid="reset-password-loading-msg" className="font-mono text-[12px] leading-[1] tracking-[0.15em] text-on-surface-variant uppercase">
            Verifying reset link...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background relative overflow-hidden flex items-center justify-center px-margin-mobile">
      {/* Diagonal Pattern Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(230, 195, 100, 0.2) 10px,
            rgba(230, 195, 100, 0.2) 11px
          )`
        }} />
      </div>

      {/* Header */}
      <div className="absolute top-8 left-0 right-0 px-margin-mobile flex justify-between items-center">
        <Link data-testid="reset-password-logo-link" href="/" className="font-hanken text-[24px] leading-[1.2] font-bold text-primary tracking-tighter uppercase">
          RIGIFY
        </Link>
        <a data-testid="reset-password-support-link" href="mailto:support@rigify.ge" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[16px]">help</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase">
            Support
          </span>
        </a>
      </div>

      {/* Reset Card */}
      <div className="relative w-full max-w-[480px] bg-surface-container border border-white/10 p-12">
        {success ? (
          <div data-testid="reset-password-success-msg" className="text-center" aria-live="polite">
            <div className="w-16 h-16 bg-primary/10 border border-primary mx-auto mb-6 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-4">
              Password Updated
            </p>
            <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-4">
              Success!
            </h2>
            <p className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant mb-8">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-4 text-center">
              Security & Recovery
            </p>
            <h1 className="font-hanken text-[32px] leading-[1.2] tracking-tighter font-bold text-white mb-3 text-center">
              Reset Password
            </h1>
            <p className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant mb-10 text-center">
              Choose a strong password for your account.
            </p>

            {error && (
              <div data-testid="reset-password-error-msg" className="mb-6 p-4 border border-error bg-error/10">
                <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] text-error uppercase text-center">
                  ⚠️ {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* New Password Field */}
              <div>
                <label htmlFor="password" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                  New Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[20px]">
                    lock
                  </span>
                  <input
                    data-testid="reset-password-password-input"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    className="w-full bg-background border border-white/10 focus:border-primary pl-14 pr-14 py-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <p className="mt-2 font-mono text-[10px] leading-[1.4] tracking-[0.1em] text-on-surface-variant">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[20px]">
                    lock
                  </span>
                  <input
                    data-testid="reset-password-confirm-password-input"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className="w-full bg-background border border-white/10 focus:border-primary pl-14 pr-14 py-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Reset Password Button */}
              <button
                data-testid="reset-password-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? "Updating..." : "Reset Password"}
                {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>
            </form>

            {/* Back to Login Link */}
            <Link
              data-testid="reset-password-back-to-login-link"
              href="/login"
              className="mt-10 flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
