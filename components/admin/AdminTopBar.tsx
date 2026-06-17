import { Bell, Plus, LogOut } from 'lucide-react';
import Link from 'next/link';

type AdminTopBarProps = {
  title: string;
  subtitle?: string;
  showNewBusinessButton?: boolean;
};

export function AdminTopBar({ title, subtitle, showNewBusinessButton = false }: AdminTopBarProps) {
  return (
    <header className="h-14 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && (
          <span className="text-[#888888] text-sm">{subtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button data-testid="notifications-btn" className="text-[#888888] hover:text-white transition-colors">
          <Bell className="w-[18px] h-[18px]" />
        </button>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            data-testid="btn-logout"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-widest text-[#666666] border border-[#252525] rounded hover:border-[#444444] hover:text-[#888888] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </form>
        {showNewBusinessButton && (
          <Link
            href="/admin/onboard"
            data-testid="new-business-btn"
            className="bg-[#d4a843] text-black font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Business
          </Link>
        )}
      </div>
    </header>
  );
}
