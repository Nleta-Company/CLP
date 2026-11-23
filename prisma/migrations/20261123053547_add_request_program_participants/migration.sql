-- CreateTable
CREATE TABLE "RequestProgramParticipant" (
    "id" TEXT NOT NULL,
    "requestProgramId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "designation" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestProgramParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestProgramParticipant_requestProgramId_idx" ON "RequestProgramParticipant"("requestProgramId");

-- CreateIndex
CREATE INDEX "RequestProgramParticipant_email_idx" ON "RequestProgramParticipant"("email");

-- AddForeignKey
ALTER TABLE "RequestProgramParticipant" ADD CONSTRAINT "RequestProgramParticipant_requestProgramId_fkey" FOREIGN KEY ("requestProgramId") REFERENCES "RequestProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
