"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { createRosterStudent } from "@/actions/roster";
import { Button } from "@/components/ui/button";
import { deriveMentionHandle } from "@/lib/students/derive-mention-handle";

const inputClassName =
  "h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

type ManualStudentEntryFormProps = {
  isFirstStudent: boolean;
};

function normalizeHandleInput(value: string): string {
  return value.trim().replace(/^@+/, "").trim().toLowerCase();
}

export function ManualStudentEntryForm({ isFirstStudent }: ManualStudentEntryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("");
  const [mentionHandle, setMentionHandle] = useState("");
  const [schoolLocalId, setSchoolLocalId] = useState("");
  const [handleWasEdited, setHandleWasEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleDisplayNameChange(value: string): void {
    setDisplayName(value);
    setError(null);
    setSuccessMessage(null);

    if (!handleWasEdited) {
      setMentionHandle(deriveMentionHandle(value));
    }
  }

  function handleMentionHandleChange(value: string): void {
    setMentionHandle(normalizeHandleInput(value));
    setHandleWasEdited(true);
    setError(null);
    setSuccessMessage(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }

    if (!mentionHandle.trim()) {
      setError("Handle is required.");
      return;
    }

    startTransition(async () => {
      const result = await createRosterStudent({
        displayName,
        mentionHandle,
        schoolLocalId: schoolLocalId.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setDisplayName("");
      setMentionHandle("");
      setSchoolLocalId("");
      setHandleWasEdited(false);
      setSuccessMessage("Student saved to your roster.");
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {isFirstStudent ? "Add your first student" : "Add another student"}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Use a name and handle your capture notes will recognize.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="student-display-name" className="text-sm font-medium text-foreground">
            Student name
          </label>
          <input
            id="student-display-name"
            name="displayName"
            type="text"
            value={displayName}
            onChange={(event) => handleDisplayNameChange(event.target.value)}
            className={inputClassName}
            autoComplete="off"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="student-mention-handle" className="text-sm font-medium text-foreground">
            Mention handle
          </label>
          <div className="flex h-10 rounded-md border border-border bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
            <span className="flex items-center border-r border-border px-3 text-sm text-muted-foreground">
              @
            </span>
            <input
              id="student-mention-handle"
              name="mentionHandle"
              type="text"
              value={mentionHandle}
              onChange={(event) => handleMentionHandleChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              autoComplete="off"
              disabled={isPending}
            />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Handles can be typed with or without @.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="student-school-id" className="text-sm font-medium text-foreground">
            School/local ID
          </label>
          <input
            id="student-school-id"
            name="schoolLocalId"
            type="text"
            value={schoolLocalId}
            onChange={(event) => {
              setSchoolLocalId(event.target.value);
              setError(null);
              setSuccessMessage(null);
            }}
            className={inputClassName}
            autoComplete="off"
            disabled={isPending}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Optional. Class/group setup stays deferred to a later roster unit.
          </p>
        </div>
      </div>

      <div aria-live="polite" className="min-h-5 text-sm">
        {error ? <p className="text-destructive">{error}</p> : null}
        {successMessage ? <p className="text-muted-foreground">{successMessage}</p> : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-9 rounded-lg px-5 text-sm font-semibold"
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Add student"}
      </Button>
    </form>
  );
}
