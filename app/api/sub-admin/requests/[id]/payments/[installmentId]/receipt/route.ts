
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/api-authorization"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase-admin"



interface RouteContext {
  params: Promise<{
    id: string
    installmentId: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    // 1. Verify Sub Admin authorization
    const auth = await requireApiRole(["SUB_ADMIN"])
    if (auth.response) return auth.response

    // 2. Get route parameters
    const { id, installmentId } = await context.params

    // 3. Get submissionId from query parameters
    const { searchParams } = new URL(_request.url)
    const submissionId = searchParams.get("submissionId")

    if (!id || !installmentId || !submissionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Request ID, installment ID or submission ID is missing.",
        },
        { status: 400 }
      )
    }

    // 4. Find payment submission belonging to this request and installment
    const submission = await prisma.paymentSubmission.findFirst({
      where: {
        id: submissionId,
        installment: {
          id: installmentId,
          fto: {
            requestId: id,
          },
        },
      },
      select: {
        id: true,
        proofUrl: true,
      },
    })

    if (!submission || !submission.proofUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment receipt not found.",
        },
        { status: 404 }
      )
    }

    // 5. Generate temporary signed URL (5 minutes)
    const { data, error } = await supabaseAdmin.storage
      .from("payment-proofs")
      .createSignedUrl(submission.proofUrl, 300)

    if (error || !data?.signedUrl) {
      console.error("Payment receipt signed URL error:", error)

      return NextResponse.json(
        {
          success: false,
          message: "Unable to access payment receipt.",
        },
        { status: 500 }
      )
    }

    // 6. Return signed URL
    return NextResponse.json(
      {
        success: true,
        signedUrl: data.signedUrl,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    )
  } catch (error) {
    console.error("Sub Admin payment receipt API error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve payment receipt.",
      },
      { status: 500 }
    )
  }
}
