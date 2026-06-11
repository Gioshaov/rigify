"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "@/lib/hooks/useTranslations";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FormError } from "@/components/ui/FormError";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { validators, errorMessages } from "@/lib/utils/validation";

type Action = (formData: FormData) => Promise<{ error: string } | void>;

export function InviteStaffForm({ action }: { action: Action }) {
  const { tr, lang } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    // Client-side validation
    if (!validators.required(name)) {
      setError(errorMessages.required);
      return;
    }

    if (!validators.name(name)) {
      setError(errorMessages.name);
      return;
    }

    if (!validators.required(email)) {
      setError(errorMessages.required);
      return;
    }

    if (!validators.email(email)) {
      setError(errorMessages.email);
      return;
    }

    if (!validators.passwordStrength(password).isValid) {
      setError(errorMessages.passwordWeak);
      return;
    }

    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result) setError(result.error);
    });
  };

  return (
    <form className="mt-stack-lg space-y-stack-md max-w-xl" onSubmit={handleSubmit}>
      <label className="block">
        <span className="label-mono">{tr.dashboard.staffInvite.name[lang]}</span>
        <input
          name="name"
          data-testid="staff-invite-name-input"
          required
          className="input-field mt-stack-sm"
          placeholder="Jane Smith"
        />
      </label>

      <label className="block">
        <span className="label-mono">{tr.dashboard.staffInvite.email[lang]}</span>
        <input
          name="email"
          type="email"
          data-testid="staff-invite-email-input"
          required
          autoComplete="email"
          className="input-field mt-stack-sm"
          placeholder="jane@example.com"
        />
      </label>

      <label className="block">
        <span className="label-mono">{tr.dashboard.staffInvite.tempPassword[lang]}</span>
        <PasswordInput
          name="password"
          id="staff-password"
          testId="staff-invite-password-input"
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
        <select
          name="role"
          data-testid="staff-invite-role-select"
          required
          defaultValue="staff"
          className="input-field mt-stack-sm"
        >
          <option value="staff">{tr.dashboard.staffInvite.staff[lang]}</option>
          <option value="manager">{tr.dashboard.staffInvite.manager[lang]}</option>
        </select>
        <p className="text-sm text-on-surface-variant mt-1">
          {tr.dashboard.staffInvite.managerDesc[lang]}
        </p>
      </label>

      <label className="block">
        <span className="label-mono">{tr.dashboard.staffInvite.specialty[lang]}</span>
        <input
          name="specialty"
          data-testid="staff-invite-specialty-input"
          className="input-field mt-stack-sm"
          placeholder={tr.dashboard.staffInvite.specialtyPlaceholder[lang]}
        />
      </label>

      <FormError message={error} testId="staff-invite-error" mode="banner" />

      <div className="flex gap-stack-md">
        <LoadingButton
          type="submit"
          isLoading={isPending}
          loadingText={tr.dashboard.staffInvite.creating[lang]}
          className="btn-primary"
          testId="staff-invite-submit-btn"
        >
          {tr.dashboard.staffInvite.createAccount[lang]}
        </LoadingButton>
        <Link
          href="/dashboard/staff"
          data-testid="staff-invite-cancel-btn"
          className="btn-secondary"
        >
          {tr.common.cancel[lang]}
        </Link>
      </div>
    </form>
  );
}
