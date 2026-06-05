"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "@/lib/hooks/useTranslations";

type Action = (formData: FormData) => Promise<{ error?: string; success?: boolean } | void>;

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export function CustomerProfileForm({ action, customer }: { action: Action; customer: Customer }) {
  const { tr, lang } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-stack-lg space-y-stack-md"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await action(formData);
          if (result && "error" in result) {
            setError(result.error || null);
          } else if (result && "success" in result && result.success) {
            setSuccess(true);
          }
        });
      }}
    >
      <label className="block">
        <span className="label-mono">{tr.customerDashboard.fullName[lang]}</span>
        <input
          name="name"
          required
          defaultValue={customer.name}
          className="input-field mt-stack-sm"
          placeholder="Your full name"
        />
      </label>

      <label className="block">
        <span className="label-mono">{tr.customerDashboard.phone[lang]}</span>
        <input
          name="phone"
          type="tel"
          required
          defaultValue={customer.phone}
          className="input-field mt-stack-sm"
          placeholder="+995 …"
        />
      </label>

      <label className="block">
        <span className="label-mono">{tr.customerDashboard.email[lang]}</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={customer.email}
          className="input-field mt-stack-sm"
          placeholder="you@example.com"
          disabled
        />
        <p className="text-sm text-on-surface-variant mt-2">
          {tr.customerDashboard.emailCannotChange[lang]}
        </p>
      </label>

      {error && (
        <p className="font-mono text-data-label text-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="font-mono text-data-label text-primary" role="alert">
          {tr.customerDashboard.profileUpdated[lang]}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? tr.customerDashboard.saving[lang] : tr.customerDashboard.saveChanges[lang]}
      </button>
    </form>
  );
}
