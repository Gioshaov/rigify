import Link from "next/link";

export default function StaffPage() {
  return (
    <section>
      <div className="flex items-start justify-between">
        <div>
          <p className="label-mono text-primary">STAFF</p>
          <h1 className="mt-stack-sm text-headline-md">Staff management</h1>
          <p className="mt-stack-md text-on-surface-variant max-w-xl">
            Staff members can log in to access a limited dashboard with role-based permissions.
          </p>
        </div>
        <Link href="/dashboard/staff/invite" className="btn-primary">
          Invite Staff
        </Link>
      </div>

      <div className="mt-stack-lg">
        <p className="text-on-surface-variant">
          Staff list and management features coming in Phase 3.
        </p>
      </div>
    </section>
  );
}
