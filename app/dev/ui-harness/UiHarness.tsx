"use client";

import { useState } from "react";
import { useConfirm } from "@/lib/contexts/ConfirmContext";
import { useToast } from "@/lib/contexts/ToastContext";

/**
 * Trigger surface for the ConfirmDialog and Toast primitives. Each button
 * exercises one path; results are written to a status element the tests read.
 * Not shipped to production (the page route 404s there).
 */
export function UiHarness() {
  const confirm = useConfirm();
  const showToast = useToast();
  const [result, setResult] = useState("none");

  return (
    <main className="min-h-dvh bg-background text-on-surface p-8 space-y-6">
      <h1 className="font-hanken text-2xl font-bold">UI Harness</h1>

      {/* Status element the specs assert against. */}
      <p data-testid="harness-result">
        result: <span data-testid="harness-result-value">{result}</span>
      </p>

      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          data-testid="harness-open-confirm"
          className="btn-primary"
          onClick={async () => {
            const ok = await confirm({
              title: "Delete this thing?",
              message: "It cannot be undone.",
              confirmLabel: "Delete",
              destructive: true,
              testId: "harness-confirm",
            });
            setResult(ok ? "confirmed" : "cancelled");
          }}
        >
          Open confirm
        </button>

        <button
          type="button"
          data-testid="harness-double-confirm"
          className="btn-secondary"
          onClick={() => {
            // Fire two confirms back-to-back. The provider should cancel the
            // first (resolve false) when the second opens — the first promise
            // must not hang.
            const first = confirm({ title: "First confirm", testId: "harness-confirm" });
            const second = confirm({ title: "Second confirm", testId: "harness-confirm" });
            first.then((r) => setResult(`first-resolved:${r}`));
            void second;
          }}
        >
          Double confirm
        </button>
      </section>

      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          data-testid="harness-toast-success"
          className="btn-primary"
          onClick={() => showToast("Saved successfully", "success")}
        >
          Toast success
        </button>
        <button
          type="button"
          data-testid="harness-toast-error"
          className="btn-secondary"
          onClick={() => showToast("Something went wrong", "error")}
        >
          Toast error
        </button>
        <button
          type="button"
          data-testid="harness-toast-quick"
          className="btn-ghost"
          onClick={() => showToast("Quick toast", "info", 800)}
        >
          Toast quick (800ms)
        </button>
        <button
          type="button"
          data-testid="harness-toast-stack"
          className="btn-ghost"
          onClick={() => {
            showToast("First toast", "success");
            showToast("Second toast", "info");
            showToast("Third toast", "error");
          }}
        >
          Stack three toasts
        </button>
      </section>
    </main>
  );
}
