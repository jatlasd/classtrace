import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { archiveClassGroupForWorkspace } from "@/lib/classes/class-groups";
import { createRosterStudentForWorkspace } from "@/lib/students/roster-students";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required for database integration tests.");
}

const database = new PrismaClient({ adapter: new PrismaPg(testDatabaseUrl) });

type Fixture = Awaited<ReturnType<typeof createFixture>>;
let fixture: Fixture;

async function createFixture() {
  const teacherA = await database.teacherProfile.create({
    data: { clerkUserId: "integration_teacher_a", displayName: "Teacher A" },
  });
  const teacherB = await database.teacherProfile.create({
    data: { clerkUserId: "integration_teacher_b", displayName: "Teacher B" },
  });
  const workspaceA = await database.workspace.create({
    data: { teacherProfileId: teacherA.id },
  });
  const workspaceB = await database.workspace.create({
    data: { teacherProfileId: teacherB.id },
  });
  const classA = await database.classGroup.create({
    data: { workspaceId: workspaceA.id, name: "Reading", nameKey: "reading" },
  });
  const classB = await database.classGroup.create({
    data: { workspaceId: workspaceB.id, name: "Math", nameKey: "math" },
  });
  const studentA = await database.rosterStudent.create({
    data: {
      workspaceId: workspaceA.id,
      classGroupId: classA.id,
      displayName: "Mary",
      mentionHandle: "mary",
    },
  });

  return { workspaceA, workspaceB, classA, classB, studentA };
}

beforeAll(async () => {
  fixture = await createFixture();
});

afterAll(async () => {
  await database.$disconnect();
});

describe("database ownership constraints", () => {
  it("rejects cross-workspace roster and evidence relationships", async () => {
    await expect(
      database.rosterStudent.create({
        data: {
          workspaceId: fixture.workspaceA.id,
          classGroupId: fixture.classB.id,
          displayName: "Jeremy",
          mentionHandle: "jeremy",
        },
      })
    ).rejects.toMatchObject({ code: "P2003" });

    await expect(
      database.evidenceRecord.create({
        data: {
          workspaceId: fixture.workspaceB.id,
          rosterStudentId: fixture.studentA.id,
          classGroupId: fixture.classB.id,
          evidenceNote: "Teacher-reviewed evidence.",
          summary: "Mary - reading",
          evidenceType: "Academic check-in",
          validatedAt: new Date(),
        },
      })
    ).rejects.toMatchObject({ code: "P2003" });

    await expect(
      database.evidenceRecord.create({
        data: {
          workspaceId: fixture.workspaceA.id,
          rosterStudentId: fixture.studentA.id,
          classGroupId: fixture.classB.id,
          evidenceNote: "Teacher-reviewed evidence.",
          summary: "Mary - reading",
          evidenceType: "Academic check-in",
          validatedAt: new Date(),
        },
      })
    ).rejects.toMatchObject({ code: "P2003" });
  });

  it("preserves cascade and class nulling behavior", async () => {
    const classForDelete = await database.classGroup.create({
      data: {
        workspaceId: fixture.workspaceA.id,
        name: "Writing",
        nameKey: "writing",
      },
    });
    const studentForDelete = await database.rosterStudent.create({
      data: {
        workspaceId: fixture.workspaceA.id,
        classGroupId: classForDelete.id,
        displayName: "Stacy",
        mentionHandle: "stacy",
      },
    });
    const evidence = await database.evidenceRecord.create({
      data: {
        workspaceId: fixture.workspaceA.id,
        rosterStudentId: studentForDelete.id,
        classGroupId: classForDelete.id,
        evidenceNote: "Teacher-reviewed evidence.",
        summary: "Stacy - writing",
        evidenceType: "Academic check-in",
        validatedAt: new Date(),
      },
    });

    await database.classGroup.delete({ where: { id: classForDelete.id } });
    expect(
      await database.rosterStudent.findUnique({
        where: { id: studentForDelete.id },
        select: { workspaceId: true, classGroupId: true },
      })
    ).toEqual({ workspaceId: fixture.workspaceA.id, classGroupId: null });
    expect(
      await database.evidenceRecord.findUnique({
        where: { id: evidence.id },
        select: { workspaceId: true, classGroupId: true },
      })
    ).toEqual({ workspaceId: fixture.workspaceA.id, classGroupId: null });

    await database.rosterStudent.delete({ where: { id: studentForDelete.id } });
    expect(
      await database.evidenceRecord.findUnique({ where: { id: evidence.id } })
    ).toBeNull();
  });

  it("does not commit an active student into an archived class", async () => {
    const classGroup = await database.classGroup.create({
      data: {
        workspaceId: fixture.workspaceA.id,
        name: "Science",
        nameKey: "science",
      },
    });

    await Promise.all([
      createRosterStudentForWorkspace({
        workspaceId: fixture.workspaceA.id,
        displayName: "Jeff",
        mentionHandle: "jeff",
        classGroupId: classGroup.id,
      }),
      archiveClassGroupForWorkspace({
        workspaceId: fixture.workspaceA.id,
        classGroupId: classGroup.id,
      }),
    ]);

    const [storedClass, activeStudents] = await Promise.all([
      database.classGroup.findUnique({ where: { id: classGroup.id } }),
      database.rosterStudent.count({
        where: { classGroupId: classGroup.id, archivedAt: null },
      }),
    ]);

    expect(storedClass?.archivedAt !== null && activeStudents > 0).toBe(false);
  });
});
