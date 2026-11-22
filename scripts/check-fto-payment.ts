import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const fto = await prisma.finalTrainingOffer.findUnique({
    where: {
      requestId: "cmwkcdv7b0006um786wj5y04j",
    },
    select: {
      id: true,
      ftoNumber: true,
      paymentTerm: true,
      grandTotal: true,
      paymentInstallments: {
        select: {
          id: true,
          installmentNumber: true,
          percentage: true,
          amount: true,
          status: true,
        },
      },
    },
  });

  console.log(JSON.stringify(fto, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());