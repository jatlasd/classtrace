"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { restoreRosterStudent } from "@/actions/roster";
import { Button } from "@/components/ui/button";

type ActiveClassOption = {
  id: string;
  name: string;
};

type ArchivedRosterStudentActionsProps = {
  studentId: string;
  studentDisplayName: string;
  activeClasses: ActiveClassOption[];
  defaultClassGroupId: string | null;
};

export function ArchivedRosterStudentActions({
  studentId,
  studentDisplayName,
  activeClasses,
  defaultClassGroupId,
}: ArchivedRosterStudentActionsProps) {
  const router = useRouter();
  const initialClassGroupId =
    defaultClassGroupId &&
    activeClasses.some((classGroup) => classGroup.id === defaultClassGroupId)
      ? defaultClassGroupId
      : activeClasses[0]?.id ?? "";
  const [classGroupId, setClassGroupId] = useState(initialClassGroupId);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const hasActiveClasses = activeClasses.length > 0;

  function handleRestore(): void {
    setError("");
    startTransition(async () => {
      const result = await restoreRosterStudent({ studentId, classGroupId });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="w-full space-y-2 sm:w-64">
      {hasActiveClasses ? (
        <>
          <label className="label block text-fg-2">
            Restore to class
            <select
              value={classGroupId}
              onChange={(event) => setClassGroupId(event.target.value)}
              disabled={isPending}
              className="mt-1 h-9 w-full rounded-md border border-line-2 bg-well px-2 text-sm text-fg outline-none focus-visible:border-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
            >
              {activeClasses.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.id}>
                  {classGroup.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRestore}
            disabled={isPending || !classGroupId}
            aria-label={`Restore student ${studentDisplayName}`}
          >
            <RotateCcw className="size-3.5" />
            {isPending ? "Restoring…" : "Restore student"}
          </Button>
        </>
      ) : (
        <p className="text-xs leading-relaxed text-fg-2">
          Create an active class before restoring this student.
        </p>
      )}

      {error ? (
        <p className="text-xs leading-relaxed text-danger" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
