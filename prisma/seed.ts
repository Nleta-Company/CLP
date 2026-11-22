import "dotenv/config";

import { PrismaClient } from "../lib/generated/prisma/client";
import { trainingPrograms } from "../lib/data/training-programs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting training programme seeding...");

  console.log(`Total programmes in catalogue: ${trainingPrograms.length}`);

  for (const program of trainingPrograms) {
    await prisma.trainingProgram.upsert({
      where: {
        code: program.code,
      },
      update: {
        title: program.title,
        category: program.category,
        audience: program.audience,
        mode: program.mode,
        duration: program.duration,
        isActive: true,
      },
      create: {
        code: program.code,
        title: program.title,
        category: program.category,
        audience: program.audience,
        mode: program.mode,
        duration: program.duration,
        isActive: true,
      },
    });
  }

  const total = await prisma.trainingProgram.count();

  console.log("Training programme seeding completed!");
  console.log(`Programmes in source file: ${trainingPrograms.length}`);
  console.log(`Total programmes in database: ${total}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
