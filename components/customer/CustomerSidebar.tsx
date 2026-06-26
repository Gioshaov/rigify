"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface CustomerSidebarProps {
  customerName?: string;
}

export function CustomerSidebar({ customerName }: CustomerSidebarProps) {
  const pathname = usePathname();

  const NAV = [
    {
      href: "/customer/dashboard",
      label: "My Bookings",
      icon: "event_available"
    },
    {
      href: "/businesses",
      label: "Browse Salons",
      icon: "search"
    },
    {
      href: "/customer/dashboard/profile",
      label: "Profile",
      icon: "person"
    },
  ];

  return (
    <aside className="w-72 shrink-0 border-r border-white/10 bg-surface min-h-dvh flex flex-col font-hanken">
      <div className="flex-1">
        {/* Logo & User Section */}
        <div className="p-8 border-b border-white/10">
          <Link data-testid="customer-sidebar-logo" href="/" className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase block mb-8">
            RIGIFY
          </Link>
          {customerName && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-surface-container-highest border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[24px]">person</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-primary truncate">
                  {customerName}
                </p>
                <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
                  Customer
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {NAV.map((item) => {
            const isActive = pathname === item.href ||
              (item.href === "/customer/dashboard" && pathname.startsWith("/customer/dashboard") && pathname !== "/customer/dashboard/profile");

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
      <div className="p-4 border-t border-white/10">
        <button
          data-testid="language-toggle-btn"
          className="w-full flex items-center gap-3 px-4 py-3 border border-white/5 text-on-surface-variant hover:bg-surface-container-low hover:border-primary/20 hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">language</span>
          <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase">
            English
          </span>
        </button>
      </div>
    </aside>
  );
}
