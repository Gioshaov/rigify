"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-error/10 border-2 border-error flex items-center justify-center">
            <span aria-hidden="true" className="material-symbols-outlined text-error text-[48px]">
              error
            </span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="font-hanken text-[32px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
          Something Went Wrong
        </h1>
        <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant mb-8">
          We encountered an unexpected error. This has been logged and we'll look into it.
        </p>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 bg-surface-container border border-white/10 text-left">
            <p className="font-mono text-[10px] tracking-[0.15em] text-error uppercase mb-2">
              Development Error
            </p>
            <p className="font-mono text-[12px] text-on-surface-variant break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            data-testid="error-retry-btn"
            className="bg-primary text-on-primary px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            data-testid="error-home-link"
            className="border border-white/10 text-white px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-white/5 transition-colors inline-flex items-center justify-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
