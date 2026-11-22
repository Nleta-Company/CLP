
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/api-authorization"
import { prisma } from "@/lib/prisma"
import { generateFtoPdf } from "@/lib/fto/fto-pdf-generator"


type RouteContext = {
    params: Promise<{ id: string }>
}

const CLIENT_FTO_STATUSES = [
    "FTO_SENT",
    "FTO_ACCEPTED",
    "FTO_REJECTED",
    "PAYMENT_PENDING",
    "PAYMENT_SUBMITTED",
    "PAYMENT_VERIFICATION",
    "PAYMENT_VERIFIED",

    // PTA workflow
    "PTA_SENT",
    "PTA_ACCEPTED",
    "PTA_REJECTED",

    // PSGA workflow
    "PSGA_DRAFT",
    "PSGA_SENT",
    "PSGA_ACCEPTED",
    "PSGA_REJECTED",

    // TAF workflow
    "TAF_DRAFT",
    "TAF_SENT",
    "TAF_ACCEPTED",
    "TAF_REJECTED",

    "TRAINER_ASSIGNMENT",
    "TRAINING",
    "COMPLETED",
] as const
export async function GET(
    _request: Request,
    context: RouteContext
) {
    try {
        const auth = await requireApiRole(["CLIENT"])

        if (auth.response) {
            return auth.response
        }

        const { id } = await context.params

        const serviceRequest = await prisma.serviceRequest.findFirst({
            where: {
                id,
                clientId: auth.user.id,
            },
            include: {
                client: {
                    select: {
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
                                audience: true,
                                duration: true,
                            },
                        },
                    },
                },
                finalTrainingOffer: {
                    include: {
                        programs: true,
                    },
                },
            },
        })

        if (!serviceRequest) {
            return NextResponse.json(
                { success: false, message: "Request not found." },
                { status: 404 }
            )
        }

        // FTO must be officially sent before the client can access it.
        if (
            !CLIENT_FTO_STATUSES.includes(
                serviceRequest.status as (typeof CLIENT_FTO_STATUSES)[number]
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "FTO has not been sent to you yet.",
                },
                { status: 403 }
            )
        }

        const fto = serviceRequest.finalTrainingOffer

        if (!fto) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Final Training Offer is not available.",
                },
                { status: 404 }
            )
        }

        if (!fto.jurisdiction?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "FTO jurisdiction is incomplete. Please contact NLETA.",
                },
                { status: 409 }
            )
        }

        const programDetails = new Map(
            serviceRequest.programs.map((item) => [
                item.program.code,
                item.program,
            ])
        )

        const pdfData = {
            ftoNumber: fto.ftoNumber,
            issueDate: fto.issueDate.toISOString(),
            validUntil: fto.validUntil
                ? fto.validUntil.toISOString()
                : "",
            clientPoNumber: fto.clientPoNumber,
            jurisdiction: fto.jurisdiction,

            client: {
                organisation: serviceRequest.organisation,
                billingAddress: serviceRequest.billingAddress,
                gstin: serviceRequest.gstin,
                contactName: serviceRequest.contactName,
                designation: serviceRequest.designation,
                email: serviceRequest.email,
                phone: serviceRequest.phone,
                trainingLocation: serviceRequest.trainingLocation,
            },

            programs: fto.programs.map((item) => {
                const originalProgram = programDetails.get(item.programCode)

                return {
                    programCode: item.programCode,
                    programTitle: item.programTitle,
                    audience: originalProgram?.audience ?? null,
                    duration: item.duration,
                    deliveryMode: item.deliveryMode,
                    participants: item.participants,
                    batches: item.batches,
                    batchSize: null,
                    pricePerBatch: item.pricePerBatch.toString(),
                    totalAmount: item.totalAmount.toString(),
                }
            }),

            subtotal: fto.subtotal.toString(),
            discountPercent: fto.discountPercent.toString(),
            discountAmount: fto.discountAmount.toString(),
            taxableAmount: fto.taxableAmount.toString(),
            gstPercent: fto.gstPercent.toString(),
            gstAmount: fto.gstAmount.toString(),
            logisticsCharges: fto.logisticsCharges.toString(),
            otherCharges: fto.otherCharges.toString(),
            grandTotal: fto.grandTotal.toString(),

            confirmedTrainingSchedule: fto.confirmedTrainingSchedule,
            dailyTrainingTiming: fto.dailyTrainingTiming,
            paymentMilestones: fto.paymentMilestones,
            logisticsTreatment: fto.logisticsTreatment,
            terms: fto.terms,
            specialRemarks: fto.specialRemarks,
        }

        const pdfBuffer = await generateFtoPdf(pdfData)

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${fto.ftoNumber}.pdf"`,
                "Cache-Control": "private, no-store, max-age=0",
                "X-Content-Type-Options": "nosniff",
            },
        })
    } catch (error) {
        console.error("Client FTO PDF API Error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Unable to generate FTO PDF.",
            },
            { status: 500 }
        )
    }
}
