import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-surface-container border-2 border-white/10 flex items-center justify-center">
            <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-[48px]">
              search_off
            </span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-primary mb-4">
          404
        </h1>
        <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            data-testid="notfound-home-link"
            className="bg-primary text-on-primary px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/businesses"
            data-testid="notfound-browse-link"
            className="border border-white/10 text-white px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-white/5 transition-colors"
          >
            Browse Studios
          </Link>
        </div>

        {/* Help Link */}
        <div className="mt-8">
          <p className="font-mono text-[10px] tracking-[0.2em] text-on-surface-variant uppercase mb-2">
            Need Help?
          </p>
          <Link
            href="/help"
            data-testid="notfound-help-link"
            className="font-mono text-[11px] tracking-[0.15em] text-primary hover:text-primary-container transition-colors uppercase"
          >
            Visit Help Center →
          </Link>
        </div>
      </div>
    </div>
  );
}
