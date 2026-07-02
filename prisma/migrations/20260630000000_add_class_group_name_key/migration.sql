ALTER TABLE "ClassGroup" ADD COLUMN "nameKey" TEXT;

UPDATE "ClassGroup"
SET "nameKey" = lower(regexp_replace(btrim("name"), '\s+', ' ', 'g'));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "ClassGroup"
    GROUP BY "workspaceId", "nameKey"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate normalized class names exist within a workspace.';
  END IF;
END $$;

ALTER TABLE "ClassGroup" ALTER COLUMN "nameKey" SET NOT NULL;

CREATE UNIQUE INDEX "ClassGroup_workspaceId_nameKey_key" ON "ClassGroup"("workspaceId", "nameKey");
