import Link from "next/link";

interface CustomerSidebarProps {
  customerName?: string;
}

const NAV = [
  { href: "/customer/dashboard", label: "MY BOOKINGS" },
  { href: "/customer/dashboard/profile", label: "PROFILE" },
];

export function CustomerSidebar({ customerName }: CustomerSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-outline-variant bg-surface min-h-screen flex flex-col justify-between">
      <div>
        <div className="px-gutter py-stack-lg border-b border-outline-variant">
          <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
            RIGIFY
          </Link>
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

      <form action="/logout" method="post" className="px-gutter py-stack-md border-t border-outline-variant">
        <button type="submit" className="w-full btn-ghost !justify-start !px-3">
          Sign out
        </button>
      </form>
    </aside>
  );
}
