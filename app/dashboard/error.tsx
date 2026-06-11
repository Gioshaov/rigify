"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span aria-hidden="true" className="material-symbols-outlined text-error text-[64px]">
            error
          </span>
        </div>

        <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-3">
          Dashboard Error
        </h2>
        <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant mb-6">
          We couldn't load this dashboard section. Please try again or go back to the main dashboard.
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
            data-testid="dashboard-error-retry-btn"
            className="bg-primary text-on-primary px-6 py-3 font-mono text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-primary-container transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            data-testid="dashboard-error-home-link"
            className="border border-white/10 text-white px-6 py-3 font-mono text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-white/5 transition-colors"
          >
            Dashboard Home
          </Link>
        </div>
      </div>
    </div>
  );
}
