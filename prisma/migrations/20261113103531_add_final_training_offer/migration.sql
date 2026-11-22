-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequestStatus" ADD VALUE 'FTO_DRAFT';
ALTER TYPE "RequestStatus" ADD VALUE 'FTO_SENT';
ALTER TYPE "RequestStatus" ADD VALUE 'FTO_ACCEPTED';
ALTER TYPE "RequestStatus" ADD VALUE 'FTO_REJECTED';

-- CreateTable
CREATE TABLE "FinalTrainingOffer" (
    "id" TEXT NOT NULL,
    "ftoNumber" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "logisticsCharges" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "otherCharges" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gstPercent" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "gstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "jurisdiction" TEXT,
    "terms" TEXT,
    "specialRemarks" TEXT,
    "documentUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalTrainingOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FTOProgram" (
    "id" TEXT NOT NULL,
    "ftoId" TEXT NOT NULL,
    "programCode" TEXT NOT NULL,
    "programTitle" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "deliveryMode" "DeliveryMode" NOT NULL,
    "participants" INTEGER NOT NULL,
    "batches" INTEGER NOT NULL,
    "pricePerBatch" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FTOProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinalTrainingOffer_ftoNumber_key" ON "FinalTrainingOffer"("ftoNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FinalTrainingOffer_requestId_key" ON "FinalTrainingOffer"("requestId");

-- CreateIndex
CREATE INDEX "FTOProgram_ftoId_idx" ON "FTOProgram"("ftoId");

-- AddForeignKey
ALTER TABLE "FinalTrainingOffer" ADD CONSTRAINT "FinalTrainingOffer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalTrainingOffer" ADD CONSTRAINT "FinalTrainingOffer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FTOProgram" ADD CONSTRAINT "FTOProgram_ftoId_fkey" FOREIGN KEY ("ftoId") REFERENCES "FinalTrainingOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
