-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUB_ADMIN', 'CLIENT', 'BDE', 'TRAINER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'TSO_DRAFT', 'TSO_SENT', 'TSO_ACCEPTED', 'TSO_REJECTED', 'PAYMENT_PENDING', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFICATION', 'PAYMENT_VERIFIED', 'PSGA_DRAFT', 'PSGA_SENT', 'PSGA_ACCEPTED', 'PSGA_REJECTED', 'TAF_DRAFT', 'TAF_SENT', 'TAF_ACCEPTED', 'TAF_REJECTED', 'TRAINER_ASSIGNMENT', 'TRAINING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('WCT', 'SCT', 'OET', 'LET', 'FMT', 'CSR', 'PDT', 'ADT', 'TTM');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('ON', 'HY', 'OF');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "gstin" TEXT,
    "address" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "designation" TEXT,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProgram" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "TrainingCategory" NOT NULL,
    "audience" TEXT NOT NULL,
    "mode" "DeliveryMode" NOT NULL,
    "duration" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    "preferredDate" TIMESTAMP(3),
    "alternateDate" TIMESTAMP(3),
    "trainingLocation" TEXT NOT NULL,
    "preferredLanguage" TEXT,
    "coordinator" TEXT,
    "facilities" TEXT,
    "assessment" TEXT,
    "refresher" TEXT,
    "additionalRequirements" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestProgram" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "trainingProgramId" TEXT NOT NULL,
    "participants" INTEGER NOT NULL,
    "expectedBatches" INTEGER NOT NULL,
    "preferredMode" "DeliveryMode" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestTimeline" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "actorId" TEXT,
    "status" "RequestStatus" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProgram_code_key" ON "TrainingProgram"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_requestNumber_key" ON "ServiceRequest"("requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RequestProgram_requestId_trainingProgramId_key" ON "RequestProgram"("requestId", "trainingProgramId");

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestProgram" ADD CONSTRAINT "RequestProgram_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestProgram" ADD CONSTRAINT "RequestProgram_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "TrainingProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestTimeline" ADD CONSTRAINT "RequestTimeline_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestTimeline" ADD CONSTRAINT "RequestTimeline_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
