import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { getClassRosterReadinessForWorkspace } from "@/lib/classes/class-groups";
import { routes } from "@/lib/routes";

export default async function AppEntryPage() {
  const workspace = await getCurrentWorkspace();
  const classRosterReadiness = await getClassRosterReadinessForWorkspace(
    workspace.workspaceId
  );

  redirect(classRosterReadiness.readyForClassFirstRoster ? routes.feed : routes.roster);
}
