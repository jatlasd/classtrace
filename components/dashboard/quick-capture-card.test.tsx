// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuickCaptureCard } from "./quick-capture-card";

const roster = [
  {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    classGroupName: "Reading",
  },
];

afterEach(cleanup);

describe("QuickCaptureCard mentions editor", () => {
  it("keeps the input and highlight layers on identical text metrics", () => {
    render(<QuickCaptureCard rosterStudents={roster} onDraft={vi.fn()} />);
    const input = screen.getByLabelText("What happened?") as HTMLTextAreaElement;
    const highlighter = input.previousElementSibling as HTMLDivElement;

    for (const property of [
      "boxSizing",
      "width",
      "margin",
      "padding",
      "border",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "textAlign",
      "whiteSpace",
      "overflowWrap",
      "wordBreak",
    ] as const) {
      expect(input.style[property]).toBe(highlighter.style[property]);
    }

    expect(input.style.border).toBe("0px");
    expect(input.style.lineHeight).toBe("22.5px");
  });

  it("selects a mention without changing its text width", async () => {
    const { container } = render(
      <QuickCaptureCard rosterStudents={roster} onDraft={vi.fn()} />
    );
    const input = screen.getByLabelText("What happened?") as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: "@ma" } });
    input.setSelectionRange(3, 3);
    fireEvent.select(input);
    fireEvent.click(await screen.findByRole("option", { name: "Mary" }));

    const mention = await waitFor(() => {
      const element = container.querySelector(".quick-capture-mentions strong");
      expect(element).toBeTruthy();
      return element;
    });
    expect(mention).toBeTruthy();
    expect((mention as HTMLElement).style.fontWeight).toBe("inherit");
    expect((mention as HTMLElement).style.backgroundColor).toContain("var(--link)");
  });
});
