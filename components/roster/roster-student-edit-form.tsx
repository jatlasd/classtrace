"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { updateRosterStudent } from "@/actions/roster";
import { ROSTER_INPUT_CLASS_NAME } from "@/components/roster/form-styles";
import { RosterFormMessage } from "@/components/roster/roster-form-message";
import { Button } from "@/components/ui/button";
import { deriveMentionHandle } from "@/lib/students/derive-mention-handle";

type ActiveClassOption = {
  id: string;
  name: string;
};

type RosterStudentEditFormProps = {
  student: {
    id: string;
    displayName: string;
    mentionHandle: string;
    schoolLocalId: string | null;
    classGroupId: string | null;
  };
  activeClasses: ActiveClassOption[];
  onClose?: () => void;
};

function normalizeHandleInput(value: string): string {
  return value.trim().replace(/^@+/, "").trim().toLowerCase();
}

export function RosterStudentEditForm({
  student,
  activeClasses,
  onClose,
}: RosterStudentEditFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(student.displayName);
  const [mentionHandle, setMentionHandle] = useState(student.mentionHandle);
  const [schoolLocalId, setSchoolLocalId] = useState(student.schoolLocalId ?? "");
  const [classGroupId, setClassGroupId] = useState(student.classGroupId ?? "");
  const [handleWasEdited, setHandleWasEdited] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDisplayNameChange(value: string): void {
    setDisplayName(value);
    setError("");

    if (!handleWasEdited) {
      setMentionHandle(deriveMentionHandle(value));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await updateRosterStudent({
        studentId: student.id,
        displayName,
        mentionHandle,
        classGroupId,
        schoolLocalId: schoolLocalId.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onClose?.();
      router.refresh();
    });
  }

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit}
      aria-label={`Edit student ${student.displayName}`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={`student-name-${student.id}`} className="text-sm font-medium text-foreground">
            Student name
          </label>
          <input
            id={`student-name-${student.id}`}
            value={displayName}
            onChange={(event) => handleDisplayNameChange(event.target.value)}
            className={ROSTER_INPUT_CLASS_NAME}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `student-edit-error-${student.id}` : undefined}
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`student-handle-${student.id}`} className="text-sm font-medium text-foreground">
            Mention handle
          </label>
          <div className="flex h-10 rounded-md border border-border bg-background/50 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
            <span className="flex items-center border-r border-border px-3 text-sm text-muted-foreground">
              @
            </span>
            <input
              id={`student-handle-${student.id}`}
              value={mentionHandle}
              onChange={(event) => {
                setMentionHandle(normalizeHandleInput(event.target.value));
                setHandleWasEdited(true);
                setError("");
              }}
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `student-edit-error-${student.id}` : undefined}
              disabled={isPending}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`student-class-${student.id}`} className="text-sm font-medium text-foreground">
            Class
          </label>
          <select
            id={`student-class-${student.id}`}
            value={classGroupId}
            onChange={(event) => {
              setClassGroupId(event.target.value);
              setError("");
            }}
            className={ROSTER_INPUT_CLASS_NAME}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `student-edit-error-${student.id}` : undefined}
            disabled={isPending}
          >
            <option value="">Choose class</option>
            {activeClasses.map((classGroup) => (
              <option key={classGroup.id} value={classGroup.id}>
                {classGroup.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`student-local-id-${student.id}`} className="text-sm font-medium text-foreground">
            School/local ID
          </label>
          <input
            id={`student-local-id-${student.id}`}
            value={schoolLocalId}
            onChange={(event) => {
              setSchoolLocalId(event.target.value);
              setError("");
            }}
            className={ROSTER_INPUT_CLASS_NAME}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `student-edit-error-${student.id}` : undefined}
            disabled={isPending}
          />
        </div>
      </div>

      <RosterFormMessage
        id={`student-edit-error-${student.id}`}
        message={error}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save student"}
        </Button>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Close
          </Button>
        ) : null}
      </div>
    </form>
  );
}
