"use client";

import { useState, useTransition } from "react";

type Action = (formData: FormData) => Promise<{ error: string } | void>;

export function LoginForm({ action, redirectTo }: { action: Action; redirectTo?: string }) {
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
      <input type="hidden" name="redirect" value={redirectTo ?? "/dashboard"} />

      <label className="block">
        <span className="label-mono">EMAIL</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="input-field mt-stack-sm"
          placeholder="you@studio.ge"
        />
      </label>

      <label className="block">
        <span className="label-mono">PASSWORD</span>
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
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
