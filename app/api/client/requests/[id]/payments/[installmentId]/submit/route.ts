
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { requireApiRole } from "@/lib/auth/api-authorization"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase-admin"

type RouteContext = {
  params: Promise<{
    id: string
    installmentId: string
  }>
}

const BUCKET = "payment-proofs"
const MAX_FILE_SIZE = 5 * 1024 * 1024

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

    if (auth.response) return auth.response

    const { id, installmentId } = await context.params
    const formData = await request.formData()

    const paymentMethod = formData.get("paymentMethod")
    const transactionReference = formData.get("transactionReference")
    const amountPaid = formData.get("amountPaid")
    const receipt = formData.get("receipt")

    if (
      typeof paymentMethod !== "string" ||
      !paymentMethod.trim()
    ) {
      return apiError("Please select a payment method.", 400)
    }

    if (
      typeof transactionReference !== "string" ||
      !transactionReference.trim() ||
      transactionReference.trim().length > 150
    ) {
      return apiError("Please enter a valid transaction reference.", 400)
    }

    if (
      typeof amountPaid !== "string" ||
      !Number.isFinite(Number(amountPaid)) ||
      Number(amountPaid) <= 0
    ) {
      return apiError("Please enter a valid payment amount.", 400)
    }

    if (!(receipt instanceof File)) {
      return apiError("Please upload your payment receipt.", 400)
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ]

    if (!allowedTypes.includes(receipt.type)) {
      return apiError("Only PDF, JPG and PNG files are allowed.", 400)
    }

    if (receipt.size === 0 || receipt.size > MAX_FILE_SIZE) {
      return apiError("Receipt must be smaller than 5 MB.", 400)
    }

    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        id,
        clientId: auth.user.id,
      },
      select: {
        id: true,
        status: true,
        finalTrainingOffer: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!serviceRequest) {
      return apiError("Request not found.", 404)
    }

    if (
      ![
        "FTO_ACCEPTED",
        "PAYMENT_PENDING",
        "PAYMENT_SUBMITTED",
        "PAYMENT_VERIFICATION",
      ].includes(serviceRequest.status)
    ) {
      return apiError(
        "Payment submission is not available for this request.",
        409
      )
    }

    const fto = serviceRequest.finalTrainingOffer

    if (!fto) {
      return apiError("Final Training Offer not found.", 404)
    }

    const installment = await prisma.paymentInstallment.findFirst({
      where: {
        id: installmentId,
        ftoId: fto.id,
      },
    })

    if (!installment) {
      return apiError("Payment installment not found.", 404)
    }

    if (
      installment.status !== "PENDING" &&
      installment.status !== "REJECTED"
    ) {
      return apiError(
        "This installment already has a payment submission under review or has been verified.",
        409
      )
    }

    const expectedPaise = Math.round(
      Number(installment.amount.toString()) * 100
    )

    const submittedPaise = Math.round(Number(amountPaid) * 100)

    if (
      !Number.isSafeInteger(submittedPaise) ||
      submittedPaise !== expectedPaise
    ) {
      return apiError(
        `Please enter the exact installment amount: ${installment.amount.toString()}.`,
        400
      )
    }

    const extension =
      receipt.type === "application/pdf"
        ? "pdf"
        : receipt.type === "image/png"
          ? "png"
          : "jpg"

    const filePath =
      `${auth.user.id}/${id}/${installmentId}/${randomUUID()}.${extension}`

    const fileBuffer = Buffer.from(await receipt.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: receipt.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Payment receipt upload error:", uploadError)
      return apiError("Unable to upload payment receipt.", 500)
    }

    try {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.paymentInstallment.updateMany({
          where: {
            id: installment.id,
            ftoId: fto.id,
            status: {
              in: ["PENDING", "REJECTED"],
            },
          },
          data: {
            status: "SUBMITTED",
          },
        })

        if (updated.count !== 1) {
          throw new Error("INSTALLMENT_ALREADY_SUBMITTED")
        }

        await tx.paymentSubmission.create({
          data: {
            installmentId: installment.id,
            submittedById: auth.user.id,
            paymentMethod: paymentMethod.trim(),
            transactionReference: transactionReference.trim(),
            proofUrl: filePath,
            amountPaid: installment.amount,
            status: "PENDING",
          },
        })

        await tx.serviceRequest.update({
          where: {
            id: serviceRequest.id,
          },
          data: {
            status: "PAYMENT_SUBMITTED",
          },
        })

        await tx.requestTimeline.create({
          data: {
            requestId: serviceRequest.id,
            actorId: auth.user.id,
            status: "PAYMENT_SUBMITTED",
            remarks: `Payment submitted for installment ${installment.installmentNumber}.`,
          },
        })
      })
    } catch (error) {
      await supabaseAdmin.storage
        .from(BUCKET)
        .remove([filePath])

      throw error
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment submitted successfully. Awaiting verification.",
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INSTALLMENT_ALREADY_SUBMITTED"
    ) {
      return apiError(
        "This installment has already been submitted. Please refresh the page.",
        409
      )
    }

    console.error("Client Payment Submission API Error:", error)

    return apiError("Unable to submit payment.", 500)
  }
}
