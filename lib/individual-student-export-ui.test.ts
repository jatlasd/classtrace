import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
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
const feedSource = readFileSync(
  join(projectRoot, "components", "dashboard", "evidence-feed.tsx"),
  "utf8"
);
const prismaSchema = readFileSync(
  join(projectRoot, "prisma", "schema.prisma"),
  "utf8"
);

describe("Unit 21 individual student export UI", () => {
  it("adds a restrained student timeline CSV export action", () => {
    expect(timelinePage).toContain("StudentEvidenceExportAction");
    expect(timelinePage).toContain("studentId={student.id}");
    expect(timelinePage).toContain("evidenceCount={evidenceCount}");
    expect(exportAction).toContain('"use client"');
    expect(exportAction).toContain("exportStudentEvidence({ studentId })");
    expect(exportAction).toContain("Export evidence");
    expect(exportAction).toContain("Preparing CSV");
    expect(exportAction).toContain("No validated evidence to export yet.");
    expect(exportAction).toContain("new Blob");
    expect(exportAction).toContain("URL.createObjectURL");
  });

  it("does not send ownership or evidence ids from the client export action", () => {
    expect(exportAction).not.toMatch(
      /workspaceId|teacherProfileId|clerkUserId|evidenceId|rosterStudentId/
    );
    expect(exportAction).not.toMatch(/querySelector|innerText|textContent/);
  });

  it("keeps export off roster rows and the global feed", () => {
    expect(rosterPage).not.toContain("StudentEvidenceExportAction");
    expect(feedSource).not.toContain("StudentEvidenceExportAction");
    expect(feedSource).not.toContain("Export evidence");
  });

  it("does not introduce out-of-scope export formats or claims", () => {
    const combined = `${timelinePage}\n${exportAction}\n${rosterPage}\n${feedSource}`;

    expect(prismaSchema).not.toMatch(/rawNote|draftText|originalCapture|sourceText/);
    expect(combined).not.toMatch(
      /\b(AI-powered|AI summary|FERPA-compliant|district-approved|SIS sync|gradebook|IEP|parent communication|admin dashboard|upload|file attachment|billing|all students|account export|PDF|DOCX|XLSX|report template)\b/i
    );
  });
});
