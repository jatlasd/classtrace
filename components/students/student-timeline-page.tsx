import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { BookOpenText, Circle, Clock3 } from "lucide-react";
import { StudentEvidenceExportAction } from "@/components/students/student-evidence-export-action";
import { Button } from "@/components/ui/button";
import { formatTagLabel } from "@/lib/format-tag";
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

function Chip({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "tag" | "evidence";
}) {
  const className =
    variant === "tag"
      ? "border-border bg-muted/60 text-link"
      : variant === "evidence"
        ? "border-primary/25 bg-primary/10 text-primary"
        : "border-border bg-card text-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function StudentProfileHeader({
  student,
  evidenceCount,
}: StudentProfileHeaderProps) {
  const metadata = [
    student.classGroupName ?? "No group yet",
    student.schoolLocalId ? `Local ID ${student.schoolLocalId}` : null,
  ].filter(Boolean);

  return (
    <header className="mb-6 border-b border-border pb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={routes.roster}>Back to roster</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={routes.feed}>Capture evidence</Link>
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
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
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>@{student.mentionHandle}</span>
              {metadata.map((item) => (
                <span key={item} className="before:mr-2 before:content-['/']">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-l-4 border-validated bg-card/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Validated evidence
          </p>
          <p className="mt-1 text-sm text-foreground">
            {evidenceCount} {evidenceCount === 1 ? "record" : "records"} ready
            for this timeline.
          </p>
          <div className="mt-3">
            <StudentEvidenceExportAction
              studentId={student.id}
              studentName={student.displayName}
              evidenceCount={evidenceCount}
            />
          </div>
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
      <article className="border border-border bg-card p-4 shadow-paper">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {formatTimelineDate(record.evidenceDate)}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-foreground">
              {record.summary}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-validated/60 bg-validated/35 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
            <Circle className="size-2 fill-current" />
            Validated
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {record.topic ? <Chip>{record.topic}</Chip> : null}
          {record.performance ? <Chip>{record.performance}</Chip> : null}
          {record.behavior ? <Chip>{record.behavior}</Chip> : null}
          <Chip variant="evidence">{record.evidenceType}</Chip>
          {record.tags.map((tag) => (
            <Chip key={tag} variant="tag">
              {formatTagLabel(tag)}
            </Chip>
          ))}
        </div>

        {record.followUpNotes ? (
          <p className="mt-3 border-t border-border/50 pt-2.5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Follow-up:</span>{" "}
            {record.followUpNotes}
          </p>
        ) : null}
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
    <section className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="border border-border bg-card/60 p-4">
        <div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
          <BookOpenText className="size-5" strokeWidth={1.75} />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
          Evidence timeline
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Validated records for one roster student, ordered by evidence date.
        </p>
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
    <div className="mx-auto w-full max-w-[1180px] px-4 py-7 sm:px-6 lg:px-8">
      <StudentProfileHeader
        student={student}
        evidenceCount={evidenceRecords.length}
      />
      <StudentTimeline student={student} records={evidenceRecords} />
    </div>
  );
}
