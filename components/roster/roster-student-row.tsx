"use client";

import Link from "next/link";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { RosterStudentEditForm } from "@/components/roster/roster-student-edit-form";
import { RosterStudentRowActions } from "@/components/roster/roster-student-row-actions";
import { Button } from "@/components/ui/button";
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
  const [isManaging, setIsManaging] = useState(false);
  const classGroupId = "classGroupId" in student ? student.classGroupId : null;
  const classGroupName =
    "classGroupName" in student ? student.classGroupName : null;
  const schoolLocalId = student.schoolLocalId;
  const managementId = `roster-student-manage-${student.id}`;

  const metaParts = [`@${student.mentionHandle}`];
  if (showClassName) {
    metaParts.push(classGroupName || "Needs class");
  }
  if (schoolLocalId) {
    metaParts.push(`ID ${schoolLocalId}`);
  }

  return (
    <li className="border-b border-border last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-5">
        <Link
          href={routes.student(student.id)}
          aria-label={`Open ${student.displayName} timeline`}
          className="-m-1.5 flex min-w-0 flex-1 basis-56 items-center gap-3 rounded-md p-1.5 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/20"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-[11px] font-bold text-foreground">
            {studentInitials(student.displayName)}
          </span>
          <span className="min-w-0">
            <span className="block break-words font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
              {student.displayName}
            </span>
            <span className="mt-0.5 block break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
              {metaParts.join(" · ")}
            </span>
          </span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setIsManaging((current) => !current)}
          aria-expanded={isManaging}
          aria-controls={managementId}
          aria-label={`Manage student ${student.displayName}`}
        >
          <Ellipsis className="size-3.5" />
          Manage
        </Button>
      </div>
      {isManaging ? (
        <div
          id={managementId}
          className="space-y-4 border-t border-border/60 bg-muted/20 px-4 py-4 sm:px-5"
        >
          <RosterStudentEditForm
            student={{
              id: student.id,
              displayName: student.displayName,
              mentionHandle: student.mentionHandle,
              schoolLocalId,
              classGroupId,
            }}
            activeClasses={activeClasses}
            onClose={() => setIsManaging(false)}
          />
          <RosterStudentRowActions
            studentId={student.id}
            studentDisplayName={student.displayName}
          />
        </div>
      ) : null}
    </li>
  );
}
