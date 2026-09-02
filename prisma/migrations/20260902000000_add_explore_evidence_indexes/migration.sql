DROP INDEX "EvidenceRecord_workspaceId_createdAt_idx";
DROP INDEX "EvidenceRecord_workspaceId_rosterStudentId_idx";
DROP INDEX "EvidenceRecord_rosterStudentId_evidenceDate_idx";
DROP INDEX "EvidenceRecord_classGroupId_idx";

CREATE INDEX "EvidenceRecord_workspace_evidence_sort_idx"
ON "EvidenceRecord" ("workspaceId", "evidenceDate" DESC, "createdAt" DESC);

CREATE INDEX "EvidenceRecord_workspace_student_sort_idx"
ON "EvidenceRecord" ("workspaceId", "rosterStudentId", "evidenceDate" DESC, "createdAt" DESC);

CREATE INDEX "EvidenceRecord_workspace_class_sort_idx"
ON "EvidenceRecord" ("workspaceId", "classGroupId", "evidenceDate" DESC, "createdAt" DESC);

CREATE INDEX "EvidenceRecord_tags_gin_idx"
ON "EvidenceRecord" USING GIN (tags);
