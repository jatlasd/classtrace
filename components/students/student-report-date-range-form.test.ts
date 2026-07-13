// @vitest-environment jsdom

import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const routerPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

import {
  buildStudentReportDateRangeHref,
  StudentReportDateRangeForm,
} from "./student-report-date-range-form";

afterEach(() => {
  cleanup();
  routerPush.mockReset();
});

describe("buildStudentReportDateRangeHref", () => {
  it("includes the browser offset for each selected calendar boundary", () => {
    const boundaryCalls: Array<[string, boolean]> = [];
    const href = buildStudentReportDateRangeHref(
      "student_mary",
      "2026-10-31",
      "2026-11-01",
      (value, endExclusive) => {
        boundaryCalls.push([value, endExclusive]);
        return endExclusive ? 300 : 240;
      }
    );

    expect(href).toBe(
      "/app/students/student_mary/report?start=2026-10-31&startOffset=240&end=2026-11-01&endOffset=300"
    );
    expect(boundaryCalls).toEqual([
      ["2026-10-31", false],
      ["2026-11-01", true],
    ]);
  });

  it("keeps an all-evidence report free of empty range parameters", () => {
    expect(buildStudentReportDateRangeHref("student_mary", "", "")).toBe(
      "/app/students/student_mary/report"
    );
  });

  it("submits the selected dates with browser-derived boundary offsets", () => {
    render(
      createElement(StudentReportDateRangeForm, {
        studentId: "student_mary",
      })
    );

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-07-10" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-07-10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply range" }));

    expect(routerPush).toHaveBeenCalledTimes(1);
    const submittedUrl = routerPush.mock.calls[0][0] as string;
    expect(submittedUrl).toContain("start=2026-07-10");
    expect(submittedUrl).toContain("end=2026-07-10");
    expect(submittedUrl).toMatch(/startOffset=-?\d+/);
    expect(submittedUrl).toMatch(/endOffset=-?\d+/);
  });
});
