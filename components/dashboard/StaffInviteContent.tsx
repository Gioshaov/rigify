"use client";

import { useTranslations } from "@/lib/hooks/useTranslations";
import { InviteStaffForm } from "@/app/dashboard/staff/invite/InviteStaffForm";

type Action = (formData: FormData) => Promise<{ error: string } | void>;

export function StaffInviteContent({ action }: { action: Action }) {
  const { tr, lang } = useTranslations();

  return (
    <section>
      <p className="label-mono text-primary">{tr.dashboard.nav.staff[lang]}</p>
      <h1 className="mt-stack-sm text-headline-md">{tr.dashboard.staffInvite.title[lang]}</h1>
      <p className="mt-stack-md text-on-surface-variant max-w-xl">
        {tr.dashboard.staffInvite.description[lang]}
      </p>

      <InviteStaffForm action={action} />
    </section>
  );
}
