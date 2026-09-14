// @vitest-environment jsdom

import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DraftReviewQueue, type DraftReviewQueueItem } from "./draft-review-queue";

const items: DraftReviewQueueItem[] = [
  {
    id: "first",
    studentLabel: "First",
    note: "First note",
    filing: "General observation",
    timestamp: "Just now",
    needsCorrection: false,
    hasPhoto: false,
  },
  {
    id: "middle",
    studentLabel: "Middle",
    note: "Middle note",
    filing: "General observation",
    timestamp: "Just now",
    needsCorrection: false,
    hasPhoto: false,
  },
  {
    id: "last",
    studentLabel: "Last",
    note: "Last note",
    filing: "General observation",
    timestamp: "Just now",
    needsCorrection: false,
    hasPhoto: false,
  },
];

function rowButtons(dialog: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    dialog.querySelectorAll<HTMLButtonElement>("button[aria-expanded]")
  );
}

function QueueHarness({
  initialItems = items,
  initialActiveDraftId = null,
}: {
  initialItems?: DraftReviewQueueItem[];
  initialActiveDraftId?: string | null;
}) {
  const [queueItems, setQueueItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState(initialActiveDraftId);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setQueueItems((current) =>
            current.filter((item) => item.id !== "middle")
          )
        }
      >
        Remove middle externally
      </button>
      <DraftReviewQueue
        items={queueItems}
        open={open}
        onOpenChange={setOpen}
        activeDraftId={activeDraftId}
        onActiveDraftChange={setActiveDraftId}
        renderReview={(id) => (
          <div>
            <button
              type="button"
              onClick={() =>
                setQueueItems((current) =>
                  current.filter((item) => item.id !== id)
                )
              }
            >
              Remove active
            </button>
            {id === "first" ? (
              <>
                <button type="button">Edit first note</button>
                <button type="button" disabled>
                  Approve and save
                </button>
              </>
            ) : null}
          </div>
        )}
      />
    </>
  );
}

function openQueue(): HTMLElement {
  fireEvent.click(
    screen.getByRole("button", { name: "Drafts to review, 3" })
  );
  return screen.getByRole("dialog", { name: "Drafts to review" });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DraftReviewQueue", () => {
  it("keeps the desktop queue between its trigger and the viewport edge", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.getAttribute("aria-label") === "Drafts to review, 3") {
        return {
          bottom: 520,
          height: 40,
          left: 760,
          right: 1000,
          top: 480,
          width: 240,
          x: 760,
          y: 480,
          toJSON: () => ({}),
        };
      }
      return {
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };
    });

    render(<QueueHarness />);
    const dialog = openQueue();

    expect(dialog.style.getPropertyValue("--draft-queue-top")).toBe("424px");
    expect(dialog.style.getPropertyValue("--draft-queue-right")).toBe("24px");
    expect(dialog.style.getPropertyValue("--draft-queue-max-height")).toBe("320px");
  });

  it("keeps every draft in one scrollable list and expands only one at a time", () => {
    render(<QueueHarness />);
    const dialog = openQueue();
    const draftList = within(dialog).getByRole("list", {
      name: "Drafts awaiting review",
    });
    const rows = rowButtons(dialog);

    expect(within(draftList).getAllByRole("listitem")).toHaveLength(3);

    fireEvent.click(rows[0]);
    expect(rows[0].getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(rows[1]);
    expect(rows[0].getAttribute("aria-expanded")).toBe("false");
    expect(rows[1].getAttribute("aria-expanded")).toBe("true");
  });

  it("wraps only through visible tab stops when every review is collapsed", () => {
    render(<QueueHarness />);
    const dialog = openQueue();
    const rows = rowButtons(dialog);
    const closeButton = within(dialog).getByRole("button", {
      name: "Close drafts to review",
    });

    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(rows[2]);
    expect(document.activeElement?.closest("[hidden]")).toBeNull();

    rows[2].focus();
    fireEvent.keyDown(rows[2], { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);
    expect(document.activeElement?.closest("[hidden]")).toBeNull();
  });

  it("wraps around expanded controls without entering a later collapsed review", () => {
    render(<QueueHarness />);
    const dialog = openQueue();
    const rows = rowButtons(dialog);
    fireEvent.click(rows[0]);

    const closeButton = within(dialog).getByRole("button", {
      name: "Close drafts to review",
    });
    const lastRow = rowButtons(dialog)[2];
    expect(within(dialog).getByRole("button", { name: "Edit first note" })).toBeTruthy();
    expect(
      (within(dialog).getByRole("button", { name: "Approve and save" }) as HTMLButtonElement)
        .disabled
    ).toBe(true);

    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(lastRow);
    expect(document.activeElement?.closest("[hidden]")).toBeNull();

    lastRow.focus();
    fireEvent.keyDown(lastRow, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);
  });

  it("recovers to the matching dialog boundary when focus starts outside", () => {
    render(<QueueHarness />);
    const dialog = openQueue();
    const closeButton = within(dialog).getByRole("button", {
      name: "Close drafts to review",
    });
    const lastRow = rowButtons(dialog)[2];
    const outside = screen.getByRole("button", {
      name: "Remove middle externally",
    });

    outside.focus();
    fireEvent.keyDown(outside, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);

    outside.focus();
    fireEvent.keyDown(outside, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(lastRow);
  });

  it.each([
    ["first", "Middle"],
    ["middle", "Last"],
    ["last", "Middle"],
  ] as const)(
    "focuses the next surviving row after removing the active %s row",
    async (removedId, expectedStudent) => {
      render(<QueueHarness />);
      const dialog = openQueue();
      const rows = rowButtons(dialog);
      const removedIndex = items.findIndex((item) => item.id === removedId);
      fireEvent.click(rows[removedIndex]);
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Remove active" })
      );

      await waitFor(() => {
        const focusedRow = document.activeElement;
        expect(focusedRow?.getAttribute("aria-expanded")).toBe("false");
        expect(focusedRow?.textContent).toContain(expectedStudent);
      });
      expect(rowButtons(dialog).every((row) => row.getAttribute("aria-expanded") === "false")).toBe(
        true
      );
    }
  );

  it("does not steal focus when an unrelated collapsed row disappears", () => {
    render(<QueueHarness />);
    const dialog = openQueue();
    fireEvent.click(rowButtons(dialog)[0]);
    const removeMiddle = screen.getByRole("button", {
      name: "Remove middle externally",
    });
    removeMiddle.focus();
    fireEvent.click(removeMiddle);

    expect(document.activeElement).toBe(removeMiddle);
    expect(within(dialog).getByText("First note")).toBeTruthy();
  });
});
