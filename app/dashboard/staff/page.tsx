export default function StaffPage() {
  return (
    <section>
      <p className="label-mono text-primary">STAFF</p>
      <h1 className="mt-stack-sm text-headline-md">Staff management — coming in Phase 3.</h1>
      <p className="mt-stack-md text-on-surface-variant max-w-xl">
        Add, edit, deactivate staff. Each member can be linked to a Google Calendar via{" "}
        <code className="font-mono">staff.calendar_id</code> in Supabase.
      </p>
    </section>
  );
}
