'use client'

import Link from "next/link";
import { UserMenu } from "@/components/ui/UserMenu";
import { BrowseLink } from "./BrowseLink";

export function TopNav() {
  return (
    <header className="sticky top-0 w-full z-nav flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 bg-surface border-b border-white/10">
      <div className="flex items-center gap-4">
        <Link data-testid="nav-logo" href="/">
          <span className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase">
            RIGIFY
          </span>
        </Link>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <Link
          data-testid="nav-home"
          href="/"
          className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
        >
          Home
        </Link>
        <BrowseLink
          testId="nav-browse"
          className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
        >
          Browse
        </BrowseLink>
        <Link
          data-testid="nav-for-business"
          href="/for-businesses"
          className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
        >
          For Business
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  );
}
