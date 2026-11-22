import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/api-authorization"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

type FtoDecisionBody = {
  decision?: unknown
  rejectionReason?: unknown
}

function apiError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status }
  )
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["CLIENT"])

    if (auth.response) {
      return auth.response
    }

    const { id } = await context.params

    let body: FtoDecisionBody
    try {
      body = (await request.json()) as FtoDecisionBody
    } catch {
      return apiError("Invalid request body.", 400)
    }

    const decision = body.decision

    if (decision !== "ACCEPT" && decision !== "REJECT") {
      return apiError("Please provide a valid FTO decision.", 400)
    }

    const rejectionReason =
      typeof body.rejectionReason === "string"
        ? body.rejectionReason.trim()
        : ""

    if (decision === "REJECT") {
      if (rejectionReason.length < 10) {
        return apiError(
          "Please provide a rejection reason of at least 10 characters.",
          400
        )
      }

      if (rejectionReason.length > 2000) {
        return apiError(
          "Rejection reason cannot exceed 2000 characters.",
          400
        )
      }
    }

    // Ownership check: a client can only decide on their own request.
    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        id,
        clientId: auth.user.id,
      },
      select: {
        id: true,
        requestNumber: true,
        status: true,
        finalTrainingOffer: {
          select: {
            id: true,
            ftoNumber: true,
            jurisdiction: true,
            validUntil: true,
          },
        },
      },
    })

    if (!serviceRequest) {
      return apiError("Request not found.", 404)
    }

    if (serviceRequest.status !== "FTO_SENT") {
      return apiError(
        "A decision can only be submitted when the FTO has been sent and is awaiting your response.",
        409
      )
    }

    const fto = serviceRequest.finalTrainingOffer

    if (!fto) {
      return apiError("Final Training Offer not found.", 404)
    }

    if (!fto.jurisdiction?.trim()) {
      return apiError(
        "The FTO is incomplete. Please contact NLETA before submitting your decision.",
        409
      )
    }

    if (!fto.validUntil) {
      return apiError(
        "The FTO validity date is missing. Please contact NLETA.",
        409
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const validUntil = new Date(fto.validUntil)
    validUntil.setHours(0, 0, 0, 0)

    if (Number.isNaN(validUntil.getTime()) || validUntil < today) {
      return apiError(
        "This FTO has expired. Please contact NLETA for an updated offer.",
        409
      )
    }

    const nextStatus = decision === "ACCEPT" ? "FTO_ACCEPTED" : "FTO_REJECTED"
    const remarks =
      decision === "ACCEPT"
        ? `Client accepted FTO ${fto.ftoNumber}.`
        : `Client rejected FTO ${fto.ftoNumber}. Reason: ${rejectionReason}`

    // Update status and timeline together. The conditional update prevents
    // duplicate decisions if two requests arrive at nearly the same time.
    await prisma.$transaction(async (tx) => {
      const updated = await tx.serviceRequest.updateMany({
        where: {
          id: serviceRequest.id,
          clientId: auth.user.id,
          status: "FTO_SENT",
        },
        data: {
          status: nextStatus,
        },
      })

      if (updated.count !== 1) {
        throw new Error("FTO_DECISION_ALREADY_SUBMITTED")
      }

      await tx.requestTimeline.create({
        data: {
          requestId: serviceRequest.id,
          actorId: auth.user.id,
          status: nextStatus,
          remarks,
        },
      })
    })

    return NextResponse.json(
      {
        success: true,
        message:
          decision === "ACCEPT"
            ? "FTO accepted successfully."
            : "FTO rejected successfully. Your reason has been shared with NLETA.",
        status: nextStatus,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    )
  } catch (error) {
    if (error instanceof Error && error.message === "FTO_DECISION_ALREADY_SUBMITTED") {
      return apiError(
        "This FTO decision has already been submitted. Please refresh the page.",
        409
      )
    }

    console.error("Client FTO Decision API Error:", error)

    return apiError("Unable to submit your FTO decision.", 500)
  }
}
