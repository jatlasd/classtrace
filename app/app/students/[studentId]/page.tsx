import Link from "next/link";
import type { ReactElement } from "react";
import { StudentTimelinePage } from "@/components/students/student-timeline-page";
import { Button } from "@/components/ui/button";
import { getCurrentAppWorkspace } from "@/lib/auth/get-current-workspace";
import {
  normalizeStudentTimelineDateRange,
  normalizeStudentTimelineSort,
} from "@/lib/evidence/student-timeline-filtering";
import { getStudentTimelineRecordsForWorkspace } from "@/lib/evidence/student-timeline-records";
import { routes } from "@/lib/routes";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type StudentProfilePageProps = {
  params: Promise<{ studentId: string }>;
  searchParams?: Promise<{
    q?: string | string[];
    range?: string | string[];
    sort?: string | string[];
  }>;
};

function singleParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function StudentProfilePage({
  params,
  searchParams,
}: StudentProfilePageProps): Promise<ReactElement> {
  const [{ studentId }, workspace, query] = await Promise.all([
    params,
    getCurrentAppWorkspace(),
    searchParams ?? Promise.resolve({}),
  ]);
  const timeline = await getStudentTimelineRecordsForWorkspace(
    workspace.workspaceId,
    studentId
  );

  if (!timeline) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 py-7 sm:px-6 lg:px-8">
        <section className="border border-border bg-card/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Student timeline
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            Student not found on your roster.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Choose an active roster student before opening a timeline.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={routes.roster}>Back to roster</Link>
          </Button>
        </section>
      </div>
    );
  }

  return (
    <StudentTimelinePage
      student={timeline.student}
      evidenceRecords={timeline.evidenceRecords}
      initialQuery={singleParam(query.q).slice(
        0,
        INPUT_LIMITS.evidenceSearchQuery
      )}
      initialDateRange={normalizeStudentTimelineDateRange(
        singleParam(query.range)
      )}
      initialSort={normalizeStudentTimelineSort(singleParam(query.sort))}
    />
  );
}
