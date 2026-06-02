import { InviteStaffForm } from "./InviteStaffForm";
import { inviteStaffAction } from "./actions";

export default function InviteStaffPage() {
  return (
    <section>
      <p className="label-mono text-primary">STAFF</p>
      <h1 className="mt-stack-sm text-headline-md">Invite Staff Member</h1>
      <p className="mt-stack-md text-on-surface-variant max-w-xl">
        Create an account for a staff member. They&apos;ll be able to log in and access the dashboard with permissions you set.
      </p>

      <InviteStaffForm action={inviteStaffAction} />
    </section>
  );
}
