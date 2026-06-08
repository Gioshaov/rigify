"use client";

export function DashboardHeader({ userEmail }: { userEmail: string }) {
  return (
    <header className="border-b border-white/10 px-8 h-16 flex items-center justify-between bg-surface">
      <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary uppercase">
        Business Dashboard
      </p>
      <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary">
        {userEmail}
      </p>
    </header>
  );
}
