'use client'

import Link from "next/link";
import { useTranslations } from "@/lib/hooks/useTranslations";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

interface SidebarProps {
  businessName?: string;
  city?: string;
}

export function Sidebar({ businessName, city }: SidebarProps) {
  const { tr, lang } = useTranslations();

  const NAV = [
    { href: "/dashboard",              label: tr.dashboard.nav.overview[lang] },
    { href: "/dashboard/appointments", label: tr.dashboard.nav.appointments[lang] },
    { href: "/dashboard/staff",        label: tr.dashboard.nav.staff[lang] },
    { href: "/dashboard/services",     label: tr.dashboard.nav.services[lang] },
    { href: "/dashboard/salome",       label: tr.dashboard.nav.salome[lang] },
    { href: "/dashboard/settings",     label: tr.dashboard.nav.settings[lang] },
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
          {businessName && (
            <p className="mt-stack-md text-on-surface text-body-md">{businessName}</p>
          )}
          {city && (
            <p className="label-mono mt-1">{city.toUpperCase()}</p>
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
