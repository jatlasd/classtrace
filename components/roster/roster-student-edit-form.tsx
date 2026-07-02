"use client";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { updateRosterStudent } from "@/actions/roster";
import { Button } from "@/components/ui/button";
import { deriveMentionHandle } from "@/lib/students/derive-mention-handle";

const inputClassName =
  "h-10 w-full rounded-md border border-border bg-background/50 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

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
};

function normalizeHandleInput(value: string): string {
  return value.trim().replace(/^@+/, "").trim().toLowerCase();
}

export function RosterStudentEditForm({
  student,
  activeClasses,
}: RosterStudentEditFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(student.displayName);
  const [mentionHandle, setMentionHandle] = useState(student.mentionHandle);
  const [schoolLocalId, setSchoolLocalId] = useState(student.schoolLocalId ?? "");
  const [classGroupId, setClassGroupId] = useState(student.classGroupId ?? "");
  const [handleWasEdited, setHandleWasEdited] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetForm(): void {
    setDisplayName(student.displayName);
    setMentionHandle(student.mentionHandle);
    setSchoolLocalId(student.schoolLocalId ?? "");
    setClassGroupId(student.classGroupId ?? "");
    setHandleWasEdited(false);
    setError("");
  }

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

      setIsEditing(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {!isEditing ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => setIsEditing(true)}
          aria-label={`Edit student ${student.displayName}`}
        >
          <Pencil className="size-3.5" />
          Edit student
        </Button>
      ) : (
        <form className="space-y-3 border-t border-border/50 pt-3" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`student-name-${student.id}`} className="text-sm font-medium text-foreground">
                Student name
              </label>
              <input
                id={`student-name-${student.id}`}
                value={displayName}
                onChange={(event) => handleDisplayNameChange(event.target.value)}
                className={inputClassName}
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
                className={inputClassName}
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
                className={inputClassName}
                disabled={isPending}
              />
            </div>
          </div>

          <div aria-live="polite" className="min-h-5 text-sm">
            {error ? <p className="text-destructive">{error}</p> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="outline" size="sm" disabled={isPending}>
              {isPending ? "Saving..." : "Save student"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                resetForm();
                setIsEditing(false);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
