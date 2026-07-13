import { redirect } from "next/navigation";
import { EvidenceFeed } from "@/components/dashboard/evidence-feed";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { getClassRosterReadinessForWorkspace } from "@/lib/classes/class-groups";
import {
  getEvidenceFeedPageForWorkspace,
  MAX_EVIDENCE_FEED_PAGE,
} from "@/lib/evidence/evidence-feed-records";
import { routes } from "@/lib/routes";
import { listActiveRosterStudentsForWorkspace } from "@/lib/students/roster-students";

type FeedPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
    filter?: string | string[];
    q?: string | string[];
  }>;
};

function singleParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function pageNumber(value: string): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) &&
    parsed > 0 &&
    parsed <= MAX_EVIDENCE_FEED_PAGE
    ? parsed
    : 1;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const workspace = await getCurrentWorkspace();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedPage = pageNumber(singleParam(resolvedSearchParams.page));
  const initialFilter = singleParam(resolvedSearchParams.filter);
  const initialSearchQuery = singleParam(resolvedSearchParams.q);
  const [classRosterReadiness, rosterStudents, evidencePage] = await Promise.all([
    getClassRosterReadinessForWorkspace(workspace.workspaceId),
    listActiveRosterStudentsForWorkspace(workspace.workspaceId).then((students) =>
      students.map((student) => ({
        id: student.id,
        displayName: student.displayName,
        mentionHandle: student.mentionHandle,
        classGroupName: student.classGroupName,
      }))
    ),
    getEvidenceFeedPageForWorkspace(workspace.workspaceId, requestedPage),
  ]);

  if (!classRosterReadiness.readyForClassFirstRoster) {
    redirect(routes.roster);
  }

  if (evidencePage.page > 1 && evidencePage.records.length === 0) {
    const params = new URLSearchParams();
    if (initialFilter) params.set("filter", initialFilter);
    if (initialSearchQuery) params.set("q", initialSearchQuery);
    redirect(`${routes.feed}${params.size ? `?${params}` : ""}`);
  }

  return (
    <EvidenceFeed
      workspaceId={workspace.workspaceId}
      rosterStudents={rosterStudents}
      initialEvidenceRecords={evidencePage.records}
      evidencePage={evidencePage.page}
      hasNewerEvidence={evidencePage.hasNewer}
      hasOlderEvidence={evidencePage.hasOlder}
      initialFilter={initialFilter}
      initialSearchQuery={initialSearchQuery}
    />
  );
}
