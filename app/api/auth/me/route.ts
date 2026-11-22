
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated." },
        { status: 401 }
      );
    }

    // Verify current database account and active status.
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

    if (
      !user ||
      !user.isActive ||
      user.role !== session.role
    ) {
      return NextResponse.json(
        { success: false, message: "Session is no longer valid." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Current user API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to verify session." },
      { status: 500 }
    );
  }
}
