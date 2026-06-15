import { redirect } from "next/navigation";
import { EvidenceFeed } from "@/components/dashboard/evidence-feed";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { routes } from "@/lib/routes";
import { hasActiveRosterStudentsForWorkspace } from "@/lib/students/roster-students";

export default async function FeedPage() {
  const workspace = await getCurrentWorkspace();
  const rosterStarted = await hasActiveRosterStudentsForWorkspace(
    workspace.workspaceId
  );

  if (!rosterStarted) {
    redirect(routes.roster);
  }

  return <EvidenceFeed />;
}
