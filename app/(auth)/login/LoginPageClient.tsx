'use client'

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { loginAction } from "./actions";

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-background flex flex-col items-center justify-center px-margin-mobile py-16">
      {/* Logo & Tagline */}
      <div className="text-center mb-16">
        <Link data-testid="login-logo-link" href="/" className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-primary uppercase">
          RIGIFY
        </Link>
        <p className="font-mono text-[12px] leading-[1] tracking-[0.3em] text-on-surface-variant uppercase mt-2">
          The Artisan Collective
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[594px] bg-surface-container border border-white/5 border-l-4 border-l-primary p-12">
        <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-white mb-3">
          Welcome Back
        </h1>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface-variant mb-12">
          Enter your credentials to access your private salon concierge.
        </p>

        {error && (
          <div data-testid="login-error-message" className="mb-6 p-4 border border-error bg-error/10">
            <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] text-error uppercase">
              ⚠️ {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {redirect && <input type="hidden" name="redirect" value={redirect} />}
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
                data-testid="login-email-input"
                id="email"
                name="email"
                type="email"
                required
                placeholder="curated@rigify.com"
                className="w-full bg-background border border-white/10 focus:border-primary pl-14 pr-4 py-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[20px]">
                lock
              </span>
              <input
                data-testid="login-password-input"
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-background border border-white/10 focus:border-primary pl-14 pr-4 py-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
              />
            </div>
            {/* Forgot (left) / Register (right) */}
            <div className="flex justify-between items-center mt-3">
              <Link data-testid="login-forgot-password-link" href="/forgot-password" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase hover:text-primary-container transition-colors">
                Forgot?
              </Link>
              <Link data-testid="login-sign-up-link" href="/customer-register" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase hover:text-primary-container transition-colors">
                Register
              </Link>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            data-testid="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-5 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? "Signing In..." : "Sign In"}
            {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
            Or Connect With
          </span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* SSO Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            data-testid="login-google-sso-btn"
            type="button"
            className="border border-white/10 py-4 flex items-center justify-center gap-3 hover:bg-white/5 transition-colors active:scale-[0.98]"
          >
            <span className="font-hanken text-[18px] leading-[1.3] font-semibold text-white tracking-wider">GOOGLE</span>
          </button>
          <button
            data-testid="login-apple-sso-btn"
            type="button"
            className="border border-white/10 py-4 flex items-center justify-center gap-3 hover:bg-white/5 transition-colors active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-white text-[20px]">grid_view</span>
            <span className="font-hanken text-[18px] leading-[1.3] font-semibold text-white tracking-wider">APPLE</span>
          </button>
        </div>
      </div>
    </main>
  );
}
