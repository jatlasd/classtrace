import { redirect } from "next/navigation";
import { EvidenceFeed } from "@/components/dashboard/evidence-feed";
import { getCurrentAppWorkspace } from "@/lib/auth/get-current-workspace";
import {
  getClassRosterReadinessForWorkspace,
  listActiveClassGroupsForWorkspace,
} from "@/lib/classes/class-groups";
import {
  getEvidenceFeedPageForWorkspace,
  MAX_EVIDENCE_FEED_PAGE,
} from "@/lib/evidence/evidence-feed-records";
import { listExistingEvidenceTagsForWorkspace } from "@/lib/evidence/explore-evidence";
import { routes } from "@/lib/routes";
import { listActiveRosterStudentsForWorkspace } from "@/lib/students/roster-students";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type FeedPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
    q?: string | string[];
    student?: string | string[];
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

function searchQuery(value: string): string {
  return value.trim().slice(0, INPUT_LIMITS.evidenceSearch);
}

function feedHref(query: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  return `${routes.feed}${params.size ? `?${params}` : ""}`;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const workspace = await getCurrentAppWorkspace();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedPage = pageNumber(singleParam(resolvedSearchParams.page));
  const initialSearchQuery = searchQuery(singleParam(resolvedSearchParams.q));
  const requestedStudentId = singleParam(resolvedSearchParams.student).trim();
  const [
    classRosterReadiness,
    classGroups,
    activeStudents,
    evidencePage,
    tagSuggestions,
  ] =
    await Promise.all([
      getClassRosterReadinessForWorkspace(workspace.workspaceId),
      listActiveClassGroupsForWorkspace(workspace.workspaceId).then((groups) =>
        groups.map((group) => ({ id: group.id, name: group.name }))
      ),
      listActiveRosterStudentsForWorkspace(workspace.workspaceId),
      getEvidenceFeedPageForWorkspace(workspace.workspaceId, {
        page: requestedPage,
        query: initialSearchQuery,
      }),
      listExistingEvidenceTagsForWorkspace(workspace.workspaceId),
    ]);

  const rosterStudents = activeStudents
    .filter(
      (student): student is typeof student & { classGroupName: string } =>
        student.hasActiveClass && student.classGroupName !== null
    )
    .map((student) => ({
      id: student.id,
      displayName: student.displayName,
      mentionHandle: student.mentionHandle,
      classGroupName: student.classGroupName,
    }));
  const initialCaptureStudent =
    requestedStudentId && requestedStudentId.length <= INPUT_LIMITS.identifier
      ? rosterStudents.find((student) => student.id === requestedStudentId)
      : undefined;
  const initialCaptureStudentError =
    requestedStudentId && !initialCaptureStudent
      ? "That student is not available for capture. Mention an active student instead."
      : undefined;

  if (!classRosterReadiness.readyForClassFirstRoster) {
    redirect(routes.roster);
  }

  if (evidencePage.page !== requestedPage) {
    redirect(feedHref(initialSearchQuery));
  }

  return (
    <EvidenceFeed
      workspaceId={workspace.workspaceId}
      workspaceCreatedAt={workspace.workspaceCreatedAt.toISOString()}
      rosterStudents={rosterStudents}
      classGroups={classGroups}
      initialEvidenceRecords={evidencePage.records}
      evidencePage={evidencePage.page}
      totalMatches={evidencePage.totalMatches}
      hasNewerEvidence={evidencePage.hasNewer}
      hasOlderEvidence={evidencePage.hasOlder}
      initialSearchQuery={initialSearchQuery}
      initialCaptureStudent={initialCaptureStudent}
      initialCaptureStudentError={initialCaptureStudentError}
      tagSuggestions={tagSuggestions}
    />
  );
}
