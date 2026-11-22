-- CreateEnum
CREATE TYPE "PaymentTerm" AS ENUM ('FULL', 'HALF_HALF', 'HALF_QUARTER_QUARTER');

-- CreateEnum
CREATE TYPE "PaymentMilestone" AS ENUM ('FTO_ACCEPTANCE', 'BEFORE_TRAINING', 'BEFORE_FINAL_BATCH');

-- CreateEnum
CREATE TYPE "PaymentInstallmentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentSubmissionStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "FinalTrainingOffer" ADD COLUMN     "paymentTerm" "PaymentTerm";

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "clientDecisionAt" TIMESTAMP(3),
ADD COLUMN     "clientRejectionReason" TEXT,
ADD COLUMN     "clientRespondedById" TEXT;

-- CreateTable
CREATE TABLE "PaymentInstallment" (
    "id" TEXT NOT NULL,
    "ftoId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "milestone" "PaymentMilestone" NOT NULL,
    "status" "PaymentInstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSubmission" (
    "id" TEXT NOT NULL,
    "installmentId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "transactionReference" TEXT,
    "proofUrl" TEXT NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL,
    "status" "PaymentSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "adminRemarks" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentInstallment_ftoId_status_idx" ON "PaymentInstallment"("ftoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInstallment_ftoId_installmentNumber_key" ON "PaymentInstallment"("ftoId", "installmentNumber");

-- CreateIndex
CREATE INDEX "PaymentSubmission_installmentId_status_idx" ON "PaymentSubmission"("installmentId", "status");

-- CreateIndex
CREATE INDEX "PaymentSubmission_submittedById_idx" ON "PaymentSubmission"("submittedById");

-- CreateIndex
CREATE INDEX "PaymentSubmission_reviewedById_idx" ON "PaymentSubmission"("reviewedById");

-- AddForeignKey
ALTER TABLE "PaymentInstallment" ADD CONSTRAINT "PaymentInstallment_ftoId_fkey" FOREIGN KEY ("ftoId") REFERENCES "FinalTrainingOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSubmission" ADD CONSTRAINT "PaymentSubmission_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "PaymentInstallment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSubmission" ADD CONSTRAINT "PaymentSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSubmission" ADD CONSTRAINT "PaymentSubmission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
