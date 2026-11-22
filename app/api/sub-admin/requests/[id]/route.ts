
import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    _request: Request,
    context: RouteContext
) {
    try {
        const auth = await requireApiRole(["SUB_ADMIN"]);

        if (auth.response) {
            return auth.response;
        }

        const { id } = await context.params;

        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id },
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

                timeline: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },

                // FTO with payment installments and submissions
                finalTrainingOffer: {
                    include: {
                        paymentInstallments: {
                            orderBy: {
                                installmentNumber: "asc",
                            },
                            include: {
                                submissions: {
                                    orderBy: {
                                        createdAt: "desc",
                                    },
                                    include: {
                                        submittedBy: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                            },
                                        },
                                        reviewedBy: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!serviceRequest) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Service request not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                request: {
                    id: serviceRequest.id,
                    requestNumber: serviceRequest.requestNumber,
                    status: serviceRequest.status,
                    createdAt: serviceRequest.createdAt,
                    submittedAt: serviceRequest.submittedAt,

                    client: serviceRequest.client,

                    organisation: serviceRequest.organisation,
                    gstin: serviceRequest.gstin,
                    billingAddress: serviceRequest.billingAddress,
                    country: serviceRequest.country,
                    state: serviceRequest.state,
                    city: serviceRequest.city,
                    contactName: serviceRequest.contactName,
                    designation: serviceRequest.designation,
                    email: serviceRequest.email,
                    phone: serviceRequest.phone,

                    preferredDate: serviceRequest.preferredDate,
                    alternateDate: serviceRequest.alternateDate,
                    trainingLocation: serviceRequest.trainingLocation,
                    preferredLanguage: serviceRequest.preferredLanguage,
                    coordinator: serviceRequest.coordinator,
                    facilities: serviceRequest.facilities,
                    assessment: serviceRequest.assessment,
                    refresher: serviceRequest.refresher,
                    additionalRequirements:
                        serviceRequest.additionalRequirements,

                    programmes: serviceRequest.programs.map((item) => ({
                        code: item.program.code,
                        title: item.program.title,
                        category: item.program.category,
                        duration: item.program.duration,
                        mode: item.preferredMode,
                        participants: item.participants,
                        batches: item.expectedBatches,
                    })),

                    totalParticipants: serviceRequest.programs.reduce(
                        (total, item) => total + item.participants,
                        0
                    ),

                    // Payment information for Sub Admin
                    finalTrainingOffer: serviceRequest.finalTrainingOffer,

                    timeline: serviceRequest.timeline,
                },
            },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {
        console.error("Request Details API Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch request details.",
            },
            { status: 500 }
        );
    }
}

const allowedTransitions: Record<string, string[]> = {
    SUBMITTED: ["UNDER_REVIEW"],
    UNDER_REVIEW: ["REQUEST_ACCEPTED", "REQUEST_REJECTED"],
};

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const auth = await requireApiRole(["SUB_ADMIN"]);

        if (auth.response) {
            return auth.response;
        }

        const { id } = await context.params;
        const body = await request.json();

        const { status, remarks } = body;

        const validStatuses = [
            "UNDER_REVIEW",
            "REQUEST_ACCEPTED",
            "REQUEST_REJECTED",
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request status.",
                },
                { status: 400 }
            );
        }

        if (
            status === "REQUEST_REJECTED" &&
            (typeof remarks !== "string" || !remarks.trim())
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Remarks are required for rejection.",
                },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const existing = await tx.serviceRequest.findUnique({
                where: { id },
                select: {
                    id: true,
                    status: true,
                },
            });

            if (!existing) {
                throw new Error("REQUEST_NOT_FOUND");
            }

            const allowed = allowedTransitions[existing.status] ?? [];

            if (!allowed.includes(status)) {
                throw new Error("INVALID_TRANSITION");
            }

            const updated = await tx.serviceRequest.updateMany({
                where: {
                    id,
                    status: existing.status,
                },
                data: {
                    status,
                },
            });

            if (updated.count !== 1) {
                throw new Error("REQUEST_ALREADY_UPDATED");
            }

            await tx.requestTimeline.create({
                data: {
                    requestId: id,
                    actorId: auth.user.id,
                    status,
                    remarks:
                        typeof remarks === "string" && remarks.trim()
                            ? remarks.trim()
                            : null,
                },
            });

            return { id, status };
        });

        return NextResponse.json({
            success: true,
            message: "Request status updated successfully.",
            request: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "REQUEST_NOT_FOUND") {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Service request not found.",
                    },
                    { status: 404 }
                );
            }

            if (
                error.message === "INVALID_TRANSITION" ||
                error.message === "REQUEST_ALREADY_UPDATED"
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "This request cannot be updated from its current status. Please refresh.",
                    },
                    { status: 409 }
                );
            }
        }

        console.error("Request Update API Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to update request status.",
            },
            { status: 500 }
        );
    }
}
