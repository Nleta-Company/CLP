
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/api-authorization"
import { prisma } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{
    id: string
    installmentId: string
  }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    // 1. Verify Sub Admin authorization
    const auth = await requireApiRole(["SUB_ADMIN"])
    if (auth.response) return auth.response

    const { id, installmentId } = await context.params

    // 2. Read request body
    const body = await request.json()

    const submissionId =
      typeof body.submissionId === "string"
        ? body.submissionId.trim()
        : ""

    const action =
      typeof body.action === "string"
        ? body.action.trim().toUpperCase()
        : ""

    const remarks =
      typeof body.remarks === "string"
        ? body.remarks.trim()
        : ""

    if (!id || !installmentId || !submissionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Request, installment or submission ID is missing.",
        },
        { status: 400 }
      )
    }

    if (action !== "VERIFY" && action !== "REJECT") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment review action.",
        },
        { status: 400 }
      )
    }

    if (action === "REJECT" && remarks.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a rejection reason of at least 10 characters.",
        },
        { status: 400 }
      )
    }

    if (remarks.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Remarks cannot exceed 1000 characters.",
        },
        { status: 400 }
      )
    }

    // 3. Review payment inside a database transaction
    const result = await prisma.$transaction(
      async (tx) => {
        const submission = await tx.paymentSubmission.findFirst({
          where: {
            id: submissionId,
            installmentId,
            installment: {
              fto: {
                requestId: id,
              },
            },
          },
          select: {
            id: true,
            status: true,
            amountPaid: true,
            installment: {
              select: {
                id: true,
                amount: true,
                installmentNumber: true,
              },
            },
          },
        })

        if (!submission) {
          throw new Error("PAYMENT_NOT_FOUND")
        }

        if (submission.status !== "PENDING") {
          throw new Error("PAYMENT_ALREADY_REVIEWED")
        }

        // 4. Update payment submission
        const newSubmissionStatus =
          action === "VERIFY" ? "VERIFIED" : "REJECTED"

        const updatedSubmission = await tx.paymentSubmission.updateMany({
          where: {
            id: submissionId,
            installmentId,
            status: "PENDING",
          },
          data: {
            status: newSubmissionStatus,
            adminRemarks: remarks || null,
            reviewedById: auth.user.id,
            reviewedAt: new Date(),
          },
        })

        if (updatedSubmission.count !== 1) {
          throw new Error("PAYMENT_ALREADY_REVIEWED")
        }

        // 5. Update corresponding installment
        await tx.paymentInstallment.update({
          where: {
            id: installmentId,
          },
          data: {
            status: action === "VERIFY" ? "VERIFIED" : "REJECTED",
          },
        })

        // 6. Check status of every installment in this FTO
        const installments = await tx.paymentInstallment.findMany({
          where: {
            fto: {
              requestId: id,
            },
          },
          select: {
            status: true,
          },
        })

        const allVerified =
          installments.length > 0 &&
          installments.every((item) => item.status === "VERIFIED")

        const hasSubmittedPayment = installments.some(
          (item) => item.status === "SUBMITTED"
        )

        const nextRequestStatus = allVerified
          ? "PAYMENT_VERIFIED"
          : hasSubmittedPayment
            ? "PAYMENT_SUBMITTED"
            : "PAYMENT_PENDING"

        // 7. Update overall service request status
        await tx.serviceRequest.update({
          where: {
            id,
          },
          data: {
            status: nextRequestStatus,
          },
        })

        // 8. Add entry to request timeline
        await tx.requestTimeline.create({
          data: {
            requestId: id,
            actorId: auth.user.id,
            status: nextRequestStatus,
            remarks:
              action === "VERIFY"
                ? `Payment installment ${submission.installment.installmentNumber} verified. ${remarks}`.trim()
                : `Payment installment ${submission.installment.installmentNumber} rejected. Reason: ${remarks}`,
          },
        })

        return {
          submissionId: submission.id,
          installmentId,
          installmentNumber: submission.installment.installmentNumber,
          amountPaid: submission.amountPaid.toString(),
          submissionStatus: newSubmissionStatus,
          installmentStatus:
            action === "VERIFY" ? "VERIFIED" : "REJECTED",
          requestStatus: nextRequestStatus,
        }
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    )

    return NextResponse.json(
      {
        success: true,
        message:
          action === "VERIFY"
            ? "Payment verified successfully."
            : "Payment rejected successfully.",
        payment: result,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PAYMENT_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "Payment submission not found for this request.",
          },
          { status: 404 }
        )
      }

      if (error.message === "PAYMENT_ALREADY_REVIEWED") {
        return NextResponse.json(
          {
            success: false,
            message: "This payment has already been reviewed.",
          },
          { status: 409 }
        )
      }
    }

    console.error("Sub Admin payment review API error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process payment verification.",
      },
      { status: 500 }
    )
  }
}
