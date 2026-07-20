import Link from "next/link";
import { Archive, ArrowLeft, BookOpen } from "lucide-react";
import { ArchivedRosterStudentActions } from "@/components/roster/archived-roster-student-actions";
import { ClassRosterManager } from "@/components/roster/class-roster-manager";
import { ClassGroupForm } from "@/components/roster/class-group-form";
import {
  RosterStudentRow,
  type ActiveClassOption,
} from "@/components/roster/roster-student-row";
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
import {
  listArchivedRosterStudentsForWorkspace,
  type ArchivedRosterStudentDisplay,
} from "@/lib/students/archived-roster-students";
import { listExistingRosterImportStudentsForWorkspace } from "@/lib/import/roster-import";
import { type ExistingRosterImportStudent } from "@/lib/import/parse-roster-import";
import { routes } from "@/lib/routes";
import {
  listActiveRosterStudentsForWorkspace,
  type RosterStudentDisplay,
} from "@/lib/students/roster-students";

type RosterPageProps = {
  searchParams?: Promise<{ classId?: string | string[]; view?: string | string[] }>;
};

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function classHref(classGroupId: string): string {
  return `${routes.roster}?classId=${classGroupId}`;
}

function archivedClassesHref(): string {
  return `${routes.roster}?view=archived`;
}

function ArchivedStudentRow({
  student,
  activeClasses,
}: {
  student: ArchivedRosterStudentDisplay;
  activeClasses: ActiveClassOption[];
}) {
  return (
    <li className="border-b border-border last:border-b-0">
      <div className="grid gap-3 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_180px_190px] sm:items-start sm:px-5">
        <div className="min-w-0">
          <p className="break-words font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
            {student.displayName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Archived student
          </p>
        </div>
        <div className="break-words text-sm text-muted-foreground [overflow-wrap:anywhere] sm:text-foreground">
          <p>@{student.mentionHandle}</p>
          {student.schoolLocalId ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Local ID: {student.schoolLocalId}
            </p>
          ) : null}
        </div>
        <div className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
          <p>
            {student.classGroupName
              ? `Was in ${student.classGroupName}`
              : "Needs active class"}
          </p>
          <ArchivedRosterStudentActions
            studentId={student.id}
            studentDisplayName={student.displayName}
            activeClasses={activeClasses}
            defaultClassGroupId={
              student.hasActiveClass ? student.classGroupId : null
            }
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
                          <p className="break-words font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
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
                        <Link href={classHref(classGroup.id)}>Add/manage students</Link>
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
            {activeClasses.length === 0
              ? "Create your first class"
              : "Create another class"}
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
              <p className="break-words font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
                {classGroup.name}
              </p>
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
  existingImportStudents,
  canContinueToFeed,
}: {
  classGroup: ClassGroupDisplay;
  students: ClassRosterStudentDisplay[];
  activeClasses: ActiveClassOption[];
  existingImportStudents: ExistingRosterImportStudent[];
  canContinueToFeed: boolean;
}) {
  const rosterRevision = JSON.stringify(
    students.map((student) => ({
      id: student.id,
      displayName: student.displayName,
      mentionHandle: student.mentionHandle,
      schoolLocalId: student.schoolLocalId,
      classGroupId: student.classGroupId,
    }))
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={routes.roster}>
            <ArrowLeft className="size-3.5" />
            Back to classes
          </Link>
        </Button>
        {!canContinueToFeed && students.length > 0 ? (
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Finish assigning every active student to an active class before opening
            the evidence feed.
          </p>
        ) : null}
      </div>

      <ClassRosterManager
        key={rosterRevision}
        classGroupId={classGroup.id}
        className={classGroup.name}
        initialStudents={students}
        activeClasses={activeClasses}
        existingImportStudents={existingImportStudents}
      />
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
    archivedStudents,
    classReadiness,
  ] = await Promise.all([
    listActiveClassGroupsForWorkspace(workspace.workspaceId),
    listArchivedClassGroupsForWorkspace(workspace.workspaceId),
    listActiveRosterStudentsForWorkspace(workspace.workspaceId),
    listArchivedRosterStudentsForWorkspace(workspace.workspaceId),
    getClassRosterReadinessForWorkspace(workspace.workspaceId),
  ]);
  const activeClassOptions = activeClasses.map((classGroup) => ({
    id: classGroup.id,
    name: classGroup.name,
  }));
  const selectedClass = selectedClassId
    ? activeClasses.find((classGroup) => classGroup.id === selectedClassId) ?? null
    : null;
  const [selectedClassStudents, existingImportStudents] = selectedClass
    ? await Promise.all([
        listActiveRosterStudentsForClass({
          workspaceId: workspace.workspaceId,
          classGroupId: selectedClass.id,
        }),
        listExistingRosterImportStudentsForWorkspace(workspace.workspaceId),
      ])
    : [null, []];
  const unassignedStudents = activeStudents.filter((student) => !student.hasActiveClass);
  const selectedClassMissing = Boolean(selectedClassId && !selectedClass);
  const readyForCapture = classReadiness.readyForClassFirstRoster;
  const readinessGuidance =
    classReadiness.activeStudentCount === 0
      ? "Create a class and add one student before capture."
      : classReadiness.activeStudentsWithoutActiveClassCount > 0
        ? `${classReadiness.activeStudentsWithoutActiveClassCount} ${
            classReadiness.activeStudentsWithoutActiveClassCount === 1
              ? "student needs"
              : "students need"
          } an active class before capture.`
        : "Create a class and add one student before capture.";

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
                : "Students by class"}
          </h1>
          <div className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
            <p>
              Add and manage students inside each class. Capture remains global and
              student-specific.
            </p>
            <p>Your roster is private to your ClassTrace workspace.</p>
          </div>
        </div>
        <div className="border border-border bg-card/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {readyForCapture ? "Capture readiness" : "Class setup"}
          </p>
          <p className="mt-1 text-sm text-foreground">
            {readyForCapture
              ? `${classReadiness.activeStudentCount} ${
                  classReadiness.activeStudentCount === 1 ? "student" : "students"
                } ready for capture.`
              : readinessGuidance}
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
          existingImportStudents={existingImportStudents}
          canContinueToFeed={readyForCapture}
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
              Choose a class to add or manage students.
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link href={archivedClassesHref()}>View archived classes</Link>
            </Button>
          </div>
          <ClassList activeClasses={activeClasses} activeStudents={activeStudents} />
          {archivedStudents.length > 0 ? (
            <section className="space-y-3">
              <div className="border border-border bg-card/60 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Archived students
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Restore a student when they return to your active roster. Their saved
                  evidence stays attached to the same student record.
                </p>
              </div>
              <ul className="border border-border bg-card/60">
                {archivedStudents.map((student) => (
                  <ArchivedStudentRow
                    key={student.id}
                    student={student}
                    activeClasses={activeClassOptions}
                  />
                ))}
              </ul>
            </section>
          ) : null}
          {unassignedStudents.length > 0 ? (
            <section className="space-y-3">
              <div className="border border-border bg-card/60 px-4 py-3">
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
                  <RosterStudentRow
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
