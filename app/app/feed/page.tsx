import { redirect } from "next/navigation";
import { EvidenceFeed } from "@/components/dashboard/evidence-feed";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { getClassRosterReadinessForWorkspace } from "@/lib/classes/class-groups";
import { listEvidenceFeedRecordsForWorkspace } from "@/lib/evidence/evidence-feed-records";
import { routes } from "@/lib/routes";
import { listActiveRosterStudentsForWorkspace } from "@/lib/students/roster-students";

export default async function FeedPage() {
  const workspace = await getCurrentWorkspace();
  const [classRosterReadiness, rosterStudents, evidenceRecords] = await Promise.all([
    getClassRosterReadinessForWorkspace(workspace.workspaceId),
    listActiveRosterStudentsForWorkspace(workspace.workspaceId).then((students) =>
      students.map((student) => ({
        id: student.id,
        displayName: student.displayName,
        mentionHandle: student.mentionHandle,
        classGroupName: student.classGroupName,
      }))
    ),
    listEvidenceFeedRecordsForWorkspace(workspace.workspaceId),
  ]);

  if (!classRosterReadiness.readyForClassFirstRoster) {
    redirect(routes.roster);
  }

  return (
    <EvidenceFeed
      rosterStudents={rosterStudents}
      initialEvidenceRecords={evidenceRecords}
    />
  );
}
