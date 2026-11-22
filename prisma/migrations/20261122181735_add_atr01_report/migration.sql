-- CreateEnum
CREATE TYPE "AtrReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'RETURNED_FOR_CORRECTION', 'APPROVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AtrFinalResultStatus" AS ENUM ('APPROVED', 'PENDING_EVIDENCE_CRITERIA', 'RETURNED_FOR_CORRECTION');

-- CreateTable
CREATE TABLE "AtrReport" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "revision" TEXT NOT NULL DEFAULT 'Rev.2',
    "trainerAssignmentId" TEXT NOT NULL,
    "batchId" TEXT,
    "requestProgramId" TEXT,
    "createdById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "status" "AtrReportStatus" NOT NULL DEFAULT 'DRAFT',
    "finalResultStatus" "AtrFinalResultStatus",
    "clientLegalEntity" TEXT,
    "clientContactDepartment" TEXT,
    "ptaReference" TEXT,
    "ptaDate" TIMESTAMP(3),
    "ftfReference" TEXT,
    "ftfRevision" TEXT,
    "ftfAcceptanceDate" TIMESTAMP(3),
    "tafReference" TEXT,
    "tafActivationDate" TIMESTAMP(3),
    "tspReference" TEXT,
    "programmeSpecification" TEXT,
    "programmeRevision" TEXT,
    "deliveryMode" "DeliveryMode",
    "trainingStartDate" TIMESTAMP(3),
    "trainingEndDate" TIMESTAMP(3),
    "actualDuration" TEXT,
    "venueOrPlatform" TEXT,
    "trainerName" TEXT,
    "trainerRole" TEXT,
    "trainerQualificationRef" TEXT,
    "registeredParticipants" INTEGER,
    "trainingDelivery" JSONB,
    "deliveryDeviations" JSONB,
    "tarReference" TEXT,
    "participantsAttended" INTEGER,
    "participantsMeetingRequirement" INTEGER,
    "attendanceNotes" TEXT,
    "attendanceRequirementSource" TEXT,
    "assessmentCriteria" JSONB,
    "participantResults" JSONB,
    "cohortSummary" JSONB,
    "trainerObservations" JSONB,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "approvalEvidence" TEXT,
    "preparedByName" TEXT,
    "preparedByRole" TEXT,
    "linkedDeliverables" JSONB,
    "clientHandoverRef" TEXT,
    "clientHandoverDate" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "documentUrl" TEXT,
    "correctionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AtrReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AtrReport_reportNumber_key" ON "AtrReport"("reportNumber");

-- CreateIndex
CREATE INDEX "AtrReport_trainerAssignmentId_status_idx" ON "AtrReport"("trainerAssignmentId", "status");

-- CreateIndex
CREATE INDEX "AtrReport_batchId_idx" ON "AtrReport"("batchId");

-- CreateIndex
CREATE INDEX "AtrReport_requestProgramId_idx" ON "AtrReport"("requestProgramId");

-- CreateIndex
CREATE INDEX "AtrReport_createdById_idx" ON "AtrReport"("createdById");

-- CreateIndex
CREATE INDEX "AtrReport_reviewedById_idx" ON "AtrReport"("reviewedById");

-- CreateIndex
CREATE INDEX "AtrReport_reportNumber_idx" ON "AtrReport"("reportNumber");

-- AddForeignKey
ALTER TABLE "AtrReport" ADD CONSTRAINT "AtrReport_trainerAssignmentId_fkey" FOREIGN KEY ("trainerAssignmentId") REFERENCES "TrainerAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtrReport" ADD CONSTRAINT "AtrReport_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtrReport" ADD CONSTRAINT "AtrReport_requestProgramId_fkey" FOREIGN KEY ("requestProgramId") REFERENCES "RequestProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtrReport" ADD CONSTRAINT "AtrReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtrReport" ADD CONSTRAINT "AtrReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
