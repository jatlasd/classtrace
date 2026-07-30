import Link from "next/link";
import type { ReactElement } from "react";
import { Circle, Clock3 } from "lucide-react";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
import { StudentEvidenceExportAction } from "@/components/students/student-evidence-export-action";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export type StudentTimelineStudent = {
  id: string;
  displayName: string;
  mentionHandle: string;
  classGroupName?: string;
  schoolLocalId?: string;
};

export type StudentTimelineEvidenceRecord = {
  id: string;
  evidenceDate: string;
  evidenceNote?: string;
  summary: string;
  evidenceType: string;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes?: string;
  validatedAt: string;
  createdAt: string;
};

type StudentTimelinePageProps = {
  student: StudentTimelineStudent;
  evidenceRecords: StudentTimelineEvidenceRecord[];
};

type StudentProfileHeaderProps = {
  student: StudentTimelineStudent;
  evidenceCount: number;
};

type StudentTimelineProps = {
  student: StudentTimelineStudent;
  records: StudentTimelineEvidenceRecord[];
};

type StudentTimelineEvidenceItemProps = {
  record: StudentTimelineEvidenceRecord;
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

function formatTimelineDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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

function StudentTimelineEvidenceItem({
  record,
}: StudentTimelineEvidenceItemProps) {
  return (
    <li className="relative pl-8">
      <span
        className="absolute left-0 top-5 flex size-4 items-center justify-center rounded-full border border-validated/60 bg-validated"
        aria-hidden="true"
      >
        <span className="size-1.5 rounded-full bg-validated-foreground" />
      </span>
      <article className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {formatTimelineDate(record.evidenceDate)}
            </p>
            <EvidenceRecordContent
              record={record}
              showStructuredSummary={false}
            />
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-validated/60 bg-validated/35 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
            <Circle className="size-2 fill-current" />
            Validated
          </span>
        </div>
      </article>
    </li>
  );
}

function StudentTimelineEmptyState({
  student,
}: {
  student: StudentTimelineStudent;
}) {
  return (
    <div className="border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
      <div className="mb-3 flex size-10 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
        <Clock3 className="size-5" strokeWidth={1.75} />
      </div>
      <p className="font-medium text-foreground">No validated evidence yet.</p>
      <p className="mt-1">
        Capture a student-specific note for {student.displayName}, review it,
        and this timeline will start here.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href={routes.feed}>Open evidence feed</Link>
      </Button>
    </div>
  );
}

function StudentTimeline({ student, records }: StudentTimelineProps) {
  return (
    <section aria-labelledby="student-evidence-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="student-evidence-heading"
            className="font-display text-xl font-semibold text-foreground"
          >
            Evidence
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Newest evidence appears first.
          </p>
        </div>
      </div>
      <div className="min-w-0">
        {records.length === 0 ? (
          <StudentTimelineEmptyState student={student} />
        ) : (
          <ol className="space-y-4 border-l border-border">
            {records.map((record) => (
              <StudentTimelineEvidenceItem key={record.id} record={record} />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

export function StudentTimelinePage({
  student,
  evidenceRecords,
}: StudentTimelinePageProps): ReactElement {
  return (
    <div className="mx-auto w-full max-w-[980px] px-4 py-7 sm:px-6 lg:px-8">
      <StudentProfileHeader
        student={student}
        evidenceCount={evidenceRecords.length}
      />
      <StudentTimeline student={student} records={evidenceRecords} />
    </div>
  );
}
