"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "@/lib/hooks/useTranslations";

type Action = (formData: FormData) => Promise<{ error: string } | void>;

export function InviteStaffForm({ action }: { action: Action }) {
  const { tr, lang } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-stack-lg space-y-stack-md max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await action(formData);
          if (result && "error" in result) setError(result.error);
        });
      }}
    >
      <label className="block">
        <span className="label-mono">{tr.dashboard.staffInvite.name[lang]}</span>
        <input name="name" required className="input-field mt-stack-sm" placeholder="Jane Smith" />
      </label>

      <label className="block">
        <span className="label-mono">{tr.dashboard.staffInvite.email[lang]}</span>
        <input name="email" type="email" required autoComplete="email" className="input-field mt-stack-sm" placeholder="jane@example.com" />
      </label>

      <label className="block">
        <span className="label-mono">{tr.dashboard.staffInvite.tempPassword[lang]}</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input-field mt-stack-sm"
          placeholder={tr.dashboard.staffInvite.tempPasswordPlaceholder[lang]}
        />
        <p className="text-sm text-on-surface-variant mt-1">
          {tr.dashboard.staffInvite.shouldChange[lang]}
        </p>
      </label>

      <label className="block">
        <span className="label-mono">{tr.dashboard.staffInvite.role[lang]}</span>
        <select name="role" required defaultValue="staff" className="input-field mt-stack-sm">
          <option value="staff">{tr.dashboard.staffInvite.staff[lang]}</option>
          <option value="manager">{tr.dashboard.staffInvite.manager[lang]}</option>
        </select>
        <p className="text-sm text-on-surface-variant mt-1">
          {tr.dashboard.staffInvite.managerDesc[lang]}
        </p>
      </label>

      <label className="block">
        <span className="label-mono">{tr.dashboard.staffInvite.specialty[lang]}</span>
        <input name="specialty" className="input-field mt-stack-sm" placeholder={tr.dashboard.staffInvite.specialtyPlaceholder[lang]} />
      </label>

      {error && (
        <p className="font-mono text-data-label text-error" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-stack-md">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? tr.dashboard.staffInvite.creating[lang] : tr.dashboard.staffInvite.createAccount[lang]}
        </button>
        <Link href="/dashboard/staff" className="btn-secondary">
          {tr.common.cancel[lang]}
        </Link>
      </div>
    </form>
  );
}
