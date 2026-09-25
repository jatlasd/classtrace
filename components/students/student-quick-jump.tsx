"use client";

import { ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { routes } from "@/lib/routes";

export type StudentQuickJumpOption = {
  id: string;
  displayName: string;
  mentionHandle: string;
  classGroupName: string;
  schoolLocalId: string | null;
};

const StudentQuickJumpContext = createContext<readonly StudentQuickJumpOption[]>(
  []
);

type StudentQuickJumpProviderProps = {
  children: ReactNode;
  students: readonly StudentQuickJumpOption[];
};

export function StudentQuickJumpProvider({
  children,
  students,
}: StudentQuickJumpProviderProps) {
  return (
    <StudentQuickJumpContext.Provider value={students}>
      {children}
    </StudentQuickJumpContext.Provider>
  );
}

type StudentQuickJumpProps = {
  currentStudentId?: string;
  label?: string;
  mode?: "field" | "trigger";
  onNavigate?: () => void;
  showLabel?: boolean;
};

const MAX_VISIBLE_RESULTS = 8;

function matchesStudent(student: StudentQuickJumpOption, query: string): boolean {
  if (!query) return true;

  const normalizedHandle = student.mentionHandle.toLocaleLowerCase();
  return (
    student.displayName.toLocaleLowerCase().includes(query) ||
    normalizedHandle.includes(query.replace(/^@/, "")) ||
    `@${normalizedHandle}`.includes(query) ||
    Boolean(student.schoolLocalId?.toLocaleLowerCase().includes(query))
  );
}

export function StudentQuickJump({
  currentStudentId,
  label = "Find a student",
  mode = "field",
  onNavigate,
  showLabel = true,
}: StudentQuickJumpProps) {
  const students = useContext(StudentQuickJumpContext);
  const router = useRouter();
  const inputId = useId();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const [fieldOpen, setFieldOpen] = useState(false);
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [resultLayout, setResultLayout] = useState<{
    maxHeight: number;
    placement: "above" | "below";
  }>({ maxHeight: 288, placement: "below" });
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const availableStudents = useMemo(
    () => students.filter((student) => student.id !== currentStudentId),
    [currentStudentId, students]
  );
  const matchingStudents = useMemo(
    () =>
      availableStudents.filter((student) =>
        matchesStudent(student, normalizedQuery)
      ),
    [availableStudents, normalizedQuery]
  );
  const visibleStudents = matchingStudents.slice(0, MAX_VISIBLE_RESULTS);
  const isOpen = fieldOpen;
  const activeStudent =
    activeIndex >= 0 ? visibleStudents[activeIndex] : undefined;

  const updateResultLayout = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const inputRect = input.getBoundingClientRect();
    const viewportTop = window.visualViewport?.offsetTop ?? 0;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const viewportBottom = viewportTop + viewportHeight;
    const spaceBelow = viewportBottom - inputRect.bottom - 12;
    const spaceAbove = inputRect.top - viewportTop - 12;
    const placement =
      spaceBelow < 200 && spaceAbove > spaceBelow ? "above" : "below";
    const availableSpace = placement === "above" ? spaceAbove : spaceBelow;

    setResultLayout({
      maxHeight: Math.max(72, Math.min(288, availableSpace)),
      placement,
    });
  }, []);

  useEffect(() => {
    if (mode === "trigger" && triggerOpen) {
      inputRef.current?.focus();
    }
  }, [mode, triggerOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener("resize", updateResultLayout);
    visualViewport?.addEventListener("scroll", updateResultLayout);
    window.addEventListener("resize", updateResultLayout);

    return () => {
      visualViewport?.removeEventListener("resize", updateResultLayout);
      visualViewport?.removeEventListener("scroll", updateResultLayout);
      window.removeEventListener("resize", updateResultLayout);
    };
  }, [isOpen, updateResultLayout]);

  function closeResults({ restoreTrigger = false } = {}): void {
    setFieldOpen(false);
    if (mode === "trigger") {
      setTriggerOpen(false);
      if (restoreTrigger) {
        queueMicrotask(() => triggerRef.current?.focus());
      }
    }
  }

  function openResults(): void {
    updateResultLayout();
    setFieldOpen(true);
  }

  function selectStudent(student: StudentQuickJumpOption): void {
    setQuery("");
    closeResults();
    onNavigate?.();
    router.push(routes.student(student.id));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Escape") {
      if (!isOpen && !(mode === "trigger" && triggerOpen)) return;
      event.preventDefault();
      closeResults({ restoreTrigger: mode === "trigger" });
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        openResults();
      }
      setActiveIndex((current) =>
        visibleStudents.length === 0
          ? -1
          : current < 0
            ? 0
            : Math.min(current + 1, visibleStudents.length - 1)
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openResults();
      }
      setActiveIndex((current) =>
        visibleStudents.length === 0
          ? -1
          : current < 0
            ? visibleStudents.length - 1
            : Math.max(current - 1, 0)
      );
      return;
    }

    if (event.key === "Enter" && isOpen && activeStudent) {
      event.preventDefault();
      selectStudent(activeStudent);
    }
  }

  const resultCountMessage =
    matchingStudents.length === 0
      ? "No students found."
      : `${matchingStudents.length} ${
          matchingStudents.length === 1 ? "student" : "students"
        } found.`;

  const combobox = (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-3"
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-activedescendant={
          isOpen && activeStudent ? `${listboxId}-option-${activeIndex}` : undefined
        }
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(-1);
          openResults();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search students"
        className="field w-full rounded-full py-2 pl-9! pr-3! text-[15px]"
      />

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Students"
          style={{ maxHeight: resultLayout.maxHeight }}
          className={`absolute inset-x-0 z-30 overflow-y-auto rounded-xl border border-line bg-plate p-1.5 shadow-lift ${
            resultLayout.placement === "above"
              ? "bottom-full mb-1.5"
              : "top-full mt-1.5"
          }`}
        >
          {visibleStudents.length > 0 ? (
            visibleStudents.map((student, index) => (
              <li
                key={student.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectStudent(student)}
                className={`cursor-pointer rounded-lg px-3 py-2.5 outline-none ${
                  index === activeIndex ? "bg-live-soft" : "hover:bg-well"
                }`}
              >
                <span className="block break-words text-[15px] font-semibold text-fg [overflow-wrap:anywhere]">
                  {student.displayName}
                </span>
                <span className="mt-0.5 block break-words text-xs text-fg-2 [overflow-wrap:anywhere]">
                  @{student.mentionHandle} · {student.classGroupName}
                  {student.schoolLocalId
                    ? ` · Local ID ${student.schoolLocalId}`
                    : ""}
                </span>
              </li>
            ))
          ) : (
            <li className="px-3 py-3 text-sm text-fg-2">No students found.</li>
          )}
        </ul>
      ) : null}

      <p role="status" aria-live="polite" className="sr-only">
        {isOpen ? resultCountMessage : ""}
      </p>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`student-quick-jump relative min-w-0 ${
        mode === "trigger" ? "shrink-0" : "w-full"
      }`}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget)) {
          closeResults();
        }
      }}
    >
      {mode === "trigger" ? (
        <>
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={triggerOpen}
            aria-controls={`${listboxId}-panel`}
            onClick={() => {
              if (triggerOpen) {
                closeResults();
              } else {
                setTriggerOpen(true);
              }
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-line-2 px-3 text-[13px] font-semibold text-fg outline-none transition-colors hover:bg-plate aria-expanded:bg-plate focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base lg:h-8"
          >
            Switch student
            <ChevronDown
              aria-hidden="true"
              className={`size-4 transition-transform ${triggerOpen ? "rotate-180" : ""}`}
            />
          </button>
          {triggerOpen ? (
            <div
              id={`${listboxId}-panel`}
              className="absolute left-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] sm:left-auto sm:right-0 rounded-xl border border-line bg-plate p-3 shadow-lift"
            >
              <label htmlFor={inputId} className="label mb-1.5 block text-fg-2">
                {label}
              </label>
              {combobox}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <label
            htmlFor={inputId}
            className={showLabel ? "label mb-1.5 block text-fg-2" : "sr-only"}
          >
            {label}
          </label>
          {combobox}
        </>
      )}
    </div>
  );
}
