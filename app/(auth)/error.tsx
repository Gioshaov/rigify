"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span aria-hidden="true" className="material-symbols-outlined text-error text-[64px]">
            error
          </span>
        </div>

        <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-3">
          Authentication Error
        </h2>
        <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant mb-6">
          Something went wrong during authentication. Please try again or contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-surface-container border border-white/10 text-left">
            <p className="font-mono text-[10px] text-error mb-2">DEV ERROR:</p>
            <p className="font-mono text-[11px] text-on-surface-variant break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            data-testid="auth-error-retry-btn"
            className="bg-primary text-on-primary px-6 py-3 font-mono text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-primary-container transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/login"
            data-testid="auth-error-login-link"
            className="border border-white/10 text-white px-6 py-3 font-mono text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-white/5 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
