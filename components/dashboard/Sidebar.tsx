"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  businessName?: string;
  city?: string;
}

export function Sidebar({ businessName, city }: SidebarProps) {
  const pathname = usePathname();

  const NAV = [
    { href: "/dashboard", label: "Overview", icon: "dashboard" },
    { href: "/dashboard/appointments", label: "Appointments", icon: "event" },
    { href: "/dashboard/staff", label: "Staff", icon: "group" },
    { href: "/dashboard/services", label: "Services", icon: "cut" },
    { href: "/dashboard/salome", label: "Salome AI", icon: "mic" },
    { href: "/dashboard/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside className="w-72 shrink-0 border-r border-white/10 bg-surface min-h-screen flex flex-col font-hanken">
      <div className="flex-1">
        {/* Logo & Business Section */}
        <div className="p-8 border-b border-white/10">
          <Link data-testid="sidebar-logo" href="/" className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase block mb-8">
            RIGIFY
          </Link>
          {businessName && (
            <div>
              <p className="font-hanken text-[18px] leading-[1.6] font-normal text-primary mb-1">
                {businessName}
              </p>
              {city && (
                <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase">
                  {city}
                </p>
              )}
              <div className="mt-4 px-3 py-1 bg-primary/10 border border-primary/20 inline-block">
                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase">
                  Business Owner
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {NAV.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 border border-white/5
                  transition-all group
                  ${isActive
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:border-primary/20 hover:text-primary'
                  }
                `}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          data-testid="language-toggle-btn"
          className="w-full flex items-center gap-3 px-4 py-3 border border-white/5 text-on-surface-variant hover:bg-surface-container-low hover:border-primary/20 hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">language</span>
          <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase">
            English
          </span>
        </button>
        <form action="/logout" method="post" className="w-full">
          <button
            data-testid="sign-out-btn"
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 border border-white/5 text-on-surface-variant hover:bg-error/10 hover:border-error/30 hover:text-error transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase">
              Sign Out
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}
