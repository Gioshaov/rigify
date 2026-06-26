import { notFound } from "next/navigation";
import { UiHarness } from "./UiHarness";

// Dev/test-only harness for exercising global UI primitives (ConfirmDialog,
// Toast) in isolation — used by the Playwright specs in tests/e2e/ui. Returns
// 404 in production so it is never reachable on the live site.
export const dynamic = "force-dynamic";

export default function UiHarnessPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <UiHarness />;
}
