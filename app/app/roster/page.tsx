import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Plus } from "lucide-react";
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

function SectionLabel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-1">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ArchivedStudentRow({
  student,
  activeClasses,
}: {
  student: ArchivedRosterStudentDisplay;
  activeClasses: ActiveClassOption[];
}) {
  const metaParts = [`@${student.mentionHandle}`];
  if (student.schoolLocalId) {
    metaParts.push(`ID ${student.schoolLocalId}`);
  }
  metaParts.push(
    student.classGroupName
      ? `Was in ${student.classGroupName}`
      : "Needs active class"
  );

  return (
    <li className="border-b border-border last:border-b-0">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-4 py-3.5 sm:px-5">
        <div className="min-w-0 flex-1 basis-56">
          <p className="break-words font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
            {student.displayName}
          </p>
          <p className="mt-0.5 break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
            {metaParts.join(" · ")}
          </p>
        </div>
        <ArchivedRosterStudentActions
          studentId={student.id}
          studentDisplayName={student.displayName}
          activeClasses={activeClasses}
          defaultClassGroupId={
            student.hasActiveClass ? student.classGroupId : null
          }
        />
      </div>
    </li>
  );
}

function ClassOverview({
  activeClasses,
  activeStudents,
  hasArchivedClasses,
}: {
  activeClasses: ClassGroupDisplay[];
  activeStudents: RosterStudentDisplay[];
  hasArchivedClasses: boolean;
}) {
  if (activeClasses.length === 0) {
    return (
      <section className="rounded-card border border-border bg-card p-5 shadow-paper sm:p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Create your first class
        </h2>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Classes organize roster setup only. Once a class has one student,
          capture opens up and stays global.
        </p>
        <div className="mt-4 max-w-sm">
          <ClassGroupForm />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <SectionLabel title="Classes" />
        <p className="text-xs tabular-nums text-muted-foreground">
          {activeClasses.length} {activeClasses.length === 1 ? "class" : "classes"}
        </p>
      </div>
      <ul className="overflow-hidden rounded-card border border-border bg-card shadow-paper">
        {activeClasses.map((classGroup) => {
          const studentCount = activeStudents.filter(
            (student) =>
              student.classGroupId === classGroup.id && student.hasActiveClass
          ).length;

          return (
            <li key={classGroup.id} className="border-b border-border">
              <Link
                href={classHref(classGroup.id)}
                className="group flex items-center justify-between gap-4 px-4 py-4 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 sm:px-5"
              >
                <span className="min-w-0">
                  <span className="block break-words font-display text-base font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">
                    {classGroup.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {studentCount} {studentCount === 1 ? "student" : "students"}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                  Open
                  <ChevronRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <details className="group">
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium text-primary outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 sm:px-5 [&::-webkit-details-marker]:hidden">
              <Plus className="size-4" aria-hidden="true" />
              New class
            </summary>
            <div className="border-t border-border/60 bg-muted/20 px-4 py-4 sm:px-5">
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                Classes organize roster setup only. Capture stays global once at
                least one student is ready.
              </p>
              <div className="mt-3 max-w-sm">
                <ClassGroupForm />
              </div>
            </div>
          </details>
        </li>
      </ul>
      {hasArchivedClasses ? (
        <div className="px-1">
          <Link
            href={archivedClassesHref()}
            className="inline-flex min-h-9 items-center gap-1 rounded-md text-sm text-muted-foreground underline-offset-2 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/20"
          >
            View archived classes
          </Link>
        </div>
      ) : null}
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
      <SectionLabel
        title="Archived classes"
        description="Archived classes are hidden from active roster setup. Students cannot be added here."
      />
      {archivedClasses.length === 0 ? (
        <p className="px-1 text-sm leading-relaxed text-muted-foreground">
          No archived classes yet.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-card border border-border bg-card/60">
          {archivedClasses.map((classGroup) => (
            <li
              key={classGroup.id}
              className="border-b border-border px-4 py-3.5 last:border-b-0 sm:px-5"
            >
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
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={routes.roster}>
            <ArrowLeft className="size-3.5" />
            Back to classes
          </Link>
        </Button>
        {!canContinueToFeed && students.length > 0 ? (
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Finish assigning every active student to an active class before
            opening the evidence feed.
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
  const unassignedStudents = activeStudents.filter(
    (student) => !student.hasActiveClass
  );
  const selectedClassMissing = Boolean(selectedClassId && !selectedClass);
  const isOverview = !selectedClass && !selectedClassMissing && view !== "archived";
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
    <div className="mx-auto w-full max-w-[880px] px-4 py-8 sm:px-6">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Roster
          </p>
          <h1 className="break-words font-display text-3xl font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">
            {selectedClass
              ? selectedClass.name
              : view === "archived"
                ? "Archived classes"
                : "Students by class"}
          </h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Add and manage students inside each class. Your roster is private
            to your ClassTrace workspace.
          </p>
        </div>
        {isOverview ? (
          <div className="pb-1">
            {readyForCapture ? (
              <Link
                href={routes.feed}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-medium text-primary underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                {classReadiness.activeStudentCount}{" "}
                {classReadiness.activeStudentCount === 1
                  ? "student"
                  : "students"}{" "}
                ready · Open evidence feed
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <p className="max-w-56 text-sm leading-relaxed text-muted-foreground">
                {readinessGuidance}
              </p>
            )}
          </div>
        ) : null}
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
        <div className="rounded-card border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">
            This class could not be opened.
          </p>
          <p className="mt-1">
            Return to your active classes and choose another class.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href={routes.roster}>Back to classes</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-9">
          <ClassOverview
            activeClasses={activeClasses}
            activeStudents={activeStudents}
            hasArchivedClasses={archivedClasses.length > 0}
          />
          {unassignedStudents.length > 0 ? (
            <section className="space-y-2.5">
              <SectionLabel
                title="Needs class"
                description="Assign these students to an active class before capture is ready."
              />
              <ul className="overflow-hidden rounded-card border border-border bg-card/60">
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
          {archivedStudents.length > 0 ? (
            <section className="space-y-2.5">
              <SectionLabel
                title="Archived students"
                description="Restore a student when they return. Their saved evidence stays attached to the same record."
              />
              <ul className="overflow-hidden rounded-card border border-border bg-card/60">
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
        </div>
      )}
    </div>
  );
}
