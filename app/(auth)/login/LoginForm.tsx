"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "@/lib/hooks/useTranslations";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FormError } from "@/components/ui/FormError";
import { LoadingButton } from "@/components/ui/LoadingButton";

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
          data-testid="login-email-input"
          required
          autoComplete="email"
          className="input-field mt-stack-sm"
          placeholder={tr.auth.login.emailPlaceholder[lang]}
        />
      </label>

      <label className="block">
        <span className="label-mono">{tr.auth.login.password[lang]}</span>
        <PasswordInput
          name="password"
          id="login-password"
          testId="login-password-input"
          required
          autoComplete="current-password"
          className="input-field mt-stack-sm"
          placeholder="••••••••"
        />
      </label>

      <FormError message={error} testId="login-error" mode="banner" />

      <LoadingButton
        type="submit"
        isLoading={isPending}
        loadingText={tr.auth.login.signingIn[lang]}
        className="btn-primary w-full"
        testId="login-submit-btn"
      >
        {tr.common.signIn[lang]}
      </LoadingButton>
    </form>
  );
}
