import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const reportRoute = readFileSync(
  join(
    projectRoot,
    "app",
    "app",
    "students",
    "[studentId]",
    "report",
    "page.tsx"
  ),
  "utf8"
);
const reportComponent = readFileSync(
  join(projectRoot, "components", "students", "student-report-page.tsx"),
  "utf8"
);
const timelineComponent = readFileSync(
  join(projectRoot, "components", "students", "student-timeline-page.tsx"),
  "utf8"
);
const appTopNav = readFileSync(
  join(projectRoot, "components", "dashboard", "app-top-nav.tsx"),
  "utf8"
);
const reportHelper = readFileSync(
  join(projectRoot, "lib", "evidence", "student-report-records.ts"),
  "utf8"
);

describe("Unit 33 student report UI", () => {
  it("adds a student-scoped report route resolved through the current workspace", () => {
    expect(reportRoute).toContain("getCurrentWorkspace");
    expect(reportRoute).toContain("workspace.workspaceId");
    expect(reportRoute).toContain("getStudentReportRecordsForWorkspace");
    expect(reportRoute).toContain("parseStudentReportDateRange");
    expect(reportRoute).toContain("params: Promise<{ studentId: string }>");
    expect(reportRoute).toContain("searchParams: Promise");
    expect(reportRoute).toContain("Student not found on your roster.");
    expect(reportRoute).not.toMatch(/workspaceId.*searchParams|teacherId.*searchParams/);
    expect(reportRoute).not.toMatch(/@\/lib\/db\/prisma|prisma\./);
  });

  it("adds a restrained timeline entry point without adding a Reports nav item", () => {
    expect(timelineComponent).toContain("View report");
    expect(timelineComponent).toContain("routes.studentReport(student.id)");
    expect(appTopNav).not.toMatch(/\bReports\b/);
  });

  it("renders date controls, factual report context, and safe empty states", () => {
    expect(reportComponent).toContain("Student report");
    expect(reportComponent).toContain("Evidence report for");
    expect(reportComponent).toContain("Evidence included");
    expect(reportComponent).toContain("Date range");
    expect(reportComponent).toContain("Start date");
    expect(reportComponent).toContain("End date");
    expect(reportComponent).toContain("Apply range");
    expect(reportComponent).toContain("Clear range");
    expect(reportComponent).toContain("No evidence in this range.");
    expect(reportComponent).toContain("No validated evidence yet.");
    expect(reportComponent).toContain("Structured details:");
    expect(reportComponent).toContain("Legacy structured entry");
  });

  it("keeps the report read-only and out of print, AI, dashboard, and admin scope", () => {
    const combined = `${reportRoute}\n${reportComponent}\n${reportHelper}\n${appTopNav}`;

    expect(combined).not.toMatch(/\b(Print|Save as PDF|Generate report)\b/);
    expect(combined).not.toMatch(/\b(Insights|Trends|Recommendations)\b/);
    expect(combined).not.toMatch(
      /\b(AI|AI-powered|FERPA-compliant|compliance-ready|IEP-ready|Parent report|Behavior analysis)\b/i
    );
    expect(combined).not.toMatch(
      /\b(SIS sync|gradebook|admin dashboard|upload|file attachment|billing|analytics)\b/i
    );
    expect(combined).not.toMatch(/\b(Archive evidence|Delete evidence)\b/);
    expect(combined).not.toMatch(/rawNote|draftText|originalCapture|sourceText/);
  });
});
