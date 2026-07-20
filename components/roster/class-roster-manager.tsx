"use client";

import { Users } from "lucide-react";
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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div className="border border-border bg-card/60 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
              <Users className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Class roster
              </p>
              <h2 className="font-display text-lg font-semibold text-foreground">
                {className}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Add and manage students here. Capture stays global and student-specific.
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
            <ul className="border border-border bg-card/60" aria-label={`${className} students`}>
              {students.map((student) => (
                <RosterStudentRow
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
            isFirstStudent={students.length === 0}
            classGroupId={classGroupId}
            className={className}
            onStudentCreated={handleStudentCreated}
          />
        </div>
        <ClassGroupActions classGroupId={classGroupId} className={className} />
        <div className="border border-border bg-card/55 p-4 sm:p-5">
          <RosterImportForm
            existingStudents={existingImportStudents}
            classGroupId={classGroupId}
            className={className}
          />
        </div>
      </div>
    </div>
  );
}
