'use client'

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-margin-mobile">
      {/* Diagonal Pattern Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            ${''/* Gold lines */}rgba(230, 195, 100, 0.2) 10px,
            rgba(230, 195, 100, 0.2) 11px
          )`
        }} />
      </div>

      {/* Header */}
      <div className="absolute top-8 left-0 right-0 px-margin-mobile flex justify-between items-center">
        <Link data-testid="logo-link" href="/" className="font-hanken text-[24px] leading-[1.2] font-bold text-primary tracking-tighter uppercase">
          RIGIFY
        </Link>
        <Link data-testid="support-link" href="#" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[16px]">help</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase">
            Support
          </span>
        </Link>
      </div>

      {/* Reset Card */}
      <div className="relative w-full max-w-[400px] bg-surface-container border border-white/10 p-12">
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 border border-primary mx-auto mb-6 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-4">
              Email Sent
            </p>
            <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-4">
              Check Your Inbox
            </h2>
            <p className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant mb-8">
              We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
            <Link
              data-testid="back-to-login-btn-success"
              href="/login"
              className="flex items-center justify-center gap-2 text-primary hover:text-primary-container transition-colors font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-4 text-center">
              Security & Recovery
            </p>
            <h1 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-3 text-center">
              Forgot Password
            </h1>
            <p className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant mb-10 text-center">
              Enter your email to receive a password reset link.
            </p>

            {error && (
              <div data-testid="error-message" className="mb-6 p-4 border border-error bg-error/10">
                <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] text-error uppercase text-center">
                  ⚠️ {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[20px]">
                    mail
                  </span>
                  <input
                    data-testid="email-input"
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="e.g. artisan@rigify.com"
                    className="w-full bg-background border border-white/10 focus:border-primary pl-14 pr-4 py-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
                  />
                </div>
              </div>

              {/* Send Reset Link Button */}
              <button
                data-testid="send-reset-link-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? "Sending..." : "Send Reset Link"}
                {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>
            </form>

            {/* Back to Login Link */}
            <Link
              data-testid="back-to-login-link"
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
