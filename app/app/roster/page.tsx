import Link from "next/link";
import { Archive, ArrowLeft, BookOpen, Users } from "lucide-react";
import { ClassGroupActions } from "@/components/roster/class-group-actions";
import { ClassGroupForm } from "@/components/roster/class-group-form";
import { ManualStudentEntryForm } from "@/components/roster/manual-student-entry-form";
import { RosterStudentEditForm } from "@/components/roster/roster-student-edit-form";
import { RosterStudentRowActions } from "@/components/roster/roster-student-row-actions";
import { Button } from "@/components/ui/button";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import {
  getClassRosterReadinessForWorkspace,
  listActiveClassGroupsForWorkspace,
  listActiveRosterStudentsForClass,
  listArchivedClassGroupsForWorkspace,
  type ClassGroupDisplay,
  type ClassRosterStudentDisplay,
} from "@/lib/classes/class-groups";
import { routes } from "@/lib/routes";
import {
  listActiveRosterStudentsForWorkspace,
  type RosterStudentDisplay,
} from "@/lib/students/roster-students";

type RosterPageProps = {
  searchParams?: Promise<{ classId?: string | string[]; view?: string | string[] }>;
};

type ActiveClassOption = {
  id: string;
  name: string;
};

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

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function classHref(classGroupId: string): string {
  return `${routes.roster}?classId=${classGroupId}`;
}

function archivedClassesHref(): string {
  return `${routes.roster}?view=archived`;
}

function StudentRow({
  student,
  activeClasses,
  showClassName,
}: {
  student: RosterStudentDisplay | ClassRosterStudentDisplay;
  activeClasses: ActiveClassOption[];
  showClassName: boolean;
}) {
  const classGroupId = "classGroupId" in student ? student.classGroupId : null;
  const classGroupName =
    "classGroupName" in student ? student.classGroupName : null;
  const schoolLocalId = student.schoolLocalId;

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
            <p className="font-medium leading-snug text-foreground">
              {student.displayName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Open timeline</p>
          </div>
        </Link>
        <p className="text-sm text-muted-foreground sm:text-foreground">
          @{student.mentionHandle}
        </p>
        <div className="text-xs text-muted-foreground">
          {showClassName ? <p>{classGroupName || "Needs class"}</p> : null}
          {schoolLocalId ? <p>Local ID: {schoolLocalId}</p> : null}
        </div>
        <div className="space-y-2 border-t border-border/50 pt-3 sm:col-span-3">
          <RosterStudentEditForm
            student={{
              id: student.id,
              displayName: student.displayName,
              mentionHandle: student.mentionHandle,
              schoolLocalId,
              classGroupId,
            }}
            activeClasses={activeClasses}
          />
          <RosterStudentRowActions
            studentId={student.id}
            studentDisplayName={student.displayName}
          />
        </div>
      </div>
    </li>
  );
}

