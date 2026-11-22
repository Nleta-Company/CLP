-- CreateEnum
CREATE TYPE "PtaStatus" AS ENUM ('GENERATED', 'SENT');

-- CreateTable
CREATE TABLE "PtaAgreement" (
    "id" TEXT NOT NULL,
    "ptaNumber" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "documentUrl" TEXT,
    "status" "PtaStatus" NOT NULL DEFAULT 'GENERATED',
    "generatedById" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PtaAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PtaAgreement_ptaNumber_key" ON "PtaAgreement"("ptaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PtaAgreement_requestId_key" ON "PtaAgreement"("requestId");

-- CreateIndex
CREATE INDEX "PtaAgreement_status_idx" ON "PtaAgreement"("status");

-- AddForeignKey
ALTER TABLE "PtaAgreement" ADD CONSTRAINT "PtaAgreement_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PtaAgreement" ADD CONSTRAINT "PtaAgreement_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
