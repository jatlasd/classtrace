import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import {
  listStudentEvidenceActivityForWorkspace,
  type StudentEvidenceActivityDatabase,
} from "@/lib/students/student-evidence-activity";

describe("listStudentEvidenceActivityForWorkspace", () => {
  it("groups only active evidence for active students in one workspace", async () => {
    const groupEvidenceByStudent = vi.fn<
      StudentEvidenceActivityDatabase["groupEvidenceByStudent"]
    >(async () => [
      {
        rosterStudentId: "student_mary",
        _count: { _all: 4 },
        _max: { evidenceDate: new Date("2026-09-15T14:00:00.000Z") },
      },
      {
        rosterStudentId: "student_jeff",
        _count: { _all: 0 },
        _max: { evidenceDate: null },
      },
    ]);

    const activity = await listStudentEvidenceActivityForWorkspace(
      "workspace_1",
      { groupEvidenceByStudent }
    );

    expect(groupEvidenceByStudent).toHaveBeenCalledWith({
      by: ["rosterStudentId"],
      where: {
        workspaceId: "workspace_1",
        archivedAt: null,
        rosterStudent: { workspaceId: "workspace_1", archivedAt: null },
      },
      _count: { _all: true },
      _max: { evidenceDate: true },
    });
    expect(activity.get("student_mary")).toEqual({
      evidenceCount: 4,
      lastEvidenceDate: "2026-09-15T14:00:00.000Z",
    });
    expect(activity.get("student_jeff")).toEqual({ evidenceCount: 0 });
    expect(activity.has("student_elsewhere")).toBe(false);
  });
});
