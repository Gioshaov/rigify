"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "@/lib/hooks/useTranslations";

type Action = (formData: FormData) => Promise<{ error: string } | void>;

export function LoginForm({ action, redirectTo }: { action: Action; redirectTo?: string }) {
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
      {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

      <label className="block">
        <span className="label-mono">{tr.auth.login.email[lang]}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="input-field mt-stack-sm"
          placeholder={tr.auth.login.emailPlaceholder[lang]}
        />
      </label>

      <label className="block">
        <span className="label-mono">{tr.auth.login.password[lang]}</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="input-field mt-stack-sm"
          placeholder="••••••••"
        />
      </label>

      {error && (
        <p className="font-mono text-data-label text-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? tr.auth.login.signingIn[lang] : tr.common.signIn[lang]}
      </button>
    </form>
  );
}
