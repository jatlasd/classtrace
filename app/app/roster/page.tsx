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
    <li className="rounded-card border border-border bg-card p-4 shadow-paper">
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
          <p className="text-xs">Roster records now read from your database workspace.</p>
        </div>
      </header>

      <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]">
        <section className="rounded-card border border-border bg-card p-4 shadow-paper">
          <ManualStudentEntryForm />
        </section>

        <aside className="rounded-card border border-border bg-card p-4 shadow-paper">
          <RosterImportForm existingStudents={existingImportStudents} />
        </aside>
      </div>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your students
        </h2>

        {students.length === 0 ? (
          <div className="rounded-card border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-paper">
            <p className="font-medium text-foreground">No students on your roster yet.</p>
            <p className="mt-1">
              Add one student above. After roster setup, you can return to the
              evidence feed for your first student-specific capture.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={routes.feed}>Back to evidence feed</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {students.map((student) => (
              <StudentRow key={student.id} student={student} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
