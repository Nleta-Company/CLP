
import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    const organisation = String(body.organisation ?? "").trim();
    const gstin = String(body.gstin ?? "").trim();
    const address = String(body.address ?? "").trim();
    const country = String(body.country ?? "India").trim();
    const state = String(body.state ?? "").trim();
    const city = String(body.city ?? "").trim();
    const contactName = String(body.contactName ?? "").trim();
    const designation = String(body.designation ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (
      !name ||
      !email ||
      !password ||
      !organisation ||
      !address ||
      !country ||
      !state ||
      !city ||
      !contactName ||
      !phone
    ) {
      return NextResponse.json(
        { success: false, message: "Please fill all required fields." },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 12 || password.length > 72) {
      return NextResponse.json(
        { success: false, message: "Password must be between 12 and 72 characters." },
        { status: 400 }
      );
    }

    if (phone.length < 7 || phone.length > 20) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CLIENT",
        isActive: true,
        clientProfile: {
          create: {
            organisation,
            gstin: gstin || null,
            address,
            country,
            state,
            city,
            contactName,
            designation: designation || null,
            phone,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await createSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Client registration error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create account. Please try again." },
      { status: 500 }
    );
  }
}
