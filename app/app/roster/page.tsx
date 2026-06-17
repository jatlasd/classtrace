import Link from "next/link";
import { RosterStudentRowActions } from "@/components/roster/roster-student-row-actions";
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
    <li className="border-b border-border last:border-b-0">
      <div className="grid gap-3 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_180px_150px] sm:items-center sm:px-5">
        <Link
          href={routes.student(student.id)}
          aria-label={`Open ${student.displayName} timeline`}
          className="-m-1 flex min-w-0 items-center gap-3 rounded-md p-1 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/20"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-[11px] font-bold text-foreground">
            {studentInitials(student.displayName)}
          </div>
          <div className="min-w-0">
            <p className="font-medium leading-snug text-foreground">{student.displayName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Open timeline</p>
          </div>
        </Link>
        <p className="text-sm text-muted-foreground sm:text-foreground">
          @{student.mentionHandle}
        </p>
        <p className="text-xs text-muted-foreground">
          {student.classGroupName || "No group yet"}
        </p>
        <RosterStudentRowActions
          studentId={student.id}
          studentDisplayName={student.displayName}
        />
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
    <div className="mx-auto w-full max-w-[1180px] px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-6 grid gap-5 border-b border-border pb-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div className="max-w-3xl">
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
          <div className="border-l-4 border-primary bg-card/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Capture readiness
            </p>
            <p className="mt-1 text-sm text-foreground">
              {students.length} {students.length === 1 ? "student" : "students"} ready
              for capture.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href={routes.feed}>Continue to evidence feed</Link>
            </Button>
          </div>
        )}
      </header>

      <div className="mb-8 grid border border-border bg-card/55 lg:grid-cols-2">
        <section className="border-b border-border p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <ManualStudentEntryForm isFirstStudent={rosterIsEmpty} />
        </section>

        <aside className="p-4 sm:p-5">
          <RosterImportForm existingStudents={existingImportStudents} />
        </aside>
      </div>

      <section>
        <div className="mb-2 grid gap-2 border-b border-border pb-2 sm:grid-cols-[minmax(0,1fr)_180px_150px]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your students
          </h2>
          <p className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:block">
            Handle
          </p>
          <p className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:block">
            Group
          </p>
        </div>

        {students.length === 0 ? (
          <div className="border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">No students on your roster yet.</p>
            <p className="mt-1">
              Add one student above before opening the evidence feed for your first
              student-specific capture.
            </p>
          </div>
        ) : (
          <ul className="border border-border bg-card/60">
            {students.map((student) => (
              <StudentRow key={student.id} student={student} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
