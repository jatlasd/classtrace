import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const studentPage = readFileSync(
  join(projectRoot, "app", "app", "students", "[studentId]", "page.tsx"),
  "utf8"
);
const timelinePage = readFileSync(
  join(projectRoot, "components", "students", "student-timeline-page.tsx"),
  "utf8"
);
const exportAction = readFileSync(
  join(projectRoot, "components", "students", "student-evidence-export-action.tsx"),
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

describe("Unit 16 student timeline UI", () => {
  it("renders a production-aligned student timeline from a safe display model", () => {
    expect(studentPage).toContain("StudentTimelinePage");
    expect(studentPage).toContain("getCurrentWorkspace");
    expect(studentPage).toContain("getStudentTimelineRecordsForWorkspace");
    expect(studentPage).toContain("evidenceRecords={timeline.evidenceRecords}");
    expect(timelinePage).toContain("StudentTimelineStudent");
    expect(timelinePage).toContain("StudentTimelineEvidenceRecord");
    expect(timelinePage).toContain("Student timeline");
    expect(timelinePage).toContain("Evidence timeline");
    expect(timelinePage).toContain("Validated evidence");
    expect(timelinePage).toContain("No validated evidence yet.");
    expect(timelinePage).toContain("Capture a student-specific note");
  });

  it("does not carry forward local POC raw-note timeline parsing", () => {
    expect(studentPage).not.toMatch(/useState|useEffect|useMemo|use\(/);
    expect(studentPage).not.toMatch(/getStudentById|getCapturesForStudent/);
    expect(studentPage).not.toMatch(/buildNoteDraft|draftToDisplay|NoteContent/);
    expect(timelinePage).not.toMatch(/rawNote|draftText|originalCapture|sourceText/);
    expect(prismaSchema).not.toMatch(/rawNote|draftText|originalCapture|sourceText/);
  });

  it("keeps the timeline out of unrelated management scope", () => {
    expect(rosterPage).toContain("routes.student(student.id)");
    expect(timelinePage).toContain("StudentEvidenceExportAction");
    expect(exportAction).toContain("Export evidence");
    expect(timelinePage).not.toMatch(/\b(Archive|Delete)\b/);
    expect(studentPage).not.toMatch(/listEvidenceFeedRecordsForWorkspace/);
    expect(studentPage).not.toMatch(/evidenceRecord\.findMany|@\/lib\/db/);

    const combined = `${studentPage}\n${timelinePage}`;
    expect(combined).not.toMatch(/\b(AI-powered|FERPA-compliant|district-approved)\b/i);
    expect(combined).not.toMatch(
      /\b(SIS sync|gradebook|IEP|parent communication|admin dashboard|upload|file attachment|billing)\b/i
    );
  });
});
