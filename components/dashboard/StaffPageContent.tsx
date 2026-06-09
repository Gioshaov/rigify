"use client";

import Link from "next/link";
import { StaffTable } from "@/app/dashboard/staff/StaffTable";

type StaffMember = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export function StaffPageContent({ staff }: { staff: StaffMember[] }) {
  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-4">
            Team Management
          </span>
          <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary mb-3">
            Staff Members
          </h1>
          <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary max-w-2xl">
            Manage your team members, their roles, and access permissions
          </p>
        </div>
        <Link
          data-testid="invite-staff-btn"
          href="/dashboard/staff/invite"
          className="bg-primary text-background px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          Add A Staff Member
        </Link>
      </div>

      {/* Content */}
      {!staff || staff.length === 0 ? (
        <div className="bg-surface-container border border-white/5 p-16 text-center">
          <div className="w-20 h-20 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-[40px]">group</span>
          </div>
          <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-3">
            No Staff Members Yet
          </h2>
          <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary mb-8 max-w-md mx-auto">
            Get started by inviting your first team member
          </p>
          <Link
            data-testid="invite-first-staff-btn"
            href="/dashboard/staff/invite"
            className="inline-flex items-center gap-2 bg-primary text-background px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Add Your First Staff Member
          </Link>
        </div>
      ) : (
        <StaffTable staff={staff} />
      )}
    </div>
  );
}
