"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, Trash2 } from "lucide-react";
import {
  archiveRosterStudent,
  deleteRosterStudent,
} from "@/actions/roster";
import { Button } from "@/components/ui/button";

type RosterStudentRowActionsProps = {
  studentId: string;
  studentDisplayName: string;
};

export function RosterStudentRowActions({
  studentId,
  studentDisplayName,
}: RosterStudentRowActionsProps) {
  const router = useRouter();
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [archiveError, setArchiveError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleArchive(): void {
    setArchiveError("");
    startTransition(async () => {
      const result = await archiveRosterStudent({ studentId });

      if (!result.success) {
        setArchiveError(result.error);
        setIsConfirmingArchive(false);
        return;
      }

      router.refresh();
    });
  }

  function handleDelete(): void {
    setDeleteError("");
    startTransition(async () => {
      const result = await deleteRosterStudent({ studentId });

      if (!result.success) {
        setDeleteError(result.error);
        setIsConfirmingDelete(false);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2 border-t border-border/50 pt-3 sm:col-span-3">
      {isConfirmingArchive ? (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Hide this student from active roster and capture views?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={isPending}
              aria-label={`Confirm archive student ${studentDisplayName}`}
            >
              {isPending ? "Archiving..." : "Archive student"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsConfirmingArchive(false);
                setArchiveError("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => {
            setIsConfirmingArchive(true);
            setIsConfirmingDelete(false);
            setArchiveError("");
            setDeleteError("");
          }}
          aria-label={`Archive student ${studentDisplayName}`}
        >
          <Archive className="size-3.5" />
          Archive student
        </Button>
      )}

      {archiveError ? (
        <p className="text-xs leading-relaxed text-destructive" role="status">
          {archiveError}
        </p>
      ) : null}

      {isConfirmingDelete ? (
        <div className="space-y-2 border-t border-border/50 pt-3">
          <p className="text-xs font-medium leading-relaxed text-destructive">
            Deleting this student will also permanently delete all evidence
            records attached to them. This cannot be undone.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              aria-label={`Permanently delete student ${studentDisplayName}`}
            >
              {isPending ? "Deleting..." : "Delete student"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsConfirmingDelete(false);
                setDeleteError("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 text-destructive hover:text-destructive"
          onClick={() => {
            setIsConfirmingDelete(true);
            setIsConfirmingArchive(false);
            setArchiveError("");
            setDeleteError("");
          }}
          aria-label={`Delete student ${studentDisplayName}`}
        >
          <Trash2 className="size-3.5" />
          Delete student
        </Button>
      )}

      {deleteError ? (
        <p className="text-xs leading-relaxed text-destructive" role="status">
          {deleteError}
        </p>
      ) : null}
    </div>
  );
}
