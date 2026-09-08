import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Plus } from "lucide-react";
import { ArchivedRosterStudentActions } from "@/components/roster/archived-roster-student-actions";
import { ArchivedClassGroupActions } from "@/components/roster/archived-class-group-actions";
import { ClassRosterManager } from "@/components/roster/class-roster-manager";
import { ClassGroupForm } from "@/components/roster/class-group-form";
import {
  RosterStudentRow,
  type ActiveClassOption,
} from "@/components/roster/roster-student-row";
import { Button } from "@/components/ui/button";
import { getCurrentAppWorkspace } from "@/lib/auth/get-current-workspace";
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
    <div>
      <h2 className="font-display text-2xl font-semibold text-fg">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-fg-2">
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
    <li className="border-b border-line last:border-b-0">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-4 py-3.5 sm:px-5">
        <div className="min-w-0 flex-1 basis-56">
          <p className="break-words font-display text-lg font-semibold leading-tight text-fg-2 [overflow-wrap:anywhere]">
            {student.displayName}
          </p>
          <p className="mt-0.5 break-words text-xs text-fg-3 [overflow-wrap:anywhere]">
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

function StudentsOverview({
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
      <section className="plate p-6 sm:p-8">
        <h2 className="font-display text-3xl font-semibold text-fg">
          Start with one class
        </h2>
        <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-fg-2">
          Name the class, add one student, and capture opens up. Classes only
          organize your roster; capture itself is one box for everyone.
        </p>
        <div className="mt-5 max-w-sm">
          <ClassGroupForm />
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-12">
      {activeClasses.map((classGroup) => {
        const students = activeStudents.filter(
          (student) =>
            student.classGroupId === classGroup.id && student.hasActiveClass
        );

        return (
          <section key={classGroup.id} aria-labelledby={`class-${classGroup.id}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line pb-3">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2
                  id={`class-${classGroup.id}`}
                  className="break-words font-display text-2xl font-semibold leading-tight text-fg [overflow-wrap:anywhere]"
                >
                  {classGroup.name}
                </h2>
                <span className="label text-fg-3">
                  {students.length} {students.length === 1 ? "student" : "students"}
                </span>
              </div>
              <Link
                href={classHref(classGroup.id)}
                className="inline-flex min-h-9 items-center gap-1 rounded-full text-sm font-semibold text-fg-2 underline decoration-line-2 underline-offset-4 outline-none transition-colors hover:text-fg hover:decoration-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
              >
                Manage class
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {students.length === 0 ? (
              <p className="mt-4 text-[15px] text-fg-2">
                No students yet.{" "}
                <Link
                  href={classHref(classGroup.id)}
                  className="font-semibold text-fg underline decoration-line-2 underline-offset-4 hover:decoration-fg"
                >
                  Add the first one
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                  <li key={student.id}>
                    <Link
                      href={routes.student(student.id)}
                      className="group flex min-h-16 items-center justify-between gap-3 rounded-xl border border-line bg-plate px-4 py-3 outline-none transition-colors hover:border-line-2 hover:bg-well focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
                    >
                      <span className="min-w-0">
                        <span className="block break-words font-display text-[1.2rem] font-semibold leading-tight text-fg [overflow-wrap:anywhere]">
                          {student.displayName}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-fg-3">
                          @{student.mentionHandle}
                        </span>
                      </span>
                      <ArrowRight
                        className="size-4 shrink-0 text-fg-3 transition-colors group-hover:text-fg"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <section className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
        <details className="group min-w-0 flex-1 basis-72">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full text-sm font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base [&::-webkit-details-marker]:hidden">
            <span className="flex size-7 items-center justify-center rounded-full bg-well text-fg group-open:bg-fg group-open:text-base">
              <Plus className="size-4" aria-hidden="true" />
            </span>
            New class
          </summary>
          <div className="mt-3 max-w-sm">
            <ClassGroupForm />
          </div>
        </details>
        {hasArchivedClasses ? (
          <Link
            href={archivedClassesHref()}
            className="inline-flex min-h-9 items-center rounded-full text-sm text-fg-2 underline decoration-line-2 underline-offset-4 outline-none transition-colors hover:text-fg hover:decoration-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
          >
            Archived classes
          </Link>
        ) : null}
      </section>
    </div>
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
          Back to students
        </Link>
      </Button>
      <SectionLabel
        title="Archived classes"
        description="Archived classes are hidden from active roster setup. Students cannot be added here."
      />
      {archivedClasses.length === 0 ? (
        <p className="px-1 text-sm leading-relaxed text-fg-2">
          No archived classes yet.
        </p>
      ) : (
        <ul className="plate overflow-hidden">
          {archivedClasses.map((classGroup) => (
            <li
              key={classGroup.id}
              className="border-b border-line px-4 py-3.5 last:border-b-0 sm:px-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="break-words font-display text-lg font-semibold leading-tight text-fg-2 [overflow-wrap:anywhere]">
                    {classGroup.name}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-3">
                    Archived class
                  </p>
                </div>
                <ArchivedClassGroupActions
                  classGroupId={classGroup.id}
                  className={classGroup.name}
                />
              </div>
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
            Back to students
          </Link>
        </Button>
        {!canContinueToFeed && students.length > 0 ? (
          <p className="max-w-sm text-sm leading-relaxed text-fg-2">
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
  const workspace = await getCurrentAppWorkspace();
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
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <p className="label text-fg-3">
            {selectedClass ? "Class" : view === "archived" ? "Students" : "Later · one trace per student"}
          </p>
          <h1 className="mt-2 break-words font-display text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[0.95] text-fg [overflow-wrap:anywhere]">
            {selectedClass
              ? selectedClass.name
              : view === "archived"
                ? "Archived classes"
                : "Students"}
          </h1>
          {isOverview ? (
            <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-fg-2">
              Open a student to read everything you have saved about them, in
              order. Your roster is private to your workspace.
            </p>
          ) : selectedClass ? (
            <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-fg-2">
              Add, edit, move, or archive the students in this class.
            </p>
          ) : null}
        </div>
        {isOverview ? (
          <div>
            {readyForCapture ? (
              <Link
                href={routes.feed}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-live-bright px-4 text-sm font-semibold text-live-fg outline-none transition-colors hover:bg-[#ffc24d] focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
              >
                Capture something now
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <p className="max-w-56 rounded-lg border border-live-bright/60 bg-live-soft px-3 py-2 text-sm leading-relaxed text-fg">
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
        <div className="plate p-6 text-sm leading-relaxed text-fg-2">
          <p className="font-display text-2xl font-semibold text-fg">
            This class could not be opened.
          </p>
          <p className="mt-1">
            Return to your active classes and choose another class.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href={routes.roster}>Back to students</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          <StudentsOverview
            activeClasses={activeClasses}
            activeStudents={activeStudents}
            hasArchivedClasses={archivedClasses.length > 0}
          />
          {unassignedStudents.length > 0 ? (
            <section className="space-y-3 rounded-lg border-l-2 border-live-bright pl-4">
              <SectionLabel
                title="Needs class"
                description="Assign these students to an active class before capture is ready."
              />
              <ul className="plate overflow-hidden">
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
            <section className="space-y-3">
              <SectionLabel
                title="Archived students"
                description="Restore a student when they return. Their saved evidence stays attached to the same record."
              />
              <ul className="plate overflow-hidden">
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
