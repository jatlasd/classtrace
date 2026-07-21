"use client";

import { useRouter } from "next/navigation";
import { Archive, Pencil } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { archiveClassGroup, renameClassGroup } from "@/actions/classes";
import { ROSTER_INPUT_CLASS_NAME } from "@/components/roster/form-styles";
import { RosterFormMessage } from "@/components/roster/roster-form-message";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

type ClassGroupActionsProps = {
  classGroupId: string;
  className: string;
};

export function ClassGroupActions({
  classGroupId,
  className,
}: ClassGroupActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [name, setName] = useState(className);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleRename(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await renameClassGroup({ classGroupId, name });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  }

  function handleArchive(): void {
    setError("");

    startTransition(async () => {
      const result = await archiveClassGroup({ classGroupId });

      if (!result.success) {
        setError(result.error);
        setIsConfirmingArchive(false);
        return;
      }

      router.push(routes.roster);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => {
            setIsEditing((current) => !current);
            setIsConfirmingArchive(false);
            setError("");
          }}
        >
          <Pencil className="size-3.5" />
          Rename class
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => {
            setIsConfirmingArchive((current) => !current);
            setIsEditing(false);
            setError("");
          }}
        >
          <Archive className="size-3.5" />
          Archive class
        </Button>
      </div>

      {isEditing ? (
        <form className="space-y-2 border-t border-border/50 pt-3" onSubmit={handleRename}>
          <label htmlFor="rename-class" className="text-sm font-medium text-foreground">
            Class name
          </label>
          <input
            id="rename-class"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            className={ROSTER_INPUT_CLASS_NAME}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `class-action-error-${classGroupId}` : undefined}
            disabled={isPending}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" variant="outline" disabled={isPending}>
              {isPending ? "Saving…" : "Save name"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setName(className);
                setIsEditing(false);
                setError("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {isConfirmingArchive ? (
        <div className="space-y-2 border-t border-border/50 pt-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Archive this class? Empty classes can be archived. Classes with active students
            need those students moved first.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleArchive}
              disabled={isPending}
              autoFocus
            >
              {isPending ? "Archiving…" : "Archive class"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsConfirmingArchive(false);
                setError("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <RosterFormMessage
        id={`class-action-error-${classGroupId}`}
        message={error}
        className="min-h-4 text-xs leading-relaxed"
      />
    </div>
  );
}
