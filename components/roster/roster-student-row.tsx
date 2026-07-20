"use client";

import Link from "next/link";
import { RosterStudentEditForm } from "@/components/roster/roster-student-edit-form";
import { RosterStudentRowActions } from "@/components/roster/roster-student-row-actions";
import type { ClassRosterStudentDisplay } from "@/lib/classes/class-groups";
import { routes } from "@/lib/routes";
import type { RosterStudentDisplay } from "@/lib/students/roster-students";

export type ActiveClassOption = {
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

export function RosterStudentRow({
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
            <p className="break-words font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
              {student.displayName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Open timeline</p>
          </div>
        </Link>
        <p className="break-words text-sm text-muted-foreground [overflow-wrap:anywhere] sm:text-foreground">
          @{student.mentionHandle}
        </p>
        <div className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
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
