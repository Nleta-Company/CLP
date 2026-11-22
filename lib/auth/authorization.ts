
import "server-only";

import { redirect } from "next/navigation";
import { getSession, deleteSession, type UserRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const roleHome: Record<UserRole, string> = {
  ADMIN: "/admin",
  SUB_ADMIN: "/sub-admin/dashboard",
  CLIENT: "/client/services",
  BDE: "/bde/dashboard",
  TRAINER: "/trainer/dashboard",
};

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  // Invalidate sessions for deleted, disabled, or changed accounts.
  if (
    !user ||
    !user.isActive ||
    user.role !== session.role
  ) {
    await deleteSession();
    redirect("/login");
  }

  // Keep each role inside its authorised section.
  if (!allowedRoles.includes(user.role)) {
    redirect(roleHome[user.role]);
  }

  return user;
}

