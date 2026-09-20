// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import {
  StudentQuickJump,
  StudentQuickJumpProvider,
  type StudentQuickJumpOption,
} from "@/components/students/student-quick-jump";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

const students: StudentQuickJumpOption[] = [
  {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    classGroupName: "Reading",
    schoolLocalId: "R-104",
  },
  {
    id: "student_stacy",
    displayName: "Stacy",
    mentionHandle: "stacy",
    classGroupName: "Math",
    schoolLocalId: null,
  },
];

function renderQuickJump(
  props: ComponentProps<typeof StudentQuickJump> = {}
) {
  return render(
    <StudentQuickJumpProvider students={students}>
      <StudentQuickJump {...props} />
    </StudentQuickJumpProvider>
  );
}

afterEach(() => {
  cleanup();
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: undefined,
  });
});

describe("StudentQuickJump", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches active students by name, handle, and local ID with context", () => {
    renderQuickJump();
    const input = screen.getByRole("combobox", { name: "Find a student" });

    fireEvent.focus(input);
    expect(input.getAttribute("placeholder")).toBe("Search students");
    expect(screen.queryByRole("listbox", { name: "Students" })).toBeNull();

    fireEvent.change(input, { target: { value: "R-104" } });

    const listbox = screen.getByRole("listbox", { name: "Students" });
    expect(within(listbox).getByRole("option", { name: /Mary/ })).toBeTruthy();
    expect(within(listbox).queryByRole("option", { name: /Stacy/ })).toBeNull();
    expect(within(listbox).getByText(/@mary · Reading · Local ID R-104/)).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("1 student found.");
  });

  it("supports arrow-key selection and navigates to the chosen timeline", () => {
    renderQuickJump();
    const input = screen.getByRole("combobox", { name: "Find a student" });

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toContain("option-0");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mocks.push).toHaveBeenCalledWith("/app/students/student_stacy");
  });

  it("moves results above the field when the visual viewport is constrained", () => {
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: {
        height: 420,
        offsetTop: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    renderQuickJump();
    const input = screen.getByRole("combobox", { name: "Find a student" });
    input.getBoundingClientRect = vi.fn(
      () =>
        ({
          bottom: 394,
          height: 44,
          left: 16,
          right: 374,
          top: 350,
          width: 358,
          x: 16,
          y: 350,
          toJSON: () => ({}),
        }) satisfies DOMRect
    );

    fireEvent.change(input, { target: { value: "Mary" } });

    const listbox = screen.getByRole("listbox", { name: "Students" });
    expect(listbox.className).toContain("bottom-full");
    expect(listbox.style.maxHeight).toBe("288px");
  });

  it("opens a compact switcher, excludes the current student, and restores focus", async () => {
    renderQuickJump({ currentStudentId: "student_mary", mode: "trigger" });
    const trigger = screen.getByRole("button", { name: "Switch student" });

    fireEvent.click(trigger);
    const input = screen.getByRole("combobox", { name: "Find a student" });
    await waitFor(() => expect(document.activeElement).toBe(input));
    expect(screen.queryByRole("listbox", { name: "Students" })).toBeNull();

    fireEvent.change(input, { target: { value: "Stacy" } });
    expect(screen.queryByRole("option", { name: /Mary/ })).toBeNull();
    expect(screen.getByRole("option", { name: /Stacy/ })).toBeTruthy();

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("combobox", { name: "Find a student" })).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
