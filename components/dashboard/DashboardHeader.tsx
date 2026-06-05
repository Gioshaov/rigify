"use client";

import { useTranslations } from "@/lib/hooks/useTranslations";

export function DashboardHeader({ userEmail }: { userEmail: string }) {
  const { tr, lang } = useTranslations();

  return (
    <header className="border-b border-outline-variant px-gutter md:px-margin-desktop h-16 flex items-center justify-between">
      <p className="label-mono">{tr.dashboard.title[lang]}</p>
      <p className="label-mono text-on-surface-variant">{userEmail}</p>
    </header>
  );
}
