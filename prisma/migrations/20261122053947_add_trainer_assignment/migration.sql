-- CreateEnum
CREATE TYPE "TrainerAssignmentMode" AS ENUM ('SINGLE', 'MULTIPLE');

-- CreateEnum
CREATE TYPE "TrainerAssignmentStatus" AS ENUM ('ASSIGNED', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "trainerAssignmentMode" "TrainerAssignmentMode";

-- CreateTable
CREATE TABLE "TrainerAssignment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "requestProgramId" TEXT,
    "trainerId" TEXT NOT NULL,
    "batchNumber" INTEGER,
    "status" "TrainerAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainerAssignment_requestId_idx" ON "TrainerAssignment"("requestId");

-- CreateIndex
CREATE INDEX "TrainerAssignment_trainerId_idx" ON "TrainerAssignment"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerAssignment_requestProgramId_idx" ON "TrainerAssignment"("requestProgramId");

-- CreateIndex
CREATE INDEX "TrainerAssignment_assignedById_idx" ON "TrainerAssignment"("assignedById");

-- CreateIndex
CREATE INDEX "TrainerAssignment_requestId_status_idx" ON "TrainerAssignment"("requestId", "status");

-- AddForeignKey
ALTER TABLE "TrainerAssignment" ADD CONSTRAINT "TrainerAssignment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerAssignment" ADD CONSTRAINT "TrainerAssignment_requestProgramId_fkey" FOREIGN KEY ("requestProgramId") REFERENCES "RequestProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerAssignment" ADD CONSTRAINT "TrainerAssignment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerAssignment" ADD CONSTRAINT "TrainerAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
