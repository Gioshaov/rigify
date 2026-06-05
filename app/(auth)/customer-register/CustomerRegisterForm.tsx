"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "@/lib/hooks/useTranslations";

type Action = (formData: FormData) => Promise<{ error: string } | void>;

export function CustomerRegisterForm({ action }: { action: Action }) {
  const { tr, lang } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-stack-lg space-y-stack-md"
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
        <span className="label-mono">{tr.auth.customerRegister.fullName[lang]}</span>
        <input
          name="name"
          required
          className="input-field mt-stack-sm"
          placeholder="Your full name"
        />
      </label>

      <label className="block">
        <span className="label-mono">{tr.auth.customerRegister.phone[lang]}</span>
        <input
          name="phone"
          type="tel"
          required
          className="input-field mt-stack-sm"
          placeholder="+995 …"
        />
      </label>

      <label className="block">
        <span className="label-mono">{tr.auth.login.email[lang]}</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input-field mt-stack-sm"
          placeholder={tr.auth.login.emailPlaceholder[lang]}
        />
      </label>

      <label className="block">
        <span className="label-mono">{tr.auth.login.password[lang]}</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input-field mt-stack-sm"
          placeholder={tr.auth.customerRegister.passwordMinLength[lang]}
        />
      </label>

      {error && (
        <p className="font-mono text-data-label text-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? tr.auth.customerRegister.creating[lang] : tr.common.signUp[lang]}
      </button>
    </form>
  );
}
