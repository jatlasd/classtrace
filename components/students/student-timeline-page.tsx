import Link from "next/link";
import type { ReactElement } from "react";
import { StudentEvidenceExportAction } from "@/components/students/student-evidence-export-action";
import {
  StudentTimeline,
  type StudentTimelineEvidenceRecord,
} from "@/components/students/student-timeline";
import { Button } from "@/components/ui/button";
import type {
  StudentTimelineDateRange,
  StudentTimelineSort,
} from "@/lib/evidence/student-timeline-filtering";
import { routes } from "@/lib/routes";

export type StudentTimelineStudent = {
  id: string;
  displayName: string;
  mentionHandle: string;
  classGroupName?: string;
  schoolLocalId?: string;
};

type StudentTimelinePageProps = {
  student: StudentTimelineStudent;
  evidenceRecords: StudentTimelineEvidenceRecord[];
  initialQuery: string;
  initialDateRange: StudentTimelineDateRange;
  initialSort: StudentTimelineSort;
};

type StudentProfileHeaderProps = {
  student: StudentTimelineStudent;
  evidenceCount: number;
};

function studentInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "ST";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function StudentProfileHeader({
  student,
  evidenceCount,
}: StudentProfileHeaderProps) {
  const metadata = [
    student.classGroupName ? `Class ${student.classGroupName}` : "No class yet",
    student.schoolLocalId ? `Local ID ${student.schoolLocalId}` : null,
  ].filter(Boolean);

  return (
    <header className="mb-6 border-b border-border pb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={routes.roster}>Back to roster</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={routes.studentReport(student.id)}>View report</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.feed}>Capture evidence</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-sm font-bold text-foreground">
            {studentInitials(student.displayName)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Student timeline
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
              {student.displayName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>@{student.mentionHandle}</span>
              {metadata.map((item) => (
                <span key={item} className="border-l border-border pl-3">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              {evidenceCount}
            </span>{" "}
            validated {evidenceCount === 1 ? "record" : "records"}
          </p>
          <StudentEvidenceExportAction
            studentId={student.id}
            studentName={student.displayName}
            evidenceCount={evidenceCount}
          />
        </div>
      </div>
    </header>
  );
}

export function StudentTimelinePage({
  student,
  evidenceRecords,
  initialQuery,
  initialDateRange,
  initialSort,
}: StudentTimelinePageProps): ReactElement {
  return (
    <div className="mx-auto w-full max-w-[980px] px-4 py-7 sm:px-6 lg:px-8">
      <StudentProfileHeader
        student={student}
        evidenceCount={evidenceRecords.length}
      />
      <StudentTimeline
        studentDisplayName={student.displayName}
        records={evidenceRecords}
        initialQuery={initialQuery}
        initialDateRange={initialDateRange}
        initialSort={initialSort}
      />
    </div>
  );
}
