import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const studentPage = readFileSync(
  join(projectRoot, "app", "app", "students", "[studentId]", "page.tsx"),
  "utf8"
);
const timelineHelper = readFileSync(
  join(projectRoot, "lib", "evidence", "student-timeline-records.ts"),
  "utf8"
);
const timelineComponent = readFileSync(
  join(projectRoot, "components", "students", "student-timeline-page.tsx"),
  "utf8"
);
const rosterPage = readFileSync(
  join(projectRoot, "app", "app", "roster", "page.tsx"),
  "utf8"
);
const prismaSchema = readFileSync(
  join(projectRoot, "prisma", "schema.prisma"),
  "utf8"
);

describe("Unit 17 student timeline from database UI bridge", () => {
  it("wires the student route to workspace-scoped timeline records", () => {
    expect(studentPage).toContain("getCurrentWorkspace");
    expect(studentPage).toContain("getStudentTimelineRecordsForWorkspace");
    expect(studentPage).toContain("workspace.workspaceId");
    expect(studentPage).toContain("studentId");
    expect(studentPage).toContain("student={timeline.student}");
    expect(studentPage).toContain("evidenceRecords={timeline.evidenceRecords}");
    expect(studentPage).toContain("Student not found on your roster.");
    expect(studentPage).not.toContain("evidenceRecords={[]}");
    expect(studentPage).not.toMatch(/getCapturesForStudent|buildNoteDraft|draftToDisplay/);
  });

  it("keeps timeline database reads server-only and scoped to one student workspace", () => {
    expect(timelineHelper).toContain('import "server-only"');
    expect(timelineHelper).toContain("workspaceId");
    expect(timelineHelper).toContain("rosterStudentId: student.id");
    expect(timelineHelper).toContain("archivedAt: null");
    expect(timelineHelper).toContain('orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }]');
    expect(timelineHelper).not.toMatch(/localStorage|getCapturesForStudent/);
    expect(timelineHelper).not.toMatch(/rawNote|draftText|originalCapture|sourceText/);
  });

  it("exposes roster-to-timeline navigation without adding timeline export actions to roster", () => {
    expect(rosterPage).toContain("routes.student(student.id)");
    expect(rosterPage).toContain("Open ${student.displayName} timeline");
    expect(rosterPage).toContain("Open timeline");
    expect(rosterPage).toContain("RosterStudentRowActions");
    expect(rosterPage).not.toMatch(/\bExport\b/);
    expect(timelineComponent).toContain("StudentEvidenceExportAction");
    expect(timelineComponent).not.toMatch(/\b(Archive|Delete)\b/);
  });

  it("does not introduce out-of-scope claims or raw draft storage", () => {
    const combined = `${studentPage}\n${timelineHelper}\n${timelineComponent}\n${rosterPage}`;

    expect(prismaSchema).not.toMatch(/rawNote|draftText|originalCapture|sourceText/);
    expect(combined).not.toMatch(
      /\b(AI-powered|FERPA-compliant|district-approved|SIS sync|gradebook|IEP|parent communication|admin dashboard|upload|file attachment|billing)\b/i
    );
  });
});
