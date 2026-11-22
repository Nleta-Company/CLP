-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PtaStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "PtaStatus" ADD VALUE 'REJECTED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequestStatus" ADD VALUE 'PTA_ACCEPTED';
ALTER TYPE "RequestStatus" ADD VALUE 'PTA_REJECTED';

-- AlterTable
ALTER TABLE "PtaAgreement" ADD COLUMN     "clientDecisionAt" TIMESTAMP(3),
ADD COLUMN     "clientRejectionReason" TEXT,
ADD COLUMN     "clientRespondedById" TEXT;
