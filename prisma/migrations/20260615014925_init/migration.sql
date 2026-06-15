-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Personal workspace',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassGroup" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ClassGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterStudent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "classGroupId" TEXT,
    "displayName" TEXT NOT NULL,
    "mentionHandle" TEXT NOT NULL,
    "schoolLocalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "RosterStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceRecord" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "rosterStudentId" TEXT NOT NULL,
    "classGroupId" TEXT,
    "evidenceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "topic" TEXT,
    "supportLevel" TEXT,
    "context" TEXT,
    "performance" TEXT,
    "communication" TEXT,
    "behavior" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "followUpNotes" TEXT,
    "validatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "EvidenceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_clerkUserId_key" ON "TeacherProfile"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_teacherProfileId_key" ON "Workspace"("teacherProfileId");

-- CreateIndex
CREATE INDEX "ClassGroup_workspaceId_idx" ON "ClassGroup"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassGroup_workspaceId_name_key" ON "ClassGroup"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "RosterStudent_workspaceId_idx" ON "RosterStudent"("workspaceId");

-- CreateIndex
CREATE INDEX "RosterStudent_classGroupId_idx" ON "RosterStudent"("classGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "RosterStudent_workspaceId_mentionHandle_key" ON "RosterStudent"("workspaceId", "mentionHandle");

-- CreateIndex
CREATE UNIQUE INDEX "RosterStudent_workspaceId_schoolLocalId_key" ON "RosterStudent"("workspaceId", "schoolLocalId");

-- CreateIndex
CREATE INDEX "EvidenceRecord_workspaceId_createdAt_idx" ON "EvidenceRecord"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "EvidenceRecord_workspaceId_rosterStudentId_idx" ON "EvidenceRecord"("workspaceId", "rosterStudentId");

-- CreateIndex
CREATE INDEX "EvidenceRecord_rosterStudentId_evidenceDate_idx" ON "EvidenceRecord"("rosterStudentId", "evidenceDate");

-- CreateIndex
CREATE INDEX "EvidenceRecord_classGroupId_idx" ON "EvidenceRecord"("classGroupId");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroup" ADD CONSTRAINT "ClassGroup_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterStudent" ADD CONSTRAINT "RosterStudent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterStudent" ADD CONSTRAINT "RosterStudent_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceRecord" ADD CONSTRAINT "EvidenceRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceRecord" ADD CONSTRAINT "EvidenceRecord_rosterStudentId_fkey" FOREIGN KEY ("rosterStudentId") REFERENCES "RosterStudent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceRecord" ADD CONSTRAINT "EvidenceRecord_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
