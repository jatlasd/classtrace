"use client";

import { useId, useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { ROSTER_INPUT_CLASS_NAME } from "@/components/roster/form-styles";
import { Button } from "@/components/ui/button";
import type { CaptureRosterStudent } from "@/lib/students/resolve-capture-students";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

export type StudentResolutionClassOption = {
  id: string;
  name: string;
};

export type CreateStudentFromReviewInput = {
  displayName: string;
  mentionHandle: string;
  classGroupId: string;
};

export type CreateStudentFromReviewResult =
  | { success: true; student: CaptureRosterStudent }
  | { success: false; error: string };

type StudentResolutionFieldProps = {
  mention: string;
  rosterStudents: CaptureRosterStudent[];
  classGroups: StudentResolutionClassOption[];
  disabled: boolean;
  errorId?: string;
  onResolve: (student: CaptureRosterStudent) => void;
  onCreateStudent: (
    input: CreateStudentFromReviewInput
  ) => Promise<CreateStudentFromReviewResult>;
  onPendingChange: (isPending: boolean) => void;
  onError: (message: string) => void;
};

const MAX_ROSTER_RESULTS = 5;

function normalizedHandle(mention: string): string {
  return mention.replace(/^@+/, "").trim().toLowerCase();
}

function normalizedSearchValue(value: string): string {
  return value.replace(/^@+/, "").trim().toLowerCase();
}

function suggestedDisplayName(mention: string): string {
  const words = normalizedHandle(mention)
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StudentResolutionField({
  mention,
  rosterStudents,
  classGroups,
  disabled,
  errorId,
  onResolve,
  onCreateStudent,
  onPendingChange,
  onError,
}: StudentResolutionFieldProps) {
  const idPrefix = useId();
  const rosterSearchId = `${idPrefix}-roster-search`;
  const rosterResultsId = `${idPrefix}-roster-results`;
  const displayNameId = `${idPrefix}-display-name`;
  const classGroupId = `${idPrefix}-class-group`;
  const handle = normalizedHandle(mention);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [displayName, setDisplayName] = useState(() =>
    suggestedDisplayName(mention)
  );
  const [selectedClassGroupId, setSelectedClassGroupId] = useState(() =>
    classGroups.length === 1 ? classGroups[0].id : ""
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const visibleRosterStudents = useMemo(() => {
    const query = normalizedSearchValue(searchQuery);
    const matches = query
      ? rosterStudents.filter(
          (student) =>
            student.displayName.toLowerCase().includes(query) ||
            student.mentionHandle.toLowerCase().includes(query)
        )
      : rosterStudents;

    return matches.slice(0, MAX_ROSTER_RESULTS);
  }, [rosterStudents, searchQuery]);
  const canCreate =
    displayName.trim().length > 0 && selectedClassGroupId.length > 0;
  const activeResult = visibleRosterStudents[activeResultIndex];

  function handleRosterStudentChoice(student: CaptureRosterStudent): void {
    setSearchQuery("");
    setIsSearchOpen(false);
    setActiveResultIndex(-1);
    onError("");
    onResolve(student);
  }

  function handleRosterSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ): void {
    if (event.key === "Escape") {
      setIsSearchOpen(false);
      setActiveResultIndex(-1);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsSearchOpen(true);
      if (visibleRosterStudents.length === 0) {
        return;
      }

      setActiveResultIndex((current) => {
        if (event.key === "ArrowDown") {
          return current < visibleRosterStudents.length - 1 ? current + 1 : 0;
        }
        return current > 0 ? current - 1 : visibleRosterStudents.length - 1;
      });
      return;
    }

    if (event.key === "Enter") {
      const student =
        activeResult ??
        (visibleRosterStudents.length === 1
          ? visibleRosterStudents[0]
          : undefined);
      if (student) {
        event.preventDefault();
        handleRosterStudentChoice(student);
      }
    }
  }

  async function handleCreateStudent(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (disabled || isCreating || !canCreate) {
      return;
    }

    setIsCreating(true);
    onPendingChange(true);
    onError("");

    let result: CreateStudentFromReviewResult;
    try {
      result = await onCreateStudent({
        displayName: displayName.trim(),
        mentionHandle: handle,
        classGroupId: selectedClassGroupId,
      });
    } catch {
      result = { success: false, error: "Failed to save student." };
    } finally {
      setIsCreating(false);
      onPendingChange(false);
    }

    if (result.success) {
      onResolve(result.student);
      return;
    }

    onError(result.error);
  }

  return (
    <div className="max-w-2xl">
      {isCreatingNew ? (
        <form onSubmit={handleCreateStudent} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">
              Add @{handle} to your roster
            </p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled || isCreating}
              onClick={() => {
                setIsCreatingNew(false);
                onError("");
              }}
            >
              Cancel
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor={displayNameId}
                className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Student name
              </label>
              <input
                id={displayNameId}
                type="text"
                value={displayName}
                maxLength={INPUT_LIMITS.displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                disabled={disabled || isCreating}
                className={ROSTER_INPUT_CLASS_NAME}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor={classGroupId}
                className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Class
              </label>
              <select
                id={classGroupId}
                value={selectedClassGroupId}
                onChange={(event) =>
                  setSelectedClassGroupId(event.target.value)
                }
                disabled={disabled || isCreating}
                className={ROSTER_INPUT_CLASS_NAME}
              >
                <option value="">Choose a class</option>
                {classGroups.map((classGroup) => (
                  <option key={classGroup.id} value={classGroup.id}>
                    {classGroup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={disabled || isCreating || !canCreate}
            >
              {isCreating ? "Adding student…" : "Add student"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <div>
            <label
              htmlFor={rosterSearchId}
              className="mb-1 block text-xs font-medium text-foreground"
            >
              Match roster student
            </label>
            <input
              id={rosterSearchId}
              type="search"
              role="combobox"
              autoComplete="off"
              value={searchQuery}
              placeholder="Search by name or @handle"
              disabled={disabled}
              aria-autocomplete="list"
              aria-expanded={isSearchOpen}
              aria-controls={rosterResultsId}
              aria-activedescendant={
                activeResult
                  ? `${idPrefix}-roster-result-${activeResult.id}`
                  : undefined
              }
              aria-describedby={errorId}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                setIsSearchOpen(false);
                setActiveResultIndex(-1);
              }}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsSearchOpen(true);
                setActiveResultIndex(-1);
              }}
              onKeyDown={handleRosterSearchKeyDown}
              className={ROSTER_INPUT_CLASS_NAME}
            />
            {isSearchOpen ? (
              <div
                id={rosterResultsId}
                role="listbox"
                aria-label="Roster matches"
                className="mt-1 overflow-hidden rounded-md border border-border bg-card"
              >
                {visibleRosterStudents.length > 0 ? (
                  visibleRosterStudents.map((student, index) => (
                    <button
                      key={student.id}
                      id={`${idPrefix}-roster-result-${student.id}`}
                      type="button"
                      role="option"
                      tabIndex={-1}
                      aria-selected={index === activeResultIndex}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveResultIndex(index)}
                      onClick={() => handleRosterStudentChoice(student)}
                      className={`flex min-h-10 w-full items-center gap-2 border-b border-border/70 px-3 py-2 text-left text-sm text-foreground outline-none last:border-b-0 ${
                        index === activeResultIndex
                          ? "bg-muted"
                          : "bg-card hover:bg-muted/60"
                      }`}
                    >
                      <span className="font-medium">{student.displayName}</span>
                      <span className="truncate text-muted-foreground">
                        @{student.mentionHandle}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No matching roster student.
                  </p>
                )}
              </div>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => {
              setIsSearchOpen(false);
              setIsCreatingNew(true);
              onError("");
            }}
          >
            <UserPlus aria-hidden="true" className="size-4 text-primary" />
            Add @{handle} as a new student
          </Button>
        </div>
      )}
    </div>
  );
}
