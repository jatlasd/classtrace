"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Display name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className={fieldInputClass}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Handle
        </label>
        <input
          type="text"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          className={fieldInputClass}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Grade / group
        </label>
        <input
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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">My roster</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Students you can @mention in captures.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          For this POC, your roster saves in this browser only.
        </p>
      </header>

      <section className="mb-8 rounded-card border border-border bg-card p-4 shadow-paper">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Add student</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Use a handle that matches how you type @mentions (for example, @Mary).
        </p>

        <StudentEditor
          key={`add-${students.length}`}
          submitLabel="Add to roster"
          onSubmit={handleAddStudent}
        />
      </section>

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
          <p className="rounded-card border border-border bg-card p-6 text-sm text-muted-foreground">
            No students on your roster yet.
          </p>
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
