import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav, type SiteNavLink } from "@/components/navigation/SiteNav";

const MARKETING_LINKS: SiteNavLink[] = [
  { href: "/businesses", label: "Browse Studios", mobileLabel: "Browse", testId: "nav-browse", mobileTestId: "mobile-nav-browse", icon: "search", browse: true },
  { href: "/about", label: "About", testId: "nav-about", mobileTestId: "mobile-nav-about", icon: "info" },
  { href: "/help", label: "Help", testId: "nav-help", mobileTestId: "mobile-nav-help", icon: "help" },
  { href: "/contact", label: "Contact", testId: "nav-contact", mobileTestId: "mobile-nav-contact", icon: "mail" },
];

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <a data-testid="marketing-skip-to-main-link" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteNav links={MARKETING_LINKS} />

      {/* Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      <SiteFooter className="mb-20 md:mb-0" />
    </div>
  );
}
