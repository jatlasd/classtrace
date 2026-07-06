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
const reportPrintAction = readFileSync(
  join(
    projectRoot,
    "components",
    "students",
    "student-report-print-action.tsx"
  ),
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
const globalsCss = readFileSync(join(projectRoot, "app", "globals.css"), "utf8");

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

  it("keeps the report read-only and out of generated-report, AI, dashboard, and admin scope", () => {
    const combined = `${reportRoute}\n${reportComponent}\n${reportHelper}\n${appTopNav}`;

    expect(combined).not.toMatch(/\b(Generate report)\b/);
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

  it("adds browser-native print behavior without generated PDF scope", () => {
    const combined = `${reportComponent}\n${reportPrintAction}\n${globalsCss}`;

    expect(reportComponent).toContain("StudentReportPrintAction");
    expect(reportComponent).toContain("student-report-screen-only");
    expect(reportComponent).toContain("student-report-page");
    expect(reportComponent).toContain("student-report-print-root");
    expect(reportComponent).toContain("student-report-print-context");
    expect(reportComponent).toContain("student-report-entry");
    expect(reportPrintAction).toContain("Print / Save as PDF");
    expect(reportPrintAction).toContain("window.print()");
    expect(reportPrintAction).not.toMatch(/href=|download|api/i);
    expect(appTopNav).toContain("app-top-nav");
    expect(globalsCss).toContain("@media print");
    expect(globalsCss).toContain("body:has(.student-report-page) .app-top-nav");
    expect(globalsCss).toContain(".student-report-screen-only");
    expect(globalsCss).toContain("break-inside: avoid");
    expect(combined).not.toMatch(/generatePdf|PDFDocument|download report/i);
  });
});
