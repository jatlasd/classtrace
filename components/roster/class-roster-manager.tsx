"use client";

import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { ClassGroupActions } from "@/components/roster/class-group-actions";
import { ManualStudentEntryForm } from "@/components/roster/manual-student-entry-form";
import {
  RosterStudentRow,
  type ActiveClassOption,
} from "@/components/roster/roster-student-row";
import { RosterImportForm } from "@/components/roster/roster-import-form";
import type { ClassRosterStudentDisplay } from "@/lib/classes/class-groups";
import type { ExistingRosterImportStudent } from "@/lib/import/parse-roster-import";
import type { RosterStudentDisplay } from "@/lib/students/roster-students";

type ClassRosterManagerProps = {
  classGroupId: string;
  className: string;
  initialStudents: ClassRosterStudentDisplay[];
  activeClasses: ActiveClassOption[];
  existingImportStudents: ExistingRosterImportStudent[];
};

const UTILITY_SUMMARY_CLASS_NAME =
  "flex min-h-12 cursor-pointer list-none items-center gap-2 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/20 [&::-webkit-details-marker]:hidden";

export function ClassRosterManager({
  classGroupId,
  className,
  initialStudents,
  activeClasses,
  existingImportStudents,
}: ClassRosterManagerProps) {
  const [students, setStudents] = useState(initialStudents);

  function handleStudentCreated(student: RosterStudentDisplay): void {
    const createdStudent: ClassRosterStudentDisplay = {
      id: student.id,
      displayName: student.displayName,
      mentionHandle: student.mentionHandle,
      schoolLocalId: student.schoolLocalId,
      classGroupId,
      createdAt: student.createdAt,
    };

    setStudents((currentStudents) =>
      currentStudents.some((currentStudent) => currentStudent.id === student.id)
        ? currentStudents
        : [...currentStudents, createdStudent]
    );
  }

  return (
    <div className="space-y-7">
      <section className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-3 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Students
          </h2>
          <p className="text-xs tabular-nums text-muted-foreground">
            {students.length} {students.length === 1 ? "student" : "students"}
          </p>
        </div>

        {students.length === 0 ? (
          <div className="rounded-card border border-border bg-card p-5 shadow-paper sm:p-6">
            <p className="font-medium text-foreground">
              No students in this class yet.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Add one student to make the evidence feed available for capture.
            </p>
            <div className="mt-4 max-w-xl">
              <ManualStudentEntryForm
                isFirstStudent
                classGroupId={classGroupId}
                className={className}
                onStudentCreated={handleStudentCreated}
                showTitle={false}
              />
            </div>
          </div>
        ) : (
          <ul
            className="overflow-hidden rounded-card border border-border bg-card/60"
            aria-label={`${className} students`}
          >
            {students.map((student) => (
              <RosterStudentRow
                key={student.id}
                student={student}
                activeClasses={activeClasses}
                showClassName={false}
              />
            ))}
            <li>
              <details className="group/add">
                <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium text-primary outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/20 sm:px-5 [&::-webkit-details-marker]:hidden">
                  <Plus className="size-4" aria-hidden="true" />
                  Add student
                </summary>
                <div className="max-w-xl border-t border-border/60 bg-muted/20 px-4 py-4 sm:px-5">
                  <ManualStudentEntryForm
                    isFirstStudent={false}
                    classGroupId={classGroupId}
                    className={className}
                    onStudentCreated={handleStudentCreated}
                    showTitle={false}
                  />
                </div>
              </details>
            </li>
          </ul>
        )}
      </section>

      <section className="divide-y divide-border/70 border-y border-border/70">
        <details className="group/import">
          <summary className={UTILITY_SUMMARY_CLASS_NAME}>
            <ChevronRight
              className="size-4 text-muted-foreground transition-transform group-open/import:rotate-90"
              aria-hidden="true"
            />
            Paste several students
          </summary>
          <div className="max-w-xl pb-6 pl-6 pt-1">
            <RosterImportForm
              existingStudents={existingImportStudents}
              classGroupId={classGroupId}
              className={className}
            />
          </div>
        </details>
        <details className="group/settings">
          <summary className={UTILITY_SUMMARY_CLASS_NAME}>
            <ChevronRight
              className="size-4 text-muted-foreground transition-transform group-open/settings:rotate-90"
              aria-hidden="true"
            />
            Class settings
          </summary>
          <div className="max-w-xl pb-6 pl-6 pt-1">
            <ClassGroupActions
              classGroupId={classGroupId}
              className={className}
            />
          </div>
        </details>
      </section>
    </div>
  );
}
