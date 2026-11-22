import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();
const REQUEST_ID = "cmwkcdv7b0006um786wj5y04j";

async function main() {
  const fto = await prisma.finalTrainingOffer.findUnique({
    where: { requestId: REQUEST_ID },
    include: { paymentInstallments: true },
  });

  if (!fto) {
    throw new Error("FTO not found for this request.");
  }

  if (fto.paymentInstallments.length > 0) {
    console.log(
      `Stopped: ${fto.paymentInstallments.length} installment(s) already exist.`
    );
    return;
  }

  if (!fto.paymentTerm) {
    throw new Error("FTO payment term is missing. No data changed.");
  }

  const grandTotalCents = Math.round(
    Number(fto.grandTotal.toString()) * 100
  );

  const definitions = {
    FULL: [
      { percentage: 100, milestone: "FTO_ACCEPTANCE" },
    ],
    HALF_HALF: [
      { percentage: 50, milestone: "FTO_ACCEPTANCE" },
      { percentage: 50, milestone: "BEFORE_FINAL_BATCH" },
    ],
    HALF_QUARTER_QUARTER: [
      { percentage: 50, milestone: "FTO_ACCEPTANCE" },
      { percentage: 25, milestone: "BEFORE_TRAINING" },
      { percentage: 25, milestone: "BEFORE_FINAL_BATCH" },
    ],
  } as const;

  const selected = definitions[fto.paymentTerm];
  let allocatedCents = 0;

  const installments = selected.map((item, index) => {
    const amountCents =
      index === selected.length - 1
        ? grandTotalCents - allocatedCents
        : Math.round(
            (grandTotalCents * item.percentage) / 100
          );

    allocatedCents += amountCents;

    return {
      ftoId: fto.id,
      installmentNumber: index + 1,
      percentage: item.percentage.toFixed(2),
      amount: (amountCents / 100).toFixed(2),
      milestone: item.milestone,
      status: "PENDING" as const,
    };
  });

  await prisma.$transaction(async (tx) => {
    const latestFto = await tx.finalTrainingOffer.findUnique({
      where: { id: fto.id },
      include: { paymentInstallments: true },
    });

    if (!latestFto || latestFto.paymentInstallments.length > 0) {
      throw new Error("FTO changed. Stopping to prevent duplicates.");
    }

    await tx.paymentInstallment.createMany({
      data: installments,
    });
  });

  console.log("Payment installments created successfully:");
  installments.forEach((item) => {
    console.log(
      `Installment ${item.installmentNumber}: ₹${item.amount} - ${item.milestone}`
    );
  });
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
