import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { routes } from "@/lib/routes";
import { hasActiveRosterStudentsForWorkspace } from "@/lib/students/roster-students";

export default async function AppEntryPage() {
  const workspace = await getCurrentWorkspace();
  const rosterStarted = await hasActiveRosterStudentsForWorkspace(
    workspace.workspaceId
  );

  redirect(rosterStarted ? routes.feed : routes.roster);
}
