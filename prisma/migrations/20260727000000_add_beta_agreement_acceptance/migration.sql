CREATE TABLE "BetaAgreementAcceptance" (
    "teacherProfileId" TEXT NOT NULL,
    "agreementVersion" TEXT NOT NULL,
    "termsVersion" TEXT NOT NULL,
    "privacyVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appRelease" TEXT NOT NULL,

    CONSTRAINT "BetaAgreementAcceptance_pkey"
    PRIMARY KEY ("teacherProfileId", "agreementVersion")
);

ALTER TABLE "BetaAgreementAcceptance"
ADD CONSTRAINT "BetaAgreementAcceptance_teacherProfileId_fkey"
FOREIGN KEY ("teacherProfileId")
REFERENCES "TeacherProfile"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
