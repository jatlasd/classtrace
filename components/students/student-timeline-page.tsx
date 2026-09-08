import Link from "next/link";
import type { ReactElement } from "react";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
import { ValidatedStamp } from "@/components/evidence/validated-stamp";
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

type StudentTimelineProps = {
  student: StudentTimelineStudent;
  records: StudentTimelineEvidenceRecord[];
};

type StudentTimelineEvidenceItemProps = {
  record: StudentTimelineEvidenceRecord;
};

function formatTimelineDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMonth(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function describeSpan(records: StudentTimelineEvidenceRecord[]): string | null {
  if (records.length === 0) return null;
  const dates = records
    .map((record) => new Date(record.evidenceDate))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (dates.length === 0) return null;
  const format = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });
  const first = format.format(dates[0]);
  const last = format.format(dates[dates.length - 1]);
  return first === last ? first : `${first} – ${last}`;
}

function groupByMonth(records: StudentTimelineEvidenceRecord[]): { key: string; label: string; records: StudentTimelineEvidenceRecord[]; }[] {
  const groups: { key: string; label: string; records: StudentTimelineEvidenceRecord[]; }[] = [];
  for (const record of records) {
    const date = new Date(record.evidenceDate);
    const key = Number.isNaN(date.getTime()) ? "recent" : `${date.getFullYear()}-${date.getMonth()}`;
    const group = groups.at(-1);
    if (group && group.key === key) {
      group.records.push(record);
    } else {
      groups.push({ key, label: formatMonth(record.evidenceDate), records: [record] });
    }
  }
  return groups;
}

function StudentProfileHeader({
  student,
  records,
}: {
  student: StudentTimelineStudent;
  records: StudentTimelineEvidenceRecord[];
}) {
  const evidenceCount = records.length;
  const span = describeSpan(records);

  return (
    <header className="mb-10">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Link
          href={routes.roster}
          className="label rounded-full text-fg-2 underline decoration-line-2 underline-offset-4 outline-none transition-colors hover:text-fg hover:decoration-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
        >
          Students
        </Link>
        {student.classGroupName ? (
          <>
            <span aria-hidden="true" className="label text-fg-3">/</span>
            <span className="label text-fg-2">{student.classGroupName}</span>
          </>
        ) : null}
      </div>
      <h1 className="mt-3 break-words font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.95] text-fg [overflow-wrap:anywhere]">
        {student.displayName}
      </h1>
      <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-fg-2">
        {evidenceCount === 0 ? (
          <>Nothing saved yet for @{student.mentionHandle}.</>
        ) : (
          <>
            <span className="font-semibold text-fg">{evidenceCount}</span>{" "}
            {evidenceCount === 1 ? "piece" : "pieces"} of validated evidence
            {span ? <>, <span className="text-fg">{span}</span></> : null}.
            {student.schoolLocalId ? <span className="text-fg-3"> Local ID {student.schoolLocalId}.</span> : null}
          </>
        )}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button asChild variant="solid">
          <Link href={routes.studentReport(student.id)}>Print report</Link>
        </Button>
        <StudentEvidenceExportAction
          studentId={student.id}
          studentName={student.displayName}
          evidenceCount={evidenceCount}
        />
        <Button asChild variant="ghost">
          <Link href={routes.feed}>Capture something</Link>
        </Button>
      </div>
    </header>
  );
}

function StudentTimelineEvidenceItem({
  record,
}: StudentTimelineEvidenceItemProps) {
  return (
    <li className="trace-node pl-7 py-4">
      <article className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <time dateTime={record.evidenceDate} className="text-[13px] font-semibold text-fg-2">
            {formatTimelineDate(record.evidenceDate)}
          </time>
          <ValidatedStamp className="text-fg-3" />
        </div>
        <EvidenceRecordContent
          record={record}
          showStructuredSummary={false}
          compact
          textClassName="mt-1.5 max-w-[70ch]"
        />
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
    <div className="plate px-6 py-12 text-center text-[15px] leading-relaxed text-fg-2">
      <p className="font-display text-2xl font-semibold text-fg">
        No validated evidence yet.
      </p>
      <p className="mx-auto mt-2 max-w-[44ch]">
        Write one sentence about {student.displayName}, review it, and the trace
        starts here.
      </p>
      <Button asChild className="mt-5">
        <Link href={routes.feed}>Capture something</Link>
      </Button>
    </div>
  );
}

function StudentTimeline({ student, records }: StudentTimelineProps) {
  const groups = groupByMonth(records);

  return (
    <section aria-labelledby="student-evidence-heading">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
        <h2
          id="student-evidence-heading"
          className="font-display text-2xl font-semibold text-fg"
        >
          Evidence
        </h2>
        <p className="label text-fg-3">Newest first</p>
      </div>
      <div className="min-w-0">
        {records.length === 0 ? (
          <div className="mt-4">
            <StudentTimelineEmptyState student={student} />
          </div>
        ) : (
          <ol>
            {groups.map((group) => (
              <li key={group.key} className="pt-6">
                <h3 className="label sticky top-16 z-10 -mx-1 w-fit rounded-full bg-base/95 px-1 py-1 text-fg-2 backdrop-blur">
                  {group.label}
                </h3>
                <ol className="trace mt-1">
                  {group.records.map((record) => (
                    <StudentTimelineEvidenceItem key={record.id} record={record} />
                  ))}
                </ol>
              </li>
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
    <div className="mx-auto w-full max-w-[880px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <StudentProfileHeader student={student} records={evidenceRecords} />
      <StudentTimeline student={student} records={evidenceRecords} />
    </div>
  );
}
