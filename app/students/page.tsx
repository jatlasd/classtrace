"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addStudent, getAllStudents, type Student } from "@/lib/students";

const fieldInputClass =
  "h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

function formatGradeGroup(student: Student): string {
  return [student.grade, student.group].filter(Boolean).join(" · ");
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(() => getAllStudents());
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [gradeGroup, setGradeGroup] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAddStudent(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const gradeGroupParts = gradeGroup.trim().split("·").map((part) => part.trim());
    const grade = gradeGroupParts[0] || undefined;
    const group =
      gradeGroupParts.length > 1 ? gradeGroupParts.slice(1).join(" · ") : undefined;

    const result = addStudent({
      displayName,
      handle,
      grade,
      group,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setStudents(getAllStudents());
    setDisplayName("");
    setHandle("");
    setGradeGroup("");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to feed
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">My roster</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Students you can @mention in captures.
          </p>
        </header>

        <section className="mb-8 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Add student</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Use a handle that matches how you type @mentions (for example, @Mary).
          </p>

          <form onSubmit={handleAddStudent} className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="display-name"
                className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Display name
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className={fieldInputClass}
                placeholder="Mary Smith"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="handle"
                className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Handle
              </label>
              <input
                id="handle"
                type="text"
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                className={fieldInputClass}
                placeholder="Mary"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="grade-group"
                className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Grade / group
              </label>
              <input
                id="grade-group"
                type="text"
                value={gradeGroup}
                onChange={(event) => setGradeGroup(event.target.value)}
                className={fieldInputClass}
                placeholder="5th Grade · Period 2"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" size="sm">
              Add to roster
            </Button>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your students
          </h2>

          {students.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No students on your roster yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {students.map((student) => (
                <li key={student.id}>
                  <Link
                    href={`/students/${student.id}`}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
                  >
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${student.colorClass}`}
                    >
                      {student.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{student.displayName}</p>
                      <p className="text-sm text-muted-foreground">@{student.handle}</p>
                      {formatGradeGroup(student) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatGradeGroup(student)}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
