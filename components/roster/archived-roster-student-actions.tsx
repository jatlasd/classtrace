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
          <label className="block text-xs font-medium text-foreground">
            Restore to class
            <select
              value={classGroupId}
              onChange={(event) => setClassGroupId(event.target.value)}
              disabled={isPending}
              className="mt-1 h-9 w-full rounded-md border border-border bg-background/50 px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
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
        <p className="text-xs leading-relaxed text-muted-foreground">
          Create an active class before restoring this student.
        </p>
      )}

      {error ? (
        <p className="text-xs leading-relaxed text-destructive" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
