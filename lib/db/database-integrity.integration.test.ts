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

  it("cascades whole-account data while preserving standalone operator audit rows", async () => {
    const teacher = await database.teacherProfile.create({
      data: { clerkUserId: "integration_delete_target", displayName: "Teacher" },
    });
    const workspace = await database.workspace.create({
      data: { teacherProfileId: teacher.id },
    });
    const classGroup = await database.classGroup.create({
      data: {
        workspaceId: workspace.id,
        name: "Intervention",
        nameKey: "intervention",
      },
    });
    const student = await database.rosterStudent.create({
      data: {
        workspaceId: workspace.id,
        classGroupId: classGroup.id,
        displayName: "Jeff",
        mentionHandle: "jeff-delete-target",
      },
    });
    const evidence = await database.evidenceRecord.create({
      data: {
        workspaceId: workspace.id,
        rosterStudentId: student.id,
        classGroupId: classGroup.id,
        evidenceNote: "Teacher-reviewed evidence.",
        summary: "Jeff - intervention",
        evidenceType: "Academic check-in",
        validatedAt: new Date(),
      },
    });
    const acceptance = await database.betaAgreementAcceptance.create({
      data: {
        teacherProfileId: teacher.id,
        agreementVersion: "2026-07-27",
        termsVersion: "2026-07-14",
        privacyVersion: "2026-07-14",
        appRelease: "integration-release",
      },
    });
    const audit = await database.operatorActionAudit.create({
      data: {
        operatorClerkUserId: "integration_operator",
        targetClerkUserId: "integration_delete_target",
        action: "WORKSPACE_DATA_DELETE",
        outcome: "SUCCEEDED",
        classGroupCount: 1,
        rosterStudentCount: 1,
        evidenceRecordCount: 1,
        completedAt: new Date(),
      },
    });

    await database.teacherProfile.delete({ where: { id: teacher.id } });

    await expect(
      database.workspace.findUnique({ where: { id: workspace.id } })
    ).resolves.toBeNull();
    await expect(
      database.classGroup.findUnique({ where: { id: classGroup.id } })
    ).resolves.toBeNull();
    await expect(
      database.rosterStudent.findUnique({ where: { id: student.id } })
    ).resolves.toBeNull();
    await expect(
      database.evidenceRecord.findUnique({ where: { id: evidence.id } })
    ).resolves.toBeNull();
    await expect(
      database.betaAgreementAcceptance.findUnique({
        where: {
          teacherProfileId_agreementVersion: {
            teacherProfileId: acceptance.teacherProfileId,
            agreementVersion: acceptance.agreementVersion,
          },
        },
      })
    ).resolves.toBeNull();
    await expect(
      database.operatorActionAudit.findUnique({ where: { id: audit.id } })
    ).resolves.toMatchObject({
      targetClerkUserId: "integration_delete_target",
      classGroupCount: 1,
      rosterStudentCount: 1,
      evidenceRecordCount: 1,
    });
  });

  it("stores one beta acceptance per teacher and agreement version", async () => {
    const teacher = await database.teacherProfile.create({
      data: {
        clerkUserId: "integration_beta_versions",
        displayName: "Teacher",
      },
    });

    await database.betaAgreementAcceptance.createMany({
      data: [
        {
          teacherProfileId: teacher.id,
          agreementVersion: "2026-07-27",
          termsVersion: "2026-07-14",
          privacyVersion: "2026-07-14",
          appRelease: "release-1",
        },
        {
          teacherProfileId: teacher.id,
          agreementVersion: "2026-08-15",
          termsVersion: "2026-08-15",
          privacyVersion: "2026-07-14",
          appRelease: "release-2",
        },
      ],
    });

    await expect(
      database.betaAgreementAcceptance.count({
        where: { teacherProfileId: teacher.id },
      })
    ).resolves.toBe(2);

    await expect(
      database.betaAgreementAcceptance.create({
        data: {
          teacherProfileId: teacher.id,
          agreementVersion: "2026-07-27",
          termsVersion: "changed",
          privacyVersion: "changed",
          appRelease: "release-3",
        },
      })
    ).rejects.toMatchObject({ code: "P2002" });
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
