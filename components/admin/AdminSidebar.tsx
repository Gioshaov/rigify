"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Building2,
  Users,
  Calendar,
  Shield,
  Tag,
  Image as ImageIcon,
  Settings,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  const navLinkClass = (path: string) => {
    return isActive(path)
      ? "w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors bg-[#1a1a1a] text-white border-l-2 border-[#d4a843]"
      : "w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors text-[#888888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent";
  };

  return (
    <aside className="w-60 bg-[#111111] flex-shrink-0 fixed h-screen">
      {/* Logo */}
      <div className="pt-8 pb-8 px-5">
        <h1 className="text-[#d4a843] text-xl font-bold uppercase tracking-widest">
          RIGIFY
        </h1>
        <p className="text-[#888888] text-[11px] uppercase tracking-widest mt-1">
          SUPER ADMIN
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        <Link
          href="/admin"
          data-testid="nav-dashboard"
          className={navLinkClass('/admin')}
        >
          <LayoutGrid className="w-4 h-4" />
          Dashboard
        </Link>

        <Link
          href="/admin/businesses"
          data-testid="nav-businesses"
          className={navLinkClass('/admin/businesses')}
        >
          <Building2 className="w-4 h-4" />
          Businesses
        </Link>

        <Link
          href="/admin/customers"
          data-testid="nav-customers"
          className={navLinkClass('/admin/customers')}
        >
          <Users className="w-4 h-4" />
          Customers
        </Link>

        <Link
          href="/admin/bookings"
          data-testid="nav-bookings"
          className={navLinkClass('/admin/bookings')}
        >
          <Calendar className="w-4 h-4" />
          Bookings
        </Link>

        <Link
          href="/admin/admins"
          data-testid="nav-admins"
          className={navLinkClass('/admin/admins')}
        >
          <Shield className="w-4 h-4" />
          Admins
        </Link>

        <Link
          href="/admin/audit-logs"
          data-testid="nav-audit-logs"
          className={navLinkClass('/admin/audit-logs')}
        >
          <Users className="w-4 h-4" />
          Audit Logs
        </Link>

        <div className="px-5 py-3 text-[#555555] text-xs uppercase tracking-widest">
          Coming Soon
        </div>

        <button
          disabled
          className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider text-[#555555] cursor-not-allowed border-l-2 border-transparent opacity-50"
        >
          <Tag className="w-4 h-4" />
          Categories
        </button>

        <button
          disabled
          className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider text-[#555555] cursor-not-allowed border-l-2 border-transparent opacity-50"
        >
          <ImageIcon className="w-4 h-4" />
          Media
        </button>

        <button
          disabled
          className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider text-[#555555] cursor-not-allowed border-l-2 border-transparent opacity-50"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </nav>
    </aside>
  );
}
