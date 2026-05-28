"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { NoteContent } from "@/components/dashboard/note-content";
import { getCapturesForStudent } from "@/lib/evidence/student-captures";
import { formatTagLabel } from "@/lib/format-tag";
import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";
import { draftToDisplay } from "@/lib/note-processing/draft-to-display";
import { getStudentById, type Student } from "@/lib/students";

type StudentProfilePageProps = {
  params: Promise<{ studentId: string }>;
};

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  const { studentId } = use(params);
  const [student, setStudent] = useState<Student | undefined>(() =>
    getStudentById(studentId)
  );
  const [captures, setCaptures] = useState(() => getCapturesForStudent(studentId));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate student profile from localStorage after mount
    setStudent(getStudentById(studentId));
    setCaptures(getCapturesForStudent(studentId));
  }, [studentId]);

  if (!student) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to feed
            </Link>
            <Link
              href="/students"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              My roster
            </Link>
          </div>
          <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Student not found on your roster.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to feed
          </Link>
          <Link
            href="/students"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            My roster
          </Link>
        </div>

        <header className="mb-8 flex items-start gap-4">
          <div
            className={`flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${student.colorClass}`}
          >
            {student.initials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {student.displayName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[student.grade, student.group].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">@{student.handle}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {captures.length}{" "}
              {captures.length === 1 ? "capture" : "captures"} on record
            </p>
          </div>
        </header>

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Evidence timeline
          </h2>

          {captures.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No evidence captures mention {student.displayName} yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {captures.map((capture) => {
                const draft = buildNoteDraft(capture.note);
                const display = draftToDisplay(draft);

                return (
                  <li
                    key={capture.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <p className="mb-3 text-xs text-muted-foreground">
                      {capture.timestamp}
                    </p>

                    <NoteContent text={capture.note} />

                    <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-3">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        ClassTrace read this as
                      </p>
                      <p className="text-sm text-foreground">
                        {display.summaryLine}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {display.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded-full border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-link"
                          >
                            {formatTagLabel(tag)}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 border-t border-border/50 pt-2.5 text-xs leading-relaxed text-muted-foreground">
                        {capture.summary}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
