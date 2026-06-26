import Link from "next/link";
import { UserMenu } from "@/components/ui/UserMenu";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <a data-testid="marketing-skip-to-main-link" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-white/10">
        <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link data-testid="logo-link" href="/" className="font-hanken text-[24px] leading-[1.2] font-bold text-primary tracking-tighter uppercase">
            RIGIFY
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link data-testid="nav-browse" href="/businesses" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant hover:text-primary transition-colors uppercase">
              Browse Studios
            </Link>
            <Link data-testid="nav-about" href="/about" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant hover:text-primary transition-colors uppercase">
              About
            </Link>
            <Link data-testid="nav-help" href="/help" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant hover:text-primary transition-colors uppercase">
              Help
            </Link>
            <Link data-testid="nav-contact" href="/contact" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant hover:text-primary transition-colors uppercase">
              Contact
            </Link>
          </div>

          <UserMenu />
        </nav>
      </header>

      {/* Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <Link data-testid="footer-brand-logo" href="/" className="font-hanken text-[24px] leading-[1.2] font-bold text-primary tracking-tighter uppercase mb-3 inline-block">
                RIGIFY
              </Link>
              <p className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant">
                The Artisan Collective
              </p>
            </div>

            {/* For Customers */}
            <nav aria-label="Customer links">
              <h3 className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-4">
                For Customers
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link data-testid="footer-browse" href="/businesses" className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant hover:text-primary transition-colors">
                    Browse Studios
                  </Link>
                </li>
                <li>
                  <Link data-testid="footer-customer-login" href="/login" className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant hover:text-primary transition-colors">
                    My Bookings
                  </Link>
                </li>
                <li>
                  <Link data-testid="footer-help" href="/help" className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant hover:text-primary transition-colors">
                    Help & FAQ
                  </Link>
                </li>
              </ul>
            </nav>

            {/* For Businesses */}
            <nav aria-label="Business links">
              <h3 className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-4">
                For Businesses
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link data-testid="footer-business-login" href="/login" className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant hover:text-primary transition-colors">
                    Business Dashboard
                  </Link>
                </li>
                <li>
                  <Link data-testid="footer-contact" href="/contact" className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant hover:text-primary transition-colors">
                    Contact Sales
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Company */}
            <nav aria-label="Company links">
              <h3 className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link data-testid="footer-about" href="/about" className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link data-testid="footer-terms" href="/terms" className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link data-testid="footer-privacy" href="/privacy" className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] text-on-surface-variant uppercase">
              © 2026 Rigify. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                data-testid="footer-instagram"
                href="https://instagram.com/rigify.ge"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">photo_camera</span>
              </a>
              <a
                data-testid="footer-facebook"
                href="https://facebook.com/rigify.ge"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">public</span>
              </a>
              <a
                data-testid="footer-email"
                href="mailto:support@rigify.ge"
                aria-label="Email"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">mail</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
