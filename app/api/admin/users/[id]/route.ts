
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/api-authorization"
import { prisma } from "@/lib/prisma"

const allowedRoles = ["SUB_ADMIN", "BDE", "TRAINER"] as const

type AllowedRole = (typeof allowedRoles)[number]

interface RouteContext {
    params: Promise<{ id: string }>
}


export async function PATCH(
    request: Request,
    { params }: RouteContext
) {
    try {
        const auth = await requireApiRole(["ADMIN"])

        if (auth.response) {
            return auth.response
        }

        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { success: false, message: "User ID is required." },
                { status: 400 }
            )
        }

        const body = await request.json()

        const existingUser = await prisma.user.findFirst({
            where: {
                id,
                role: {
                    in: [...allowedRoles],
                },
            },
            select: { id: true },
        })

        if (!existingUser) {
            return NextResponse.json(
                { success: false, message: "User not found." },
                { status: 404 }
            )
        }

        // Activate / Deactivate
        if (body.status === "ACTIVE" || body.status === "INACTIVE") {
            const updatedUser = await prisma.user.update({
                where: { id },
                data: {
                    isActive: body.status === "ACTIVE",
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            })

            return NextResponse.json({
                success: true,
                message: `User ${body.status.toLowerCase()} successfully.`,
                user: {
                    ...updatedUser,
                    status: updatedUser.isActive ? "ACTIVE" : "INACTIVE",
                },
            })
        }

        // Edit user details
        const name =
            typeof body.name === "string" ? body.name.trim() : ""

        const email =
            typeof body.email === "string"
                ? body.email.trim().toLowerCase()
                : ""

        const role = body.role

        if (!name || name.length < 2 || name.length > 100) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid name." },
                { status: 400 }
            )
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            email.length > 254
        ) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid email." },
                { status: 400 }
            )
        }

        if (
            typeof role !== "string" ||
            !allowedRoles.includes(role as AllowedRole)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid user role." },
                { status: 400 }
            )
        }

        const duplicateEmail = await prisma.user.findFirst({
            where: {
                email,
                NOT: { id },
            },
            select: { id: true },
        })

        if (duplicateEmail) {
            return NextResponse.json(
                { success: false, message: "Email already exists." },
                { status: 409 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                role: role as AllowedRole,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        })

        return NextResponse.json({
            success: true,
            message: "User updated successfully.",
            user: {
                ...updatedUser,
                status: updatedUser.isActive ? "ACTIVE" : "INACTIVE",
            },
        })
    } catch (error) {
        console.error("Update user error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Unable to update user.",
            },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: RouteContext
) {
    try {
        // Only Admin can delete users
        const auth = await requireApiRole(["ADMIN"])

        if (auth.response) {
            return auth.response
        }

        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { success: false, message: "User ID is required." },
                { status: 400 }
            )
        }

        // Only Sub Admin, BDE and Trainer accounts can be deleted
        const existingUser = await prisma.user.findFirst({
            where: {
                id,
                role: {
                    in: [...allowedRoles],
                },
            },
            select: {
                id: true,
                name: true,
            },
        })

        if (!existingUser) {
            return NextResponse.json(
                { success: false, message: "User not found." },
                { status: 404 }
            )
        }

        // Protect users whose activity history is linked to them
        const activityCount = await prisma.requestTimeline.count({
            where: {
                actorId: id,
            },
        })

        if (activityCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This user has activity history and cannot be permanently deleted. Please deactivate the account instead.",
                },
                { status: 409 }
            )
        }

        // Permanently delete user
        await prisma.user.delete({
            where: { id },
        })

        return NextResponse.json({
            success: true,
            message: `${existingUser.name} has been deleted successfully.`,
        })
    } catch (error) {
        console.error("Delete user error:", error)

        return NextResponse.json(
            {
                success: false,
                message:
                    "Unable to delete user. This account may have linked records. Try deactivating it instead.",
            },
            { status: 409 }
        )
    }
}