
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/api-authorization"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

const FTO_VISIBLE_STATUSES = [
  "FTO_SENT",
  "FTO_ACCEPTED",
  "PAYMENT_PENDING",
  "PAYMENT_SUBMITTED",
  "PAYMENT_VERIFICATION",
  "PAYMENT_VERIFIED",
  "PTA_SENT",
  "PTA_ACCEPTED",
  "PTA_REJECTED",
  "PSGA_DRAFT",
  "PSGA_SENT",
  "PSGA_ACCEPTED",
  "PSGA_REJECTED",
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

        finalTrainingOffer: {
          include: {
            programs: true,

            paymentInstallments: {
              orderBy: {
                installmentNumber: "asc",
              },
              include: {
                submissions: {
                  where: {
                    submittedById: auth.user.id,
                  },
                  orderBy: {
                    createdAt: "desc",
                  },
                  select: {
                    id: true,
                    paymentMethod: true,
                    transactionReference: true,
                    amountPaid: true,
                    status: true,
                    adminRemarks: true,
                    reviewedAt: true,
                    createdAt: true,
                    proofUrl: true,
                  },
                },
              },
            },
          },
        },

        ptaAgreement: {
          select: {
            id: true,
            ptaNumber: true,
            documentUrl: true,
            effectiveDate: true,
            status: true,
            generatedAt: true,
            sentAt: true,
            clientDecisionAt: true,
            clientRejectionReason: true,
          },
        },
        tafAgreement: {
          select: {
            id: true,
            tafNumber: true,
            documentUrl: true,
            status: true,
            generatedAt: true,
            sentAt: true,
            clientDecisionAt: true,
            clientRejectionReason: true,
          },
        },
      },
    })

    if (!serviceRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Request not found.",
        },
        { status: 404 }
      )
    }

    // FTO remains visible after it has been sent,
    // including after PTA acceptance or rejection.
    const ftoIsVisible = FTO_VISIBLE_STATUSES.includes(
      serviceRequest.status as (typeof FTO_VISIBLE_STATUSES)[number]
    )

    // PTA remains visible after SENT, ACCEPTED or REJECTED.
    const ptaIsVisible = [
      "SENT",
      "ACCEPTED",
      "REJECTED",
    ].includes(serviceRequest.ptaAgreement?.status ?? "")

    // TAF remains visible after it has been sent and after the client decision.
    const tafIsVisible = [
      "SENT",
      "ACCEPTED",
      "REJECTED",
    ].includes(serviceRequest.tafAgreement?.status ?? "")

    const requestData = {
      id: serviceRequest.id,
      requestNumber: serviceRequest.requestNumber,
      status: serviceRequest.status,
      createdAt: serviceRequest.createdAt,
      submittedAt: serviceRequest.submittedAt,

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
      additionalRequirements: serviceRequest.additionalRequirements,

      programmes: serviceRequest.programs.map((item) => ({
        code: item.program.code,
        title: item.program.title,
        category: item.program.category,
        duration: item.program.duration,
        mode: item.preferredMode,
        participants: item.participants,
        expectedBatches: item.expectedBatches,
      })),

      totalParticipants: serviceRequest.programs.reduce(
        (total, item) => total + item.participants,
        0
      ),

      timeline: serviceRequest.timeline.map((item) => ({
        id: item.id,
        status: item.status,
        remarks: item.remarks,
        createdAt: item.createdAt,
      })),

      // FTO details
      fto:
        ftoIsVisible && serviceRequest.finalTrainingOffer
          ? {
              id: serviceRequest.finalTrainingOffer.id,
              ftoNumber: serviceRequest.finalTrainingOffer.ftoNumber,
              currency: serviceRequest.finalTrainingOffer.currency,

              subtotal:
                serviceRequest.finalTrainingOffer.subtotal.toString(),

              discountPercent:
                serviceRequest.finalTrainingOffer.discountPercent.toString(),

              discountAmount:
                serviceRequest.finalTrainingOffer.discountAmount.toString(),

              logisticsCharges:
                serviceRequest.finalTrainingOffer.logisticsCharges.toString(),

              otherCharges:
                serviceRequest.finalTrainingOffer.otherCharges.toString(),

              taxableAmount:
                serviceRequest.finalTrainingOffer.taxableAmount.toString(),

              gstPercent:
                serviceRequest.finalTrainingOffer.gstPercent.toString(),

              gstAmount:
                serviceRequest.finalTrainingOffer.gstAmount.toString(),

              grandTotal:
                serviceRequest.finalTrainingOffer.grandTotal.toString(),

              issueDate: serviceRequest.finalTrainingOffer.issueDate,
              validUntil: serviceRequest.finalTrainingOffer.validUntil,
              jurisdiction: serviceRequest.finalTrainingOffer.jurisdiction,
              documentUrl: serviceRequest.finalTrainingOffer.documentUrl,

              paymentTerm:
                serviceRequest.finalTrainingOffer.paymentTerm,

              paymentInstallments:
                serviceRequest.finalTrainingOffer.paymentInstallments.map(
                  (installment) => ({
                    id: installment.id,
                    installmentNumber: installment.installmentNumber,

                    percentage: installment.percentage.toString(),
                    amount: installment.amount.toString(),

                    milestone: installment.milestone,
                    status: installment.status,

                    submissions: installment.submissions.map(
                      (submission) => ({
                        id: submission.id,
                        paymentMethod: submission.paymentMethod,
                        transactionReference:
                          submission.transactionReference,

                        amountPaid: submission.amountPaid.toString(),

                        status: submission.status,
                        adminRemarks: submission.adminRemarks,
                        reviewedAt: submission.reviewedAt,
                        createdAt: submission.createdAt,

                        hasReceipt: Boolean(submission.proofUrl),
                      })
                    ),
                  })
                ),

              programs:
                serviceRequest.finalTrainingOffer.programs.map((item) => ({
                  programCode: item.programCode,
                  programTitle: item.programTitle,
                  duration: item.duration,
                  deliveryMode: item.deliveryMode,
                  participants: item.participants,
                  batches: item.batches,

                  pricePerBatch: item.pricePerBatch.toString(),
                  totalAmount: item.totalAmount.toString(),
                })),
            }
          : null,

      // PTA details remain visible after client decision.
      pta:
        ptaIsVisible && serviceRequest.ptaAgreement
          ? {
              id: serviceRequest.ptaAgreement.id,
              ptaNumber: serviceRequest.ptaAgreement.ptaNumber,
              documentUrl: serviceRequest.ptaAgreement.documentUrl,
              effectiveDate: serviceRequest.ptaAgreement.effectiveDate,
              status: serviceRequest.ptaAgreement.status,
              generatedAt: serviceRequest.ptaAgreement.generatedAt,
              sentAt: serviceRequest.ptaAgreement.sentAt,
              clientDecisionAt:
                serviceRequest.ptaAgreement.clientDecisionAt,
              clientRejectionReason:
                serviceRequest.ptaAgreement.clientRejectionReason,
            }
          : null,
      // TAF details remain visible after client decision.
      taf:
        tafIsVisible && serviceRequest.tafAgreement
          ? {
              id: serviceRequest.tafAgreement.id,
              tafNumber: serviceRequest.tafAgreement.tafNumber,
              documentUrl: serviceRequest.tafAgreement.documentUrl,
              status: serviceRequest.tafAgreement.status,
              generatedAt: serviceRequest.tafAgreement.generatedAt,
              sentAt: serviceRequest.tafAgreement.sentAt,
              clientDecisionAt:
                serviceRequest.tafAgreement.clientDecisionAt,
              clientRejectionReason:
                serviceRequest.tafAgreement.clientRejectionReason,
            }
          : null,
    }

    return NextResponse.json(
      {
        success: true,
        request: requestData,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    )
  } catch (error) {
    console.error("Client Request Detail API Error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch request details.",
      },
      { status: 500 }
    )
  }
}
