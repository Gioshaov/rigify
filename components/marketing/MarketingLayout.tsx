import Link from "next/link";
import { UserMenu } from "@/components/ui/UserMenu";
import { SiteFooter } from "@/components/marketing/SiteFooter";

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
      <header className="sticky top-0 z-nav bg-surface border-b border-white/10">
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

      <SiteFooter />
    </div>
  );
}
