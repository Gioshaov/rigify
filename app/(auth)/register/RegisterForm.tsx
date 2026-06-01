"use client";

import { useState, useTransition } from "react";
import { CATEGORIES } from "@/lib/constants/categories";
import { CITIES } from "@/lib/constants/cities";

type Action = (formData: FormData) => Promise<{ error: string } | void>;

export function RegisterForm({ action }: { action: Action }) {
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
        <span className="label-mono">BUSINESS NAME</span>
        <input name="business_name" required className="input-field mt-stack-sm" placeholder="Mitte Beauty" />
      </label>

      <div className="grid grid-cols-2 gap-stack-md">
        <label className="block">
          <span className="label-mono">CATEGORY</span>
          <select name="category" required defaultValue="" className="input-field mt-stack-sm">
            <option value="" disabled>Pick one</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.en}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label-mono">CITY</span>
          <select name="city" required defaultValue="" className="input-field mt-stack-sm">
            <option value="" disabled>Pick one</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>{c.en}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="label-mono">ADDRESS</span>
        <input name="address" required className="input-field mt-stack-sm" placeholder="12 Chavchavadze Ave, Tbilisi" />
      </label>

      <label className="block">
        <span className="label-mono">PHONE</span>
        <input name="phone" type="tel" className="input-field mt-stack-sm" placeholder="+995 …" />
      </label>

      <label className="block">
        <span className="label-mono">EMAIL</span>
        <input name="email" type="email" required autoComplete="email" className="input-field mt-stack-sm" placeholder="you@studio.ge" />
      </label>

      <label className="block">
        <span className="label-mono">PASSWORD</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input-field mt-stack-sm"
          placeholder="At least 8 characters"
        />
      </label>

      {error && (
        <p className="font-mono text-data-label text-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
