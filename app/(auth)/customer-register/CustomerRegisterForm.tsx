"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "@/lib/hooks/useTranslations";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FormError } from "@/components/ui/FormError";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { validators, errorMessages } from "@/lib/utils/validation";

type Action = (formData: FormData) => Promise<{ error: string } | void>;

export function CustomerRegisterForm({ action }: { action: Action }) {
  const { tr, lang } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const email = String(formData.get("email") ?? "");
    const pwd = String(formData.get("password") ?? "");

    // Client-side validation
    if (!validators.required(name)) {
      setError(errorMessages.required);
      return;
    }

    if (!validators.name(name)) {
      setError(errorMessages.name);
      return;
    }

    if (!validators.required(phone)) {
      setError(errorMessages.required);
      return;
    }

    if (!validators.phone(phone)) {
      setError(errorMessages.phone);
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

    if (!validators.passwordStrength(pwd).isValid) {
      setError(errorMessages.passwordWeak);
      return;
    }

    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result) setError(result.error);
    });
  };

  return (
    <form className="mt-stack-lg space-y-stack-md" onSubmit={handleSubmit}>
      <label className="block">
        <span className="label-mono">{tr.auth.customerRegister.fullName[lang]}</span>
        <input
          name="name"
          data-testid="register-name-input"
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
          data-testid="register-phone-input"
          required
          className="input-field mt-stack-sm"
          placeholder="+995 555 123 456"
        />
      </label>

      <label className="block">
        <span className="label-mono">{tr.auth.login.email[lang]}</span>
        <input
          name="email"
          type="email"
          data-testid="register-email-input"
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
          id="register-password"
          testId="register-password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="input-field mt-stack-sm"
          placeholder={tr.auth.customerRegister.passwordMinLength[lang]}
          showStrength
        />
      </label>

      <FormError message={error} testId="register-error" mode="banner" />

      <LoadingButton
        type="submit"
        isLoading={isPending}
        loadingText={tr.auth.customerRegister.creating[lang]}
        className="btn-primary w-full"
        testId="register-submit-btn"
      >
        {tr.common.signUp[lang]}
      </LoadingButton>
    </form>
  );
}
