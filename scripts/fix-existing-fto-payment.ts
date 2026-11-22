
import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

const REQUEST_ID = "cmwkcdv7b0006um786wj5y04j";

async function main() {
  await prisma.$transaction(async (tx) => {
    const fto = await tx.finalTrainingOffer.findUnique({
      where: { requestId: REQUEST_ID },
      include: { paymentInstallments: true },
    });

    if (!fto) {
      throw new Error("FTO not found.");
    }

    if (fto.paymentInstallments.length > 0) {
      throw new Error(
        "Installments already exist. Stopping to prevent duplicates."
      );
    }

    if (fto.paymentTerm && fto.paymentTerm !== "HALF_HALF") {
      throw new Error(
        `Unexpected payment term: ${fto.paymentTerm}. No changes made.`
      );
    }

    const totalCents = Math.round(
      Number(fto.grandTotal.toString()) * 100
    );

    const firstAmount = Math.round(totalCents / 2);
    const secondAmount = totalCents - firstAmount;

    await tx.finalTrainingOffer.update({
      where: { id: fto.id },
      data: {
        paymentTerm: "HALF_HALF",
        paymentInstallments: {
          create: [
            {
              installmentNumber: 1,
              percentage: "50.00",
              amount: (firstAmount / 100).toFixed(2),
              milestone: "FTO_ACCEPTANCE",
              status: "PENDING",
            },
            {
              installmentNumber: 2,
              percentage: "50.00",
              amount: (secondAmount / 100).toFixed(2),
              milestone: "BEFORE_FINAL_BATCH",
              status: "PENDING",
            },
          ],
        },
      },
    });
  });

  console.log("FTO payment schedule fixed successfully.");
  console.log("Payment Term: HALF_HALF");
  console.log("Installment 1: ₹48,380.00");
  console.log("Installment 2: ₹48,380.00");
  console.log("Total: ₹96,760.00");
}

main()
  .catch((error) => {
    console.error("FTO payment fix failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
