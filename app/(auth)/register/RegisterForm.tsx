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
        const selectedCategories = formData.getAll("categories");

        if (selectedCategories.length === 0) {
          setError("Please select at least one category");
          return;
        }

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

      <fieldset className="block">
        <legend className="label-mono mb-stack-sm">CATEGORIES (SELECT ALL THAT APPLY)</legend>
        <div className="grid grid-cols-2 gap-stack-sm">
          {CATEGORIES.map((c) => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value={c.id}
                className="w-4 h-4 rounded border-outline-variant"
              />
              <span className="text-sm">{c.en}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="label-mono">CITY</span>
        <select name="city" required defaultValue="" className="input-field mt-stack-sm">
          <option value="" disabled>Pick one</option>
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>{c.en}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label-mono">ADDRESS</span>
        <input name="address" required className="input-field mt-stack-sm" placeholder="12 Chavchavadze Ave, Tbilisi" />
      </label>

      <label className="block">
        <span className="label-mono">PHONE</span>
        <input name="phone" type="tel" required className="input-field mt-stack-sm" placeholder="+995 …" />
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
