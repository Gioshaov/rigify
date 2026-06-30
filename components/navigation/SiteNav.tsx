'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/ui/UserMenu";
import { BrowseLink } from "./BrowseLink";

export type SiteNavLink = {
  href: string;
  label: string;
  /** Mobile bottom-nav label; defaults to `label` (e.g. "For Business" → "Business"). */
  mobileLabel?: string;
  /** Desktop link test id. */
  testId: string;
  /** Mobile bottom-nav link test id. */
  mobileTestId: string;
  /** Material Symbols icon name for the mobile bottom nav. */
  icon: string;
  /** Render via BrowseLink (resets the marketplace view) instead of a plain Link. */
  browse?: boolean;
};

/** Marketplace link set — the default for `/`, `/businesses`, `/for-businesses`. */
const DEFAULT_LINKS: SiteNavLink[] = [
  { href: "/", label: "Home", testId: "nav-home", mobileTestId: "mobile-nav-home", icon: "home" },
  { href: "/businesses", label: "Browse", testId: "nav-browse", mobileTestId: "mobile-nav-browse", icon: "search", browse: true },
  { href: "/for-businesses", label: "For Business", mobileLabel: "Business", testId: "nav-for-business", mobileTestId: "mobile-nav-business", icon: "business_center" },
];

/**
 * Shared top + mobile navigation for the public pages. Defaults to the
 * marketplace link set (Home / Browse / For Business) used by `/`, `/businesses`
 * and `/for-businesses`; callers can pass a different `links` set (e.g.
 * MarketingLayout passes Browse Studios / About / Help / Contact). The active
 * link is derived from the current pathname so each route highlights the right
 * item without per-page props.
 *
 * Out of scope by design: the studio page (`/businesses/[slug]`) still uses TopNav.
 */
export function SiteNav({ links = DEFAULT_LINKS }: { links?: SiteNavLink[] }) {
  const pathname = usePathname();

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
            {links.map((link) =>
              link.browse ? (
                <BrowseLink key={link.href} testId={link.testId} className={desktopLink(pathname === link.href)}>
                  {link.label}
                </BrowseLink>
              ) : (
                <Link key={link.href} data-testid={link.testId} href={link.href} className={desktopLink(pathname === link.href)}>
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-nav flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
        {links.map((link) => {
          const content = (
            <>
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
                {link.mobileLabel ?? link.label}
              </span>
            </>
          );
          return link.browse ? (
            <BrowseLink key={link.href} testId={link.mobileTestId} className={mobileLink(pathname === link.href)}>
              {content}
            </BrowseLink>
          ) : (
            <Link key={link.href} data-testid={link.mobileTestId} href={link.href} className={mobileLink(pathname === link.href)}>
              {content}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
