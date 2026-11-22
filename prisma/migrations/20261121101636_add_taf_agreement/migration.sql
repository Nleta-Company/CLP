-- CreateEnum
CREATE TYPE "TafStatus" AS ENUM ('GENERATED', 'SENT', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "TafAgreement" (
    "id" TEXT NOT NULL,
    "tafNumber" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "documentUrl" TEXT,
    "status" "TafStatus" NOT NULL DEFAULT 'GENERATED',
    "generatedById" TEXT NOT NULL,
    "clientDecisionAt" TIMESTAMP(3),
    "clientRejectionReason" TEXT,
    "clientRespondedById" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TafAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TafAgreement_tafNumber_key" ON "TafAgreement"("tafNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TafAgreement_requestId_key" ON "TafAgreement"("requestId");

-- CreateIndex
CREATE INDEX "TafAgreement_status_idx" ON "TafAgreement"("status");

-- AddForeignKey
ALTER TABLE "TafAgreement" ADD CONSTRAINT "TafAgreement_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TafAgreement" ADD CONSTRAINT "TafAgreement_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
