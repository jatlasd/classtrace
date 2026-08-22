ALTER TABLE "EvidenceRecord"
  ALTER COLUMN "summary" DROP NOT NULL,
  ALTER COLUMN "evidenceType" DROP NOT NULL;

CREATE UNIQUE INDEX "EvidenceRecord_workspaceId_id_key"
  ON "EvidenceRecord"("workspaceId", "id");

CREATE TABLE "EvidencePhoto" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "evidenceRecordId" TEXT NOT NULL,
  "imageData" BYTEA NOT NULL,
  "contentType" TEXT NOT NULL,
  "byteSize" INTEGER NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EvidencePhoto_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EvidencePhoto_evidenceRecordId_key"
  ON "EvidencePhoto"("evidenceRecordId");

CREATE UNIQUE INDEX "EvidencePhoto_workspaceId_evidenceRecordId_key"
  ON "EvidencePhoto"("workspaceId", "evidenceRecordId");

CREATE INDEX "EvidencePhoto_workspaceId_idx"
  ON "EvidencePhoto"("workspaceId");

ALTER TABLE "EvidencePhoto"
  ADD CONSTRAINT "EvidencePhoto_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EvidencePhoto"
  ADD CONSTRAINT "EvidencePhoto_workspaceId_evidenceRecordId_fkey"
  FOREIGN KEY ("workspaceId", "evidenceRecordId")
  REFERENCES "EvidenceRecord"("workspaceId", "id")
  ON DELETE CASCADE ON UPDATE CASCADE;
