'use client'

import Link from "next/link";
import { useState } from "react";
import { customerRegisterAction } from "./actions";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";

export default function CustomerRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [countryCode, setCountryCode] = useState("+995"); // Default Georgia
  const [phoneNumber, setPhoneNumber] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!acceptedTerms) {
      setError("You must accept the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await customerRegisterAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col px-margin-mobile py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-16">
        <Link data-testid="logo-link" href="/" className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase">
          RIGIFY
        </Link>
      </div>

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[552px]">
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-6">
            Elite Membership
          </p>
          <h1 className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-white mb-3">
            Create Account
          </h1>
          <p className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface-variant mb-12">
            Secure your invitation to the exclusive Rigify ecosystem.
          </p>

          {error && (
            <div data-testid="error-message" className="mb-8 p-4 border border-error bg-error/10">
              <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] text-error uppercase">
                ⚠️ {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                Full Name
              </label>
              <input
                data-testid="name-input"
                id="name"
                name="name"
                type="text"
                required
                placeholder="Alexander Sterling"
                className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                Email Address
              </label>
              <input
                data-testid="email-input"
                id="email"
                name="email"
                type="email"
                required
                placeholder="a.sterling@private.com"
                className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                Phone Number
              </label>
              <div className="flex gap-2">
                <CountryCodeSelect
                  testId="register-country-code-select"
                  value={countryCode}
                  onChange={setCountryCode}
                />
                <input
                  data-testid="phone-input"
                  id="phone"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9\s]/g, ""))}
                  placeholder="555 123 456"
                  className="flex-1 min-w-0 bg-surface-container border border-white/10 focus:border-primary px-4 py-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
                />
              </div>
              {/* Combined value submitted via FormData (name="phone"), e.g. "+995 555123456".
                  Strip any internal spaces the user typed so the stored value stays consistent. */}
              <input type="hidden" name="phone" value={phoneNumber ? `${countryCode} ${phoneNumber.replace(/\s/g, "")}` : ""} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                Secure Password
              </label>
              <div className="relative">
                <input
                  data-testid="password-input"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••"
                  className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-4 pr-12 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
                />
                <button
                  data-testid="toggle-password-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                data-testid="terms-checkbox"
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 border border-white/10 bg-surface-container accent-primary cursor-pointer"
              />
              <label htmlFor="terms" className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant cursor-pointer">
                I accept the{" "}
                <Link data-testid="terms-link" href="/terms" className="text-primary hover:text-primary-container transition-colors">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link data-testid="privacy-link" href="/privacy" className="text-primary hover:text-primary-container transition-colors">
                  Privacy Policy
                </Link>
                {" "}governing this marketplace.
              </label>
            </div>

            {/* Create Account Button */}
            <button
              data-testid="create-account-btn"
              type="submit"
              disabled={loading || !acceptedTerms}
              className="w-full bg-primary text-on-primary py-5 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-12 text-center font-hanken text-[16px] leading-[1.5] font-normal text-on-surface-variant">
            Already have an account?{" "}
            <Link data-testid="sign-in-link" href="/login" className="text-primary hover:text-primary-container transition-colors font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-16 pt-8 border-t border-white/5">
        <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
          © 2024 Rigify Digital
        </p>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[16px]">lock</span>
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
            Encrypted Access
          </p>
        </div>
      </div>
    </main>
  );
}