function ClassList({
  activeClasses,
  activeStudents,
}: {
  activeClasses: ClassGroupDisplay[];
  activeStudents: RosterStudentDisplay[];
}) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="mb-2 grid gap-2 border-b border-border pb-2 sm:grid-cols-[minmax(0,1fr)_160px_120px]">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active classes
            </h2>
            <p className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:block">
              Students
            </p>
            <p className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:block">
              Action
            </p>
          </div>

          {activeClasses.length === 0 ? (
            <div className="border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">No classes yet.</p>
              <p className="mt-1">
                Create your first class, then add students inside that class.
              </p>
            </div>
          ) : (
            <ul className="border border-border bg-card/60">
              {activeClasses.map((classGroup) => {
                const studentCount = activeStudents.filter(
                  (student) => student.classGroupId === classGroup.id && student.hasActiveClass
                ).length;

                return (
                  <li key={classGroup.id} className="border-b border-border last:border-b-0">
                    <div className="grid gap-3 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_160px_120px] sm:items-center sm:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
                          <BookOpen className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium leading-snug text-foreground">
                            {classGroup.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Class roster
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {studentCount} {studentCount === 1 ? "student" : "students"}
                      </p>
                      <Button asChild size="sm" variant="outline">
                        <Link href={classHref(classGroup.id)}>Open class</Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border border-border bg-card/55 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Class-first setup
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
            Create your first class
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Classes organize roster setup only. Capture stays global once at least one
            student is ready.
          </p>
          <div className="mt-4">
            <ClassGroupForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchivedClassesView({
  archivedClasses,
}: {
  archivedClasses: ClassGroupDisplay[];
}) {
  return (
    <section className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={routes.roster}>
          <ArrowLeft className="size-3.5" />
          Back to active classes
        </Link>
      </Button>
      <div className="border border-border bg-card/60 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
            <Archive className="size-4" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Archived classes
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Archived classes are hidden from active roster setup. Students cannot be
              added here.
            </p>
          </div>
        </div>
      </div>

      {archivedClasses.length === 0 ? (
        <div className="border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
          No archived classes yet.
        </div>
      ) : (
        <ul className="border border-border bg-card/60">
          {archivedClasses.map((classGroup) => (
            <li key={classGroup.id} className="border-b border-border px-4 py-3.5 last:border-b-0 sm:px-5">
              <p className="font-medium leading-snug text-foreground">{classGroup.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Archived class
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OpenClassView({
  classGroup,
  students,
  activeClasses,
  isFirstStudent,
}: {
  classGroup: ClassGroupDisplay;
  students: ClassRosterStudentDisplay[];
  activeClasses: ActiveClassOption[];
  isFirstStudent: boolean;
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={routes.roster}>
            <ArrowLeft className="size-3.5" />
            Back to classes
          </Link>
        </Button>
        {students.length > 0 ? (
          <Button asChild size="sm" variant="outline">
            <Link href={routes.feed}>Continue to evidence feed</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="border border-border bg-card/60 p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
                <Users className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Open class
                </p>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {classGroup.name}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Add students here. Capture will still happen from the global evidence
                  feed.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 grid gap-2 border-b border-border pb-2 sm:grid-cols-[minmax(0,1fr)_180px_150px]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Students
              </h3>
              <p className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:block">
                Handle
              </p>
              <p className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:block">
                Details
              </p>
            </div>

            {students.length === 0 ? (
              <div className="border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">No students in this class yet.</p>
                <p className="mt-1">
                  Add one student to make the evidence feed available for capture.
                </p>
              </div>
            ) : (
              <ul className="border border-border bg-card/60">
                {students.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    activeClasses={activeClasses}
                    showClassName={false}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-border bg-card/55 p-4 sm:p-5">
            <ManualStudentEntryForm
              isFirstStudent={isFirstStudent}
              classGroupId={classGroup.id}
              className={classGroup.name}
            />
          </div>
          <ClassGroupActions classGroupId={classGroup.id} className={classGroup.name} />
          <div className="border border-border bg-card/60 p-4 text-sm leading-relaxed text-muted-foreground">
            Paste-list import will move into this class view next. For now, add students
            one at a time so every active student has a class.
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function RosterPage({ searchParams }: RosterPageProps) {
  const workspace = await getCurrentWorkspace();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedClassId = getSingleParam(resolvedSearchParams.classId);
  const view = getSingleParam(resolvedSearchParams.view);
  const [
    activeClasses,
    archivedClasses,
    activeStudents,
    classReadiness,
  ] = await Promise.all([
    listActiveClassGroupsForWorkspace(workspace.workspaceId),
    listArchivedClassGroupsForWorkspace(workspace.workspaceId),
    listActiveRosterStudentsForWorkspace(workspace.workspaceId),
    getClassRosterReadinessForWorkspace(workspace.workspaceId),
  ]);
  const activeClassOptions = activeClasses.map((classGroup) => ({
    id: classGroup.id,
    name: classGroup.name,
  }));
  const selectedClass = selectedClassId
    ? activeClasses.find((classGroup) => classGroup.id === selectedClassId) ?? null
    : null;
  const selectedClassStudents = selectedClass
    ? await listActiveRosterStudentsForClass({
        workspaceId: workspace.workspaceId,
        classGroupId: selectedClass.id,
      })
    : null;
  const unassignedStudents = activeStudents.filter((student) => !student.hasActiveClass);
  const selectedClassMissing = Boolean(selectedClassId && !selectedClass);
  const readyForCapture =
    classReadiness.activeStudentCount > 0 &&
    classReadiness.activeStudentsWithoutActiveClassCount === 0;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-6 grid gap-5 border-b border-border pb-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Roster
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {selectedClass
              ? selectedClass.name
              : view === "archived"
                ? "Archived classes"
                : "Classes in your roster"}
          </h1>
          <div className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
            <p>
              Classes organize roster setup. Capture remains global and student-specific.
            </p>
            <p>Your roster is private to your ClassTrace workspace.</p>
          </div>
        </div>
        <div className="border-l-4 border-primary bg-card/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {readyForCapture ? "Capture readiness" : "Class setup"}
          </p>
          <p className="mt-1 text-sm text-foreground">
            {readyForCapture
              ? `${classReadiness.activeStudentCount} ${
                  classReadiness.activeStudentCount === 1 ? "student" : "students"
                } ready for capture.`
              : "Create a class and add one student before capture."}
          </p>
          {readyForCapture ? (
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href={routes.feed}>Continue to evidence feed</Link>
            </Button>
          ) : null}
        </div>
      </header>

      {view === "archived" ? (
        <ArchivedClassesView archivedClasses={archivedClasses} />
      ) : selectedClass ? (
        <OpenClassView
          classGroup={selectedClass}
          students={selectedClassStudents ?? []}
          activeClasses={activeClassOptions}
          isFirstStudent={activeStudents.length === 0}
        />
      ) : selectedClassMissing ? (
        <div className="border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">
            This class could not be opened.
          </p>
          <p className="mt-1">Return to your active classes and choose another class.</p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href={routes.roster}>Back to classes</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open a class to manage students.
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link href={archivedClassesHref()}>View archived classes</Link>
            </Button>
          </div>
          <ClassList activeClasses={activeClasses} activeStudents={activeStudents} />
          {unassignedStudents.length > 0 ? (
            <section className="space-y-3">
              <div className="border-l-4 border-primary bg-card/60 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Needs class
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Assign these existing students to active classes before beta roster setup
                  is ready.
                </p>
              </div>
              <ul className="border border-border bg-card/60">
                {unassignedStudents.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    activeClasses={activeClassOptions}
                    showClassName
                  />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
