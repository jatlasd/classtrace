import "server-only";

import { prisma } from "@/lib/db/prisma";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

export type EvidencePhotoRead = {
  imageData: Uint8Array;
  contentType: string;
};

type EvidencePhotoFindFirstArgs = {
  where: {
    workspaceId: string;
    evidenceRecordId: string;
    evidenceRecord: { workspaceId: string };
  };
  select: { imageData: true; contentType: true };
};

export type EvidencePhotoReadDatabase = {
  evidencePhoto: {
    findFirst(args: EvidencePhotoFindFirstArgs): Promise<EvidencePhotoRead | null>;
  };
};

const evidencePhotoReadDatabase: EvidencePhotoReadDatabase = {
  evidencePhoto: {
    findFirst: (args) => prisma.evidencePhoto.findFirst(args),
  },
};

export async function getEvidencePhotoForWorkspace(
  workspaceId: string,
  evidenceId: string,
  database: EvidencePhotoReadDatabase = evidencePhotoReadDatabase
): Promise<EvidencePhotoRead | null> {
  const normalizedEvidenceId = evidenceId.trim();
  if (
    !normalizedEvidenceId ||
    normalizedEvidenceId.length > INPUT_LIMITS.identifier
  ) {
    return null;
  }

  return database.evidencePhoto.findFirst({
    where: {
      workspaceId,
      evidenceRecordId: normalizedEvidenceId,
      evidenceRecord: {
        workspaceId,
      },
    },
    select: {
      imageData: true,
      contentType: true,
    },
  });
}
