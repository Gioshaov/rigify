"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/hooks/useTranslations";
import { StaffTable } from "@/app/dashboard/staff/StaffTable";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

export function StaffPageContent({ staff }: { staff: StaffMember[] }) {
  const { tr, lang } = useTranslations();

  return (
    <section>
      <div className="flex items-start justify-between">
        <div>
          <p className="label-mono text-primary">{tr.dashboard.nav.staff[lang]}</p>
          <h1 className="mt-stack-sm text-headline-md">{tr.dashboard.staff.title[lang]}</h1>
          <p className="mt-stack-md text-on-surface-variant max-w-xl">
            {tr.dashboard.staff.description[lang]}
          </p>
        </div>
        <Link href="/dashboard/staff/invite" className="btn-primary">
          {tr.dashboard.staff.inviteStaff[lang]}
        </Link>
      </div>

      <div className="mt-stack-lg">
        {!staff || staff.length === 0 ? (
          <div className="text-center py-12 border border-outline-variant">
            <p className="text-on-surface-variant mb-4">{tr.dashboard.staff.noStaff[lang]}</p>
            <Link href="/dashboard/staff/invite" className="text-primary hover:underline">
              {tr.dashboard.staff.inviteFirst[lang]}
            </Link>
          </div>
        ) : (
          <StaffTable staff={staff} />
        )}
      </div>
    </section>
  );
}
