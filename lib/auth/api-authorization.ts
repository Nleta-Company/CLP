
import "server-only";

import { NextResponse } from "next/server";
import { getSession, deleteSession, type UserRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function requireApiRole(allowedRoles: UserRole[]) {
  const session = await getSession();

  if (!session) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      ),
    };
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

  if (!user || !user.isActive || user.role !== session.role) {
    await deleteSession();

    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Your session is invalid or expired." },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "You are not authorised to access this resource." },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}
