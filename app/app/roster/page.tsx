"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import {
  addStudent,
  deleteStudent,
  getAllStudents,
  updateStudent,
  type Student,
} from "@/lib/students";

const fieldInputClass =
  "h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

function formatGradeGroup(student: Student): string {
  return [student.grade, student.group].filter(Boolean).join(" · ");
}

function parseGradeGroup(value: string): { grade?: string; group?: string } {
  const gradeGroupParts = value.trim().split("·").map((part) => part.trim());
  const grade = gradeGroupParts[0] || undefined;
  const group =
    gradeGroupParts.length > 1 ? gradeGroupParts.slice(1).join(" · ") : undefined;

  return { grade, group };
}

function studentToGradeGroup(student: Student): string {
  return formatGradeGroup(student);
}

type StudentEditorProps = {
  student?: Student;
  submitLabel: string;
  onSubmit: (values: {
    displayName: string;
    handle: string;
    grade?: string;
    group?: string;
  }) => string | null;
  onCancel?: () => void;
};

function StudentEditor({
  student,
  submitLabel,
  onSubmit,
  onCancel,
}: StudentEditorProps) {
  const [displayName, setDisplayName] = useState(student?.displayName ?? "");
  const [handle, setHandle] = useState(student?.handle ?? "");
  const [gradeGroup, setGradeGroup] = useState(
    student ? studentToGradeGroup(student) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();
  const displayNameId = `${fieldId}-display-name`;
  const handleId = `${fieldId}-handle`;
  const gradeGroupId = `${fieldId}-grade-group`;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const { grade, group } = parseGradeGroup(gradeGroup);
    const resultError = onSubmit({
      displayName,
      handle,
      grade,
      group,
    });

    if (resultError) {
      setError(resultError);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label
          htmlFor={displayNameId}
          className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Display name
        </label>
        <input
          id={displayNameId}
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className={fieldInputClass}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor={handleId}
          className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Handle
        </label>
        <input
          id={handleId}
          type="text"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          className={fieldInputClass}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor={gradeGroupId}
          className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Grade / group
        </label>
        <input
          id={gradeGroupId}
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

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default function RosterPage() {
  const [students, setStudents] = useState<Student[]>(() => getAllStudents());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const rosterIsEmpty = students.length === 0;

  useEffect(() => {
    queueMicrotask(() => {
      setStudents(getAllStudents());
    });
  }, []);

  function refreshStudents() {
    setStudents(getAllStudents());
  }

  function handleAddStudent(values: {
    displayName: string;
    handle: string;
    grade?: string;
    group?: string;
  }): string | null {
    const result = addStudent(values);

    if (!result.ok) {
      return result.error;
    }

    refreshStudents();
    return null;
  }

  function handleUpdateStudent(
    studentId: string,
    values: {
      displayName: string;
      handle: string;
      grade?: string;
      group?: string;
    }
  ): string | null {
    const result = updateStudent(studentId, values);

    if (!result.ok) {
      return result.error;
    }

    setEditingId(null);
    setListError(null);
    refreshStudents();
    return null;
  }

  function handleDeleteStudent(student: Student) {
    const confirmed = window.confirm(
      `Remove ${student.displayName} from your roster? Captures that mention them will stay, but @${student.handle} may no longer match.`
    );

    if (!confirmed) {
      return;
    }

    const result = deleteStudent(student.id);

    if (!result.ok) {
      setListError(result.error);
      return;
    }

    if (editingId === student.id) {
      setEditingId(null);
    }

    setListError(null);
    refreshStudents();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Roster setup
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {rosterIsEmpty
            ? "Add your first student to start capturing evidence."
            : "My roster"}
        </h1>
        <div className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
          <p>
            Captures need one student from your roster before they can become useful
            evidence.
          </p>
          <p>Your roster is private to your ClassTrace workspace.</p>
          <p className="text-xs">
            For this POC, your roster saves in this browser only.
          </p>
        </div>
      </header>

      <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]">
        <section className="rounded-card border border-border bg-card p-4 shadow-paper">
          <div className="mb-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recommended first step
            </p>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Start with one student
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Use a name and handle your capture notes will recognize. You can add
              more students after the first one.
            </p>
          </div>

          <StudentEditor
            key={`add-${students.length}`}
            submitLabel="Add to roster"
            onSubmit={handleAddStudent}
          />
        </section>

        <aside className="rounded-card border border-border bg-card p-4 shadow-paper">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Another setup path
          </p>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Import a basic list later
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Roster import will preview students before saving. For now, start with
            one student and add more when you need them.
          </p>
          <Button type="button" variant="outline" size="sm" disabled className="mt-4">
            Import planned
          </Button>
        </aside>
      </div>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your students
        </h2>

        {listError && (
          <p className="mb-3 text-sm text-destructive" role="alert">
            {listError}
          </p>
        )}

        {students.length === 0 ? (
          <div className="rounded-card border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-paper">
            <p className="font-medium text-foreground">No students on your roster yet.</p>
            <p className="mt-1">
              Add your first student above, then return to the evidence feed for your
              first student-specific capture.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={routes.feed}>Back to evidence feed</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {students.map((student) => (
              <li
                key={student.id}
                className="rounded-card border border-border bg-card p-4 shadow-paper"
              >
                {editingId === student.id ? (
                  <StudentEditor
                    student={student}
                    submitLabel="Save changes"
                    onSubmit={(values) => handleUpdateStudent(student.id, values)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-start gap-4">
                    <Link
                      href={routes.student(student.id)}
                      className="flex min-w-0 flex-1 items-center gap-4 transition-colors hover:opacity-80"
                    >
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${student.colorClass}`}
                      >
                        {student.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">
                          {student.displayName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{student.handle}
                        </p>
                        {formatGradeGroup(student) && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatGradeGroup(student)}
                          </p>
                        )}
                      </div>
                    </Link>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setListError(null);
                          setEditingId(student.id);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteStudent(student)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
