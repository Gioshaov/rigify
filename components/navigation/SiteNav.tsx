'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/ui/UserMenu";
import { BrowseLink } from "./BrowseLink";

/**
 * Shared top + mobile navigation for the public marketplace pages
 * (`/`, `/businesses`, `/for-businesses`). The active link is derived from the
 * current pathname so each route highlights the right item without per-page
 * props, keeping the bar identical everywhere it renders.
 *
 * Out of scope by design: the studio page (`/businesses/[slug]`, which still
 * uses TopNav) and the marketing info pages (MarketingLayout) keep their own
 * navs — do not wire them here without widening scope.
 */
export function SiteNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isBrowse = pathname === "/businesses";
  const isForBusiness = pathname === "/for-businesses";

  const desktopLink = (active: boolean) =>
    `font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase transition-colors duration-200 ${
      active ? "text-primary" : "text-on-surface hover:text-primary"
    }`;

  const mobileLink = (active: boolean) =>
    `flex flex-col items-center justify-center transition-transform active:scale-95 ${
      active
        ? "text-primary border-t-2 border-primary pt-1"
        : "text-on-surface-variant opacity-60 hover:text-primary/80"
    }`;

  return (
    <>
      {/* Top Navigation (desktop) */}
      <header className="sticky top-0 w-full z-nav bg-surface border-b border-white/10">
        <div className="flex items-center justify-between h-16 px-margin-mobile md:px-margin-desktop">
          <Link
            data-testid="nav-logo"
            href="/"
            className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase"
          >
            RIGIFY
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link data-testid="nav-home" href="/" className={desktopLink(isHome)}>
              Home
            </Link>
            <BrowseLink testId="nav-browse" className={desktopLink(isBrowse)}>
              Browse
            </BrowseLink>
            <Link data-testid="nav-for-business" href="/for-businesses" className={desktopLink(isForBusiness)}>
              For Business
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-nav flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
        <Link data-testid="mobile-nav-home" href="/" className={mobileLink(isHome)}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">Home</span>
        </Link>
        <BrowseLink testId="mobile-nav-browse" className={mobileLink(isBrowse)}>
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">Browse</span>
        </BrowseLink>
        <Link data-testid="mobile-nav-business" href="/for-businesses" className={mobileLink(isForBusiness)}>
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">Business</span>
        </Link>
      </nav>
    </>
  );
}
