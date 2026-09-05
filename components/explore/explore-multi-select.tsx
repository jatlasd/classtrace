"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";

export type ExploreSelectOption = {
  id: string;
  label: string;
  description?: string;
};

type ExploreMultiSelectProps = {
  label: string;
  options: ExploreSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  emptyMessage: string;
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function ExploreMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  placeholder,
  emptyMessage,
  inputRef,
}: ExploreMultiSelectProps) {
  const inputId = useId();
  const listboxId = useId();
  const localInputRef = useRef<HTMLInputElement>(null);
  const resolvedInputRef = inputRef ?? localInputRef;
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => options.find((option) => option.id === id))
        .filter((option): option is ExploreSelectOption => Boolean(option)),
    [options, selectedIds]
  );
  const available = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return options.filter(
      (option) =>
        !selectedIds.includes(option.id) &&
        (!needle ||
          option.label.toLowerCase().includes(needle) ||
          option.description?.toLowerCase().includes(needle))
    );
  }, [options, search, selectedIds]);

  const boundedActiveIndex = Math.min(activeIndex, Math.max(available.length - 1, 0));
  const activeOption = available[boundedActiveIndex];
  const activeOptionId = isOpen && activeOption ? `${listboxId}-${activeOption.id}` : undefined;

  useEffect(() => {
    if (activeOptionId) document.getElementById(activeOptionId)?.scrollIntoView({ block: "nearest" });
  }, [activeOptionId]);

  function selectOption(option: ExploreSelectOption): void {
    onChange([...selectedIds, option.id]);
    setSearch("");
    setActiveIndex(0);
    setIsOpen(false);
  }

  function removeOption(id: string): void {
    onChange(selectedIds.filter((selectedId) => selectedId !== id));
    resolvedInputRef.current?.focus();
  }

  return (
    <div className="relative min-w-0">
      <label
        htmlFor={inputId}
        className="mb-1 block text-xs font-semibold text-foreground"
      >
        {label}
      </label>
      <div
        className="rounded-md border border-input bg-background px-2.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        {selected.length > 0 ? (
          <div className="my-1 flex flex-wrap gap-1" aria-label={`${label} selected`}>
            {selected.map((option) => (
              <span
                key={option.id}
                className="inline-flex min-h-7 max-w-full items-center gap-0.5 rounded-full border border-border bg-muted pl-1.5 text-xs font-medium text-foreground"
              >
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                  {option.label}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${option.label}`}
                  onClick={() => removeOption(option.id)}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring lg:size-7"
                >
                  <X aria-hidden="true" className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex min-h-[34px] items-center gap-1.5 lg:min-h-[26px]">
          <Search aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            ref={resolvedInputRef}
            id={inputId}
            type="search"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            value={search}
            placeholder={selected.length ? "Add another…" : placeholder}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            onChange={(event) => {
              setSearch(event.target.value);
              setActiveIndex(0);
              setIsOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setIsOpen(true);
                setActiveIndex((index) =>
                  !isOpen || available.length === 0 ? 0 : (index + 1) % available.length
                );
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setIsOpen(true);
                setActiveIndex((index) =>
                  available.length === 0
                    ? 0
                    : (index - 1 + available.length) % available.length
                );
              } else if (event.key === "Enter") {
                if (isOpen) {
                  event.preventDefault();
                  if (activeOption) selectOption(activeOption);
                }
              } else if (event.key === "Escape") {
                if (isOpen) {
                  event.preventDefault();
                  setIsOpen(false);
                }
              } else if (
                event.key === "Backspace" &&
                !search &&
                selectedIds.length > 0
              ) {
                event.preventDefault();
                removeOption(selectedIds[selectedIds.length - 1]);
              }
            }}
            className="min-h-11 min-w-0 flex-1 bg-transparent lg:min-h-7 text-base text-foreground sm:text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={`${isOpen ? "Hide" : "Show"} ${label.toLowerCase()} choices`}
            aria-expanded={isOpen}
            aria-controls={listboxId}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              resolvedInputRef.current?.focus();
              setIsOpen(!isOpen);
            }}
            className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground lg:size-9"
          >
            <ChevronDown aria-hidden="true" className={`size-4 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={`${label} choices`}
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-floating"
        >
          {available.length === 0 ? (
            <p className="px-2.5 py-2 text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            available.map((option, index) => (
              <button
                key={option.id}
                id={`${listboxId}-${option.id}`}
                type="button"
                tabIndex={-1}
                role="option"
                aria-selected="false"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={`flex min-h-11 w-full items-center gap-2 rounded-md px-2 py-1 text-left outline-none transition-colors lg:min-h-9 ${
                  index === boundedActiveIndex
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                }`}
              >
                <span className="min-w-0">
                  <span className="block break-words text-sm font-medium [overflow-wrap:anywhere]">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span
                      className={`mt-0.5 block break-words text-xs [overflow-wrap:anywhere] ${
                        index === boundedActiveIndex
                          ? "text-ground-muted"
                          : "text-muted-foreground"
                      }`}
                    >
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
