'use client'

import Link from "next/link";
import { useTranslations } from "@/lib/hooks/useTranslations";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

interface CustomerSidebarProps {
  customerName?: string;
}

export function CustomerSidebar({ customerName }: CustomerSidebarProps) {
  const { tr, lang } = useTranslations();

  const NAV = [
    { href: "/customer/dashboard", label: tr.customerDashboard.nav.myBookings[lang] },
    { href: "/businesses", label: tr.customerDashboard.nav.browseBusinesses[lang] },
    { href: "/customer/dashboard/profile", label: tr.customerDashboard.nav.profile[lang] },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-outline-variant bg-surface min-h-screen flex flex-col justify-between">
      <div>
        <div className="px-gutter py-stack-lg border-b border-outline-variant">
          <div className="mb-stack-md">
            <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
              RIGIFY
            </Link>
          </div>
          {customerName && (
            <p className="mt-stack-md text-on-surface text-body-md">{customerName}</p>
          )}
        </div>
        <nav className="px-gutter py-stack-md space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block font-mono text-data-label uppercase tracking-wider px-3 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-gutter py-stack-md border-t border-outline-variant space-y-2">
        <div className="flex items-center gap-2">
          <form action="/logout" method="post" className="flex-1">
            <button type="submit" className="w-full btn-ghost !justify-start !px-3" aria-label={tr.common.signOut[lang]}>
              {tr.common.signOut[lang]}
            </button>
          </form>
          <LanguageToggle />
        </div>
      </div>
    </aside>
  );
}
