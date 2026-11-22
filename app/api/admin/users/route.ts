
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/api-authorization"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth/password"

const allowedRoles = ["SUB_ADMIN", "BDE", "TRAINER", "CLIENT"] as const

export async function GET() {
  try {
    const auth = await requireApiRole(["ADMIN"])
    if (auth.response) return auth.response

    const users = await prisma.user.findMany({
      where: {
        role: { in: [...allowedRoles] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        ...user,
        status: user.isActive ? "ACTIVE" : "INACTIVE",
      })),
    })
  } catch (error) {
    console.error("Fetch users error:", error)
    return NextResponse.json(
      { success: false, message: "Unable to fetch users." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiRole(["ADMIN"])
    if (auth.response) return auth.response

    const body = await request.json()

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : ""
    const password = typeof body.password === "string" ? body.password : ""
    const role = body.role

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid name." },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email." },
        { status: 400 }
      )
    }

    if (password.length < 12 || password.length > 72) {
      return NextResponse.json(
        { success: false, message: "Password must be between 12 and 72 characters." },
        { status: 400 }
      )
    }

    if (typeof role !== "string" || !allowedRoles.includes(role as typeof allowedRoles[number])) {
      return NextResponse.json(
        { success: false, message: "Invalid user role." },
        { status: 400 }
      )
    }

    // Client profile validation
    const profile = {
      organisation: typeof body.organisation === "string" ? body.organisation.trim() : "",
      gstin: typeof body.gstin === "string" ? body.gstin.trim() : "",
      address: typeof body.address === "string" ? body.address.trim() : "",
      country: typeof body.country === "string" ? body.country.trim() : "India",
      state: typeof body.state === "string" ? body.state.trim() : "",
      city: typeof body.city === "string" ? body.city.trim() : "",
      contactName: typeof body.contactName === "string" ? body.contactName.trim() : "",
      designation: typeof body.designation === "string" ? body.designation.trim() : "",
      phone: typeof body.phone === "string" ? body.phone.trim() : "",
    }

    if (role === "CLIENT") {
      if (
        !profile.organisation ||
        !profile.address ||
        !profile.state ||
        !profile.city ||
        !profile.contactName ||
        !profile.phone
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Please complete all required client organisation and contact details.",
          },
          { status: 400 }
        )
      }

      if (profile.phone.length < 7 || profile.phone.length > 20) {
        return NextResponse.json(
          { success: false, message: "Please enter a valid phone number." },
          { status: 400 }
        )
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists." },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: role as typeof allowedRoles[number],
          isActive: true,
          ...(role === "CLIENT"
            ? {
                clientProfile: {
                  create: {
                    organisation: profile.organisation,
                    gstin: profile.gstin || null,
                    address: profile.address,
                    country: profile.country || "India",
                    state: profile.state,
                    city: profile.city,
                    contactName: profile.contactName,
                    designation: profile.designation || null,
                    phone: profile.phone,
                  },
                },
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
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
      })
    })

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully.",
        user: {
          ...user,
          status: user.isActive ? "ACTIVE" : "INACTIVE",
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create user error:", error)

    return NextResponse.json(
      { success: false, message: "Unable to create user." },
      { status: 500 }
    )
  }
}
