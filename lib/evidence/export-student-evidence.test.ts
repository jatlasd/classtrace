import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: {
      findFirst: vi.fn(),
    },
    evidenceRecord: {
      findMany: vi.fn(),
    },
  },
}));

import {
  escapeCsvCell,
  exportStudentEvidenceForWorkspace,
  type ExportStudentEvidenceDatabase,
} from "@/lib/evidence/export-student-evidence";

function buildStudent() {
  return {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    schoolLocalId: "local-7",
    classGroup: {
      name: "Reading group",
    },
  };
}

function buildEvidenceRecord() {
  return {
    id: "evidence_1",
    evidenceDate: new Date("2026-06-17T14:00:00.000Z"),
    summary: 'Mary used a "chunking" strategy, then explained her answer.',
    evidenceType: "Academic check-in",
    topic: "reading",
    supportLevel: "one prompt",
    context: "small group",
    performance: "worked through the passage",
    communication: "explained answer",
    behavior: "used a strategy",
    tags: ["reading", "prompt"],
    followUpNeeded: true,
    followUpNotes: "Check comprehension,\nthen fade prompt.",
    validatedAt: new Date("2026-06-17T14:05:00.000Z"),
    createdAt: new Date("2026-06-17T14:06:00.000Z"),
  };
}

function buildDatabase({
  student = buildStudent(),
  evidenceRecords = [buildEvidenceRecord()],
}: {
  student?: ReturnType<typeof buildStudent> | null;
  evidenceRecords?: ReturnType<typeof buildEvidenceRecord>[];
} = {}) {
  const studentCalls: unknown[] = [];
  const evidenceCalls: unknown[] = [];
  const database = {
    rosterStudent: {
      findFirst: async (args) => {
        studentCalls.push(args);
        return student;
      },
    },
    evidenceRecord: {
      findMany: async (args) => {
        evidenceCalls.push(args);
        return evidenceRecords;
      },
    },
  } satisfies ExportStudentEvidenceDatabase;

  return { database, studentCalls, evidenceCalls };
}

describe("exportStudentEvidenceForWorkspace", () => {
  it("verifies one active workspace student before exporting evidence", async () => {
    const { database, studentCalls, evidenceCalls } = buildDatabase();

    const result = await exportStudentEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: " student_mary " },
      },
      database
    );

    expect(studentCalls).toEqual([
      {
        where: {
          workspaceId: "workspace_1",
          id: "student_mary",
          archivedAt: null,
        },
        select: {
          id: true,
          displayName: true,
          mentionHandle: true,
          schoolLocalId: true,
          classGroup: {
            select: {
              name: true,
            },
          },
        },
      },
    ]);
    expect(evidenceCalls).toEqual([
      {
        where: {
          workspaceId: "workspace_1",
          rosterStudentId: "student_mary",
          archivedAt: null,
        },
        orderBy: [{ evidenceDate: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          evidenceDate: true,
          summary: true,
          evidenceType: true,
          topic: true,
          supportLevel: true,
          context: true,
          performance: true,
          communication: true,
          behavior: true,
          tags: true,
          followUpNeeded: true,
          followUpNotes: true,
          validatedAt: true,
          createdAt: true,
        },
      },
    ]);
    expect(result).toMatchObject({
      success: true,
      filename: "classtrace-mary-evidence.csv",
      mimeType: "text/csv;charset=utf-8",
      recordCount: 1,
    });
  });

  it("builds deterministic CSV content with escaped structured fields", async () => {
    const { database } = buildDatabase();

    const result = await exportStudentEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_mary" },
      },
      database
    );

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.content).toContain(
      "Student,Mention handle,Class/group,School/local ID,Evidence date,Validated at,Evidence type,Topic,Support level,Context,Summary,Performance,Communication,Behavior,Tags,Follow-up needed,Follow-up notes"
    );
    expect(result.content).toContain(
      'Mary,\'@mary,Reading group,local-7,2026-06-17T14:00:00.000Z,2026-06-17T14:05:00.000Z,Academic check-in,reading,one prompt,small group,"Mary used a ""chunking"" strategy, then explained her answer.",worked through the passage,explained answer,used a strategy,reading; prompt,Yes,"Check comprehension,'
    );
    expect(result.content).toContain('then fade prompt."');
  });

  it("returns a header-only export for students without evidence", async () => {
    const { database } = buildDatabase({ evidenceRecords: [] });

    const result = await exportStudentEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_mary" },
      },
      database
    );

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.recordCount).toBe(0);
    expect(result.content.split("\r\n")).toHaveLength(1);
  });

  it("exports only non-archived evidence for the verified active student", async () => {
    const { database, evidenceCalls } = buildDatabase();

    await exportStudentEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_mary" },
      },
      database
    );

    expect(evidenceCalls).toHaveLength(1);
    expect(evidenceCalls[0]).toMatchObject({
      where: {
        workspaceId: "workspace_1",
        rosterStudentId: "student_mary",
        archivedAt: null,
      },
    });
  });

  it("does not include internal ids or raw draft fields in CSV output", async () => {
    const { database } = buildDatabase();

    const result = await exportStudentEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_mary" },
      },
      database
    );

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.content).not.toMatch(
      /evidence_1|student_mary|workspace_1|clerkUserId|teacherProfileId|rawNote|draftText|originalCapture|sourceText/i
    );
  });

  it("does not query evidence when the student is missing, archived, or unowned", async () => {
    const { database, evidenceCalls } = buildDatabase({ student: null });

    const result = await exportStudentEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_elsewhere" },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "This student is not available to export.",
    });
    expect(evidenceCalls).toEqual([]);
  });

  it("rejects blank student ids before querying", async () => {
    const { database, studentCalls, evidenceCalls } = buildDatabase();

    const result = await exportStudentEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: " " },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Choose a student before exporting evidence.",
    });
    expect(studentCalls).toEqual([]);
    expect(evidenceCalls).toEqual([]);
  });

  it("keeps the helper server-only and away from raw or ownership fields", () => {
    const source = readFileSync(
      join(process.cwd(), "lib", "evidence", "export-student-evidence.ts"),
      "utf8"
    );

    expect(source).toContain('import "server-only"');
    expect(source).not.toMatch(/rawNote|draftText|originalCapture|sourceText/i);
    expect(source).not.toMatch(/clerkUserId|teacherProfileId/i);
    expect(source).not.toMatch(/localStorage|getCapturesForStudent/);
  });
});

describe("escapeCsvCell", () => {
  it("escapes commas, quotes, and line breaks", () => {
    expect(escapeCsvCell("plain")).toBe("plain");
    expect(escapeCsvCell("one,two")).toBe('"one,two"');
    expect(escapeCsvCell('said "yes"')).toBe('"said ""yes"""');
    expect(escapeCsvCell("line\nbreak")).toBe('"line\nbreak"');
  });

  it("neutralizes spreadsheet formula prefixes", () => {
    expect(escapeCsvCell("=IMPORTXML(\"https://example.com\")")).toBe(
      "\"'=IMPORTXML(\"\"https://example.com\"\")\""
    );
    expect(escapeCsvCell("+SUM(1,2)")).toBe("\"'+SUM(1,2)\"");
    expect(escapeCsvCell("-10")).toBe("'-10");
    expect(escapeCsvCell("@lookup")).toBe("'@lookup");
    expect(escapeCsvCell("\t=SUM(1,2)")).toBe("\"'\t=SUM(1,2)\"");
    expect(escapeCsvCell("  =SUM(1,2)")).toBe("\"'  =SUM(1,2)\"");
  });
});
