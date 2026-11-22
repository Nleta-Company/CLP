-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "requestProgramId" TEXT NOT NULL,
    "trainerAssignmentId" TEXT,
    "batchNumber" INTEGER NOT NULL,
    "participants" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "mode" "DeliveryMode" NOT NULL,
    "location" TEXT,
    "status" "BatchStatus" NOT NULL DEFAULT 'PLANNED',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Batch_trainerAssignmentId_idx" ON "Batch"("trainerAssignmentId");

-- CreateIndex
CREATE INDEX "Batch_status_idx" ON "Batch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_requestProgramId_batchNumber_key" ON "Batch"("requestProgramId", "batchNumber");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_requestProgramId_fkey" FOREIGN KEY ("requestProgramId") REFERENCES "RequestProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_trainerAssignmentId_fkey" FOREIGN KEY ("trainerAssignmentId") REFERENCES "TrainerAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
