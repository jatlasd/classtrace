"use client";

import { Search, X } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";

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
};

export function ExploreMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  placeholder,
  emptyMessage,
}: ExploreMultiSelectProps) {
  const inputId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
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

  function selectOption(option: ExploreSelectOption): void {
    onChange([...selectedIds, option.id]);
    setSearch("");
    setActiveIndex(0);
    setIsOpen(true);
    inputRef.current?.focus();
  }

  function removeOption(id: string): void {
    onChange(selectedIds.filter((selectedId) => selectedId !== id));
    inputRef.current?.focus();
  }

  return (
    <div className="relative min-w-0">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-xs font-semibold text-foreground"
      >
        {label}
      </label>
      <div
        className="rounded-md border border-input bg-card px-2.5 py-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        {selected.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-1.5" aria-label={`${label} selected`}>
            {selected.map((option) => (
              <span
                key={option.id}
                className="inline-flex min-h-9 max-w-full items-center gap-1 rounded-full border border-border bg-muted/40 pl-2.5 text-xs font-medium text-foreground"
              >
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                  {option.label}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${option.label}`}
                  onClick={() => removeOption(option.id)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex min-h-9 items-center gap-2">
          <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={
              isOpen && activeOption ? `${listboxId}-${activeOption.id}` : undefined
            }
            value={search}
            placeholder={placeholder}
            onFocus={() => setIsOpen(true)}
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
                  available.length === 0 ? 0 : (index + 1) % available.length
                );
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setIsOpen(true);
                setActiveIndex((index) =>
                  available.length === 0
                    ? 0
                    : (index - 1 + available.length) % available.length
                );
              } else if (event.key === "Enter" && isOpen && activeOption) {
                event.preventDefault();
                selectOption(activeOption);
              } else if (event.key === "Escape") {
                event.preventDefault();
                setIsOpen(false);
              } else if (
                event.key === "Backspace" &&
                !search &&
                selectedIds.length > 0
              ) {
                event.preventDefault();
                removeOption(selectedIds[selectedIds.length - 1]);
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={`${label} choices`}
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-floating"
        >
          {available.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            available.map((option, index) => (
              <button
                key={option.id}
                id={`${listboxId}-${option.id}`}
                type="button"
                role="option"
                aria-selected="false"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-left outline-none transition-colors ${
                  index === boundedActiveIndex ? "bg-muted text-foreground" : "text-foreground"
                }`}
              >
                <span className="min-w-0">
                  <span className="block break-words text-sm font-medium [overflow-wrap:anywhere]">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="mt-0.5 block break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
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
