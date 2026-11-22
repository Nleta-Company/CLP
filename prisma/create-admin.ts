
import "dotenv/config";

import { PrismaClient } from "../lib/generated/prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.CLP_ADMIN_NAME?.trim();
  const email = process.env.CLP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.CLP_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Set CLP_ADMIN_NAME, CLP_ADMIN_EMAIL and CLP_ADMIN_PASSWORD first."
    );
  }

  if (password.length < 12) {
    throw new Error("Admin password must be at least 12 characters.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error(
      "This email already exists. No account was changed."
    );
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("First Admin created successfully!");
  console.log(admin);
}

main()
  .catch((error) => {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
