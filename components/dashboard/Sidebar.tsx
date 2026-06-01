import Link from "next/link";

interface SidebarProps {
  businessName?: string;
  city?: string;
}

const NAV = [
  { href: "/dashboard",              label: "OVERVIEW" },
  { href: "/dashboard/appointments", label: "APPOINTMENTS" },
  { href: "/dashboard/staff",        label: "STAFF" },
  { href: "/dashboard/services",     label: "SERVICES" },
  { href: "/dashboard/salome",       label: "SALOME" },
  { href: "/dashboard/settings",     label: "SETTINGS" },
];

export function Sidebar({ businessName, city }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-outline-variant bg-surface min-h-screen flex flex-col justify-between">
      <div>
        <div className="px-gutter py-stack-lg border-b border-outline-variant">
          <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
            RIGIFY
          </Link>
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

      <form action="/logout" method="post" className="px-gutter py-stack-md border-t border-outline-variant">
        <button type="submit" className="w-full btn-ghost !justify-start !px-3">
          Sign out
        </button>
      </form>
    </aside>
  );
}
