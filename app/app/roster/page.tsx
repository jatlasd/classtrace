import Link from "next/link";
import { ManualStudentEntryForm } from "@/components/roster/manual-student-entry-form";
import { RosterImportForm } from "@/components/roster/roster-import-form";
import { Button } from "@/components/ui/button";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { listExistingRosterImportStudentsForWorkspace } from "@/lib/import/roster-import";
import { routes } from "@/lib/routes";
import {
  listActiveRosterStudentsForWorkspace,
  type RosterStudentDisplay,
} from "@/lib/students/roster-students";

function studentInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "??";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StudentRow({ student }: { student: RosterStudentDisplay }) {
  return (
    <li className="border-b border-border px-4 py-4 last:border-b-0 sm:px-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
          {studentInitials(student.displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{student.displayName}</p>
          <p className="text-sm text-muted-foreground">@{student.mentionHandle}</p>
          {student.classGroupName && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {student.classGroupName}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export default async function RosterPage() {
  const workspace = await getCurrentWorkspace();
  const [students, existingImportStudents] = await Promise.all([
    listActiveRosterStudentsForWorkspace(workspace.workspaceId),
    listExistingRosterImportStudentsForWorkspace(workspace.workspaceId),
  ]);
  const rosterIsEmpty = students.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-7 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Roster
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {rosterIsEmpty
              ? "Add your first student to start capturing evidence."
              : "Students in your roster"}
          </h1>
          <div className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
            <p>
              Captures need one student from your roster before they can become useful
              evidence.
            </p>
            <p>Your roster is private to your ClassTrace workspace.</p>
          </div>
        </div>
        {!rosterIsEmpty && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {students.length} {students.length === 1 ? "student" : "students"} ready
              for capture.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href={routes.feed}>Continue to evidence feed</Link>
            </Button>
          </div>
        )}
      </header>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-card border border-border bg-card/70 p-5">
          <ManualStudentEntryForm isFirstStudent={rosterIsEmpty} />
        </section>

        <aside className="rounded-card border border-border bg-card/70 p-5">
          <RosterImportForm existingStudents={existingImportStudents} />
        </aside>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your students
          </h2>
          {!rosterIsEmpty && (
            <p className="text-xs text-muted-foreground">
              Add more students above whenever your roster changes.
            </p>
          )}
        </div>

        {students.length === 0 ? (
          <div className="rounded-card border border-border bg-card/70 p-6 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">No students on your roster yet.</p>
            <p className="mt-1">
              Add one student above before opening the evidence feed for your first
              student-specific capture.
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-card border border-border bg-card/70">
            {students.map((student) => (
              <StudentRow key={student.id} student={student} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
