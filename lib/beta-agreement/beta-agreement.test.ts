import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import {
  acceptCurrentBetaAgreement,
  hasAcceptedCurrentBetaAgreement,
  type BetaAgreementDatabase,
} from "@/lib/beta-agreement/beta-agreement";
import { BETA_AGREEMENT_STEP_IDS } from "@/lib/beta-agreement/beta-agreement-steps";

function buildDatabase() {
  const findUnique = vi.fn();
  const upsert = vi.fn();
  const database = {
    betaAgreementAcceptance: {
      findUnique,
      upsert,
    },
  } satisfies BetaAgreementDatabase;

  return { database, findUnique, upsert };
}

describe("beta agreement persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks only the current agreement version for the teacher", async () => {
    const { database, findUnique } = buildDatabase();
    findUnique.mockResolvedValue({ teacherProfileId: "teacher_1" });

    await expect(
      hasAcceptedCurrentBetaAgreement("teacher_1", database)
    ).resolves.toBe(true);

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        teacherProfileId_agreementVersion: {
          teacherProfileId: "teacher_1",
          agreementVersion: "2026-07-27",
        },
      },
      select: {
        teacherProfileId: true,
      },
    });
    expect(findUnique.mock.calls[0][0].where).not.toHaveProperty(
      "termsVersion"
    );
    expect(findUnique.mock.calls[0][0].where).not.toHaveProperty(
      "privacyVersion"
    );
    expect(findUnique.mock.calls[0][0].where).not.toHaveProperty("appRelease");
  });

  it("requires a new row when the current agreement version is absent", async () => {
    const { database, findUnique } = buildDatabase();
    findUnique.mockResolvedValue(null);

    await expect(
      hasAcceptedCurrentBetaAgreement("teacher_1", database)
    ).resolves.toBe(false);
  });

  it.each([
    undefined,
    [],
    BETA_AGREEMENT_STEP_IDS.slice(0, 5),
    [...BETA_AGREEMENT_STEP_IDS.slice(0, 5), "unknown-step"],
    [
      ...BETA_AGREEMENT_STEP_IDS.slice(0, 5),
      BETA_AGREEMENT_STEP_IDS[0],
    ],
  ])("rejects an incomplete or malformed acknowledgement set", async (steps) => {
    const { database, upsert } = buildDatabase();

    await expect(
      acceptCurrentBetaAgreement(
        {
          teacherProfileId: "teacher_1",
          acknowledgedStepIds: steps,
          acceptedAt: new Date("2026-07-27T12:00:00.000Z"),
          appRelease: "release_1",
        },
        database
      )
    ).resolves.toEqual({
      success: false,
      error: "Check each acknowledgement before entering ClassTrace.",
    });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("creates the immutable current-version acceptance from server values", async () => {
    const { database, upsert } = buildDatabase();
    const acceptedAt = new Date("2026-07-27T12:00:00.000Z");
    upsert.mockResolvedValue({ acceptedAt });

    await expect(
      acceptCurrentBetaAgreement(
        {
          teacherProfileId: "teacher_1",
          acknowledgedStepIds: [...BETA_AGREEMENT_STEP_IDS],
          acceptedAt,
          appRelease: "release_1",
        },
        database
      )
    ).resolves.toEqual({ success: true, acceptedAt });

    expect(upsert).toHaveBeenCalledWith({
      where: {
        teacherProfileId_agreementVersion: {
          teacherProfileId: "teacher_1",
          agreementVersion: "2026-07-27",
        },
      },
      update: {},
      create: {
        teacherProfileId: "teacher_1",
        agreementVersion: "2026-07-27",
        termsVersion: "2026-07-14",
        privacyVersion: "2026-07-14",
        acceptedAt,
        appRelease: "release_1",
      },
      select: {
        acceptedAt: true,
      },
    });
  });
});
