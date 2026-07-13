-- Abort instead of silently reassigning records if legacy ownership drift exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "RosterStudent" AS student
    JOIN "ClassGroup" AS class_group ON class_group."id" = student."classGroupId"
    WHERE student."workspaceId" <> class_group."workspaceId"
  ) THEN
    RAISE EXCEPTION 'Cannot enforce roster/class workspace integrity: cross-workspace rows exist';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "EvidenceRecord" AS evidence
    JOIN "RosterStudent" AS student ON student."id" = evidence."rosterStudentId"
    WHERE evidence."workspaceId" <> student."workspaceId"
  ) THEN
    RAISE EXCEPTION 'Cannot enforce evidence/student workspace integrity: cross-workspace rows exist';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "EvidenceRecord" AS evidence
    JOIN "ClassGroup" AS class_group ON class_group."id" = evidence."classGroupId"
    WHERE evidence."workspaceId" <> class_group."workspaceId"
  ) THEN
    RAISE EXCEPTION 'Cannot enforce evidence/class workspace integrity: cross-workspace rows exist';
  END IF;
END $$;

DROP INDEX "ClassGroup_workspaceId_idx";
DROP INDEX "RosterStudent_workspaceId_idx";

CREATE UNIQUE INDEX "ClassGroup_workspaceId_id_key"
  ON "ClassGroup"("workspaceId", "id");
CREATE UNIQUE INDEX "RosterStudent_workspaceId_id_key"
  ON "RosterStudent"("workspaceId", "id");

ALTER TABLE "RosterStudent"
  DROP CONSTRAINT "RosterStudent_classGroupId_fkey",
  ADD CONSTRAINT "RosterStudent_workspaceId_classGroupId_fkey"
    FOREIGN KEY ("workspaceId", "classGroupId")
    REFERENCES "ClassGroup"("workspaceId", "id")
    ON DELETE SET NULL ("classGroupId")
    ON UPDATE CASCADE;

ALTER TABLE "EvidenceRecord"
  DROP CONSTRAINT "EvidenceRecord_rosterStudentId_fkey",
  DROP CONSTRAINT "EvidenceRecord_classGroupId_fkey",
  ADD CONSTRAINT "EvidenceRecord_workspaceId_rosterStudentId_fkey"
    FOREIGN KEY ("workspaceId", "rosterStudentId")
    REFERENCES "RosterStudent"("workspaceId", "id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  ADD CONSTRAINT "EvidenceRecord_workspaceId_classGroupId_fkey"
    FOREIGN KEY ("workspaceId", "classGroupId")
    REFERENCES "ClassGroup"("workspaceId", "id")
    ON DELETE SET NULL ("classGroupId")
    ON UPDATE CASCADE;
