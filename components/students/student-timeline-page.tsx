import Link from "next/link";
import type { ReactElement } from "react";
import { Check, Clock3 } from "lucide-react";
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
  summary?: string;
  evidenceType?: string;
  hasPhoto?: boolean;
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
    <header className="mb-4 border-b border-border pb-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-xs font-bold text-foreground">
            {studentInitials(student.displayName)}
          </div>
          <div className="min-w-0">
            <h1 className="font-sans text-lg font-semibold tracking-tight text-foreground">
              {student.displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>@{student.mentionHandle}</span>
              {metadata.map((item) => (
                <span key={item} className="border-l border-border pl-2">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <p className="mr-1 text-xs text-muted-foreground">
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
    <li className="border-b border-border last:border-b-0">
      <article className="grid gap-3 px-4 py-3 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:px-5">
        <div className="flex items-start justify-between gap-3 sm:block">
          <p className="text-xs font-medium tabular-nums text-muted-foreground">
            {formatTimelineDate(record.evidenceDate)}
          </p>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-validated/60 bg-validated/35 px-2 py-0.5 text-[11px] font-semibold text-validated-foreground sm:hidden">
            <Check className="size-3" aria-hidden="true" />
            Validated
          </span>
        </div>
        <div className="min-w-0">
          <EvidenceRecordContent
            record={record}
            showStructuredSummary={false}
            compact
          />
        </div>
        <span className="hidden w-fit items-center gap-1.5 self-start rounded-md border border-validated/60 bg-validated/35 px-2 py-0.5 text-[11px] font-semibold text-validated-foreground sm:inline-flex">
          <Check className="size-3" aria-hidden="true" />
          Validated
        </span>
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
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h2
            id="student-evidence-heading"
            className="font-sans text-sm font-semibold text-foreground"
          >
            Evidence
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Newest evidence appears first.
          </p>
        </div>
      </div>
      <div className="min-w-0">
        {records.length === 0 ? (
          <StudentTimelineEmptyState student={student} />
        ) : (
          <ol className="overflow-hidden rounded-lg border border-border bg-card">
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
    <div className="mx-auto w-full max-w-[1100px] px-3 py-4 sm:px-5 sm:py-5">
      <StudentProfileHeader
        student={student}
        evidenceCount={evidenceRecords.length}
      />
      <StudentTimeline student={student} records={evidenceRecords} />
    </div>
  );
}
