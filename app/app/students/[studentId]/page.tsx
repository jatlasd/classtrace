"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { NoteContent } from "@/components/dashboard/note-content";
import { summarizeStudentCaptures } from "@/lib/evidence/summarize-student-captures";
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
  const synthesis = useMemo(
    () => summarizeStudentCaptures(captures),
    [captures]
  );

  useEffect(() => {
    queueMicrotask(() => {
      setStudent(getStudentById(studentId));
      setCaptures(getCapturesForStudent(studentId));
    });
  }, [studentId]);

  if (!student) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="rounded-card border border-border bg-card p-6 text-sm text-muted-foreground">
          Student not found on your roster.
        </p>
      </div>
    );
  }

  const { snapshot, insights, patterns } = synthesis;
  const hasCaptures = captures.length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-start gap-4">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${student.colorClass}`}
        >
          {student.initials}
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {student.displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[student.grade, student.group].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">@{student.handle}</p>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Evidence snapshot
        </h2>
        <div className="rounded-card border border-border bg-card p-4 shadow-paper">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total captures
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {snapshot.totalCaptures}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Most recent
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {snapshot.mostRecentTimestamp ?? "No captures yet"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Follow-ups
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {snapshot.followUpCount}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Top tag
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {snapshot.topTag ? formatTagLabel(snapshot.topTag.tag) : "No tags yet"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-3.5" strokeWidth={2} />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What ClassTrace is noticing
          </h2>
        </div>
        <div className="rounded-card border border-border bg-card p-4 shadow-paper">
          {insights.length > 0 ? (
            <ul className="space-y-2">
              {insights.map((insight) => (
                <li
                  key={insight}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mr-1.5 text-primary">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              No evidence mentioning {student.displayName} yet. Patterns will
              appear here once you capture notes that @mention this student.
            </p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Patterns
        </h2>
        <div className="rounded-card border border-border bg-card p-4 shadow-paper">
          {!hasCaptures ? (
            <p className="text-sm text-muted-foreground">No patterns yet.</p>
          ) : (
            <div className="space-y-4">
              {patterns.tags.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {patterns.tags.map(({ tag, count }) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-link"
                      >
                        {formatTagLabel(tag)} · {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patterns.evidenceTypes.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Evidence types
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {patterns.evidenceTypes.map(({ evidenceType, count }) => (
                      <span
                        key={evidenceType}
                        className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        {evidenceType} · {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patterns.followUpCount > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Follow-up
                  </p>
                  <span className="inline-flex rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground">
                    Follow-up suggested · {patterns.followUpCount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Evidence timeline
        </h2>

        {captures.length === 0 ? (
          <p className="rounded-card border border-border bg-card p-6 text-sm text-muted-foreground">
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
                  className="rounded-card border border-border bg-card p-4 shadow-paper"
                >
                  <p className="mb-3 text-xs text-muted-foreground">
                    {capture.timestamp}
                  </p>

                  <NoteContent text={capture.note} />

                  <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      ClassTrace read this as
                    </p>
                    <p className="text-sm text-foreground">{display.summaryLine}</p>
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
  );
}
