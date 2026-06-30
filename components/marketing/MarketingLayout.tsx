import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/navigation/SiteNav";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <a data-testid="marketing-skip-to-main-link" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />

      {/* Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      <SiteFooter className="mb-20 md:mb-0" />
    </div>
  );
}
