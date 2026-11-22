
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/api-authorization"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const auth = await requireApiRole(["SUB_ADMIN"])

        if (auth.response) {
            return auth.response
        }

        const requests = await prisma.serviceRequest.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                programs: {
                    include: {
                        program: {
                            select: {
                                code: true,
                                title: true,
                                category: true,
                                duration: true,
                                mode: true,
                            },
                        },
                    },
                },
            },
        })

        const formattedRequests = requests.map((request) => ({
            id: request.id,
            requestNumber: request.requestNumber,
            clientName: request.client.name,
            clientEmail: request.client.email,
            status: request.status,
            submittedAt: request.submittedAt,
            createdAt: request.createdAt,
            preferredDate: request.preferredDate,
            alternateDate: request.alternateDate,
            trainingLocation: request.trainingLocation,
            coordinator: request.coordinator,

            programmes: request.programs.map((item) => ({
                code: item.program.code,
                title: item.program.title,
                category: item.program.category,
                duration: item.program.duration,
                mode: item.preferredMode,
                participants: item.participants,
                expectedBatches: item.expectedBatches,
            })),

            totalParticipants: request.programs.reduce(
                (total, item) => total + item.participants,
                0
            ),
        }))

        return NextResponse.json({
            success: true,
            total: formattedRequests.length,
            requests: formattedRequests,
        })
    } catch (error) {
        console.error("Sub Admin Requests API Error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch service requests.",
            },
            { status: 500 }
        )
    }
}
