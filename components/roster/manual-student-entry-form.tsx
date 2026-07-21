"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { createRosterStudent } from "@/actions/roster";
import { ROSTER_INPUT_CLASS_NAME } from "@/components/roster/form-styles";
import { RosterFormMessage } from "@/components/roster/roster-form-message";
import { Button } from "@/components/ui/button";
import { deriveMentionHandle } from "@/lib/students/derive-mention-handle";
import type { RosterStudentDisplay } from "@/lib/students/roster-students";

type ManualStudentEntryFormProps = {
  isFirstStudent: boolean;
  classGroupId: string;
  className: string;
  onStudentCreated: (student: RosterStudentDisplay) => void;
  showTitle?: boolean;
};

function normalizeHandleInput(value: string): string {
  return value.trim().replace(/^@+/, "").trim().toLowerCase();
}

export function ManualStudentEntryForm({
  isFirstStudent,
  classGroupId,
  className,
  onStudentCreated,
  showTitle = true,
}: ManualStudentEntryFormProps) {
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
        classGroupId,
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
      onStudentCreated(result.student);
      router.refresh();
    });
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {showTitle ? (
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {isFirstStudent ? "Add your first student" : "Add a student"}
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Enter a name for {className}. ClassTrace creates the mention handle
            automatically.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1 basis-52 space-y-1.5">
          <label
            htmlFor="student-display-name"
            className="text-sm font-medium text-foreground"
          >
            Student name
          </label>
          <input
            id="student-display-name"
            name="displayName"
            type="text"
            value={displayName}
            onChange={(event) => handleDisplayNameChange(event.target.value)}
            className={ROSTER_INPUT_CLASS_NAME}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "student-entry-error" : undefined}
            autoComplete="off"
            disabled={isPending}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-10 rounded-lg px-5 text-sm font-semibold"
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Add student"}
        </Button>
      </div>

      <details className="group">
        <summary className="-mx-1 flex min-h-9 w-fit cursor-pointer list-none items-center gap-1 rounded-md px-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/20 [&::-webkit-details-marker]:hidden">
          <ChevronRight
            className="size-3.5 transition-transform group-open:rotate-90"
            aria-hidden="true"
          />
          Optional details · handle and local ID
        </summary>
        <div className="space-y-3 pb-1 pt-2">
          <div className="space-y-1.5">
            <label
              htmlFor="student-mention-handle"
              className="text-sm font-medium text-foreground"
            >
              Mention handle
            </label>
            <div className="flex h-10 rounded-md border border-border bg-background/50 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
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
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "student-entry-error" : undefined}
                autoComplete="off"
                disabled={isPending}
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Change the handle only when the automatic one is not a good fit.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="student-school-id"
              className="text-sm font-medium text-foreground"
            >
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
              className={ROSTER_INPUT_CLASS_NAME}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "student-entry-error" : undefined}
              autoComplete="off"
              disabled={isPending}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Leave blank if you do not use local IDs.
            </p>
          </div>
        </div>
      </details>

      {error ? (
        <RosterFormMessage id="student-entry-error" message={error} />
      ) : (
        <RosterFormMessage
          id="student-entry-status"
          message={successMessage}
          tone="status"
          className="min-h-0 text-sm"
        />
      )}
    </form>
  );
}
