import { inviteStaffAction } from "./actions";
import { StaffInviteContent } from "@/components/dashboard/StaffInviteContent";

export default function InviteStaffPage() {
  return <StaffInviteContent action={inviteStaffAction} />;
}
