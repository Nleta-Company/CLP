
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        clientProfile: {
          select: {
            organisation: true,
            gstin: true,
            address: true,
            country: true,
            state: true,
            city: true,
            contactName: true,
            designation: true,
            phone: true,
          },
        },
      },
    });

    if (!user || user.role !== "CLIENT" || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "Client profile not found." },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profile: {
          organisation: user.clientProfile?.organisation ?? "",
          gstin: user.clientProfile?.gstin ?? "",
          address: user.clientProfile?.address ?? "",
          country: user.clientProfile?.country ?? "India",
          state: user.clientProfile?.state ?? "",
          city: user.clientProfile?.city ?? "",
          contactName:
            user.clientProfile?.contactName || user.name || "",
          designation: user.clientProfile?.designation ?? "",
          email: user.email,
          phone: user.clientProfile?.phone ?? "",
          name: user.name,
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Client profile fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load client profile.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
