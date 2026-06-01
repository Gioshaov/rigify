"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

type Action = (formData: FormData) => Promise<{ error: string } | void>;

export function InviteStaffForm({ action }: { action: Action }) {
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
        <span className="label-mono">NAME</span>
        <input name="name" required className="input-field mt-stack-sm" placeholder="Jane Smith" />
      </label>

      <label className="block">
        <span className="label-mono">EMAIL</span>
        <input name="email" type="email" required autoComplete="email" className="input-field mt-stack-sm" placeholder="jane@example.com" />
      </label>

      <label className="block">
        <span className="label-mono">TEMPORARY PASSWORD</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input-field mt-stack-sm"
          placeholder="At least 8 characters"
        />
        <p className="text-sm text-on-surface-variant mt-1">
          They should change this on first login
        </p>
      </label>

      <label className="block">
        <span className="label-mono">ROLE</span>
        <select name="role" required defaultValue="staff" className="input-field mt-stack-sm">
          <option value="staff">Staff</option>
          <option value="manager">Manager</option>
        </select>
        <p className="text-sm text-on-surface-variant mt-1">
          Manager role can view more information and edit settings
        </p>
      </label>

      <label className="block">
        <span className="label-mono">SPECIALTY (OPTIONAL)</span>
        <input name="specialty" className="input-field mt-stack-sm" placeholder="Hair Stylist" />
      </label>

      {error && (
        <p className="font-mono text-data-label text-error" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-stack-md">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Creating…" : "Create Staff Account"}
        </button>
        <Link href="/dashboard/staff" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
