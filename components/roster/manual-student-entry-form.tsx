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
          <h2 className="font-display text-2xl font-semibold text-fg">
            {isFirstStudent ? "Add your first student" : "Add a student"}
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-fg-2">
            Enter a name for {className}. ClassTrace creates the mention handle
            automatically.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1 basis-52 space-y-1.5">
          <label
            htmlFor="student-display-name"
            className="label block text-fg-2"
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
          className="h-10"
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Add student"}
        </Button>
      </div>

      <details className="group">
        <summary className="-mx-1 flex min-h-9 w-fit cursor-pointer list-none items-center gap-1 rounded-sm px-1 text-xs font-medium text-fg-2 outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base [&::-webkit-details-marker]:hidden">
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
              className="label block text-fg-2"
            >
              Mention handle
            </label>
            <div className="flex h-10 rounded-md border border-line-2 bg-well focus-within:border-fg focus-within:ring-3 focus-within:ring-live-bright/20">
              <span className="flex items-center border-r border-line px-3 text-sm text-fg-2">
                @
              </span>
              <input
                id="student-mention-handle"
                name="mentionHandle"
                type="text"
                value={mentionHandle}
                onChange={(event) => handleMentionHandleChange(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-fg outline-none placeholder:text-fg-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "student-entry-error" : undefined}
                autoComplete="off"
                disabled={isPending}
              />
            </div>
            <p className="text-xs leading-relaxed text-fg-2">
              Change the handle only when the automatic one is not a good fit.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="student-school-id"
              className="label block text-fg-2"
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
            <p className="text-xs leading-relaxed text-fg-2">
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
