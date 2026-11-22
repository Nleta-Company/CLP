
import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";
import { generateFtoPdf } from "@/lib/fto/fto-pdf-generator";
import type { FtoPdfData } from "@/lib/fto/fto-pdf-template";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

/**
 * GET: Generate and download the existing FTO as PDF.
 * Uses saved database values. Does not recalculate pricing
 * or change request/FTO status.
 */
export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const fto = await prisma.finalTrainingOffer.findUnique({
      where: { requestId: id },
      include: {
        programs: true,
        request: {
          include: {
            client: true,
            programs: {
              include: {
                program: {
                  select: {
                    code: true,
                    audience: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!fto) {
      return apiError("FTO not found for this request.", 404);
    }

    // Official template requires jurisdiction before client issue.
    if (!fto.jurisdiction?.trim()) {
      return apiError(
        "Please complete the competent court jurisdiction in Section 18 before downloading the client FTO.",
        409
      );
    }

    const request = fto.request;

    const audienceByCode = new Map(
      request.programs.map((item) => [
        item.program.code,
        item.program.audience,
      ])
    );

    const pdfData: FtoPdfData = {
      ftoNumber: fto.ftoNumber,
      issueDate: fto.issueDate.toISOString(),
      validUntil: (
        fto.validUntil ??
        new Date(
          fto.issueDate.getTime() + 30 * 24 * 60 * 60 * 1000
        )
      ).toISOString(),

      clientPoNumber: fto.clientPoNumber,
      jurisdiction: fto.jurisdiction,

      client: {
        organisation: request.organisation,
        billingAddress: request.billingAddress,
        gstin: request.gstin,
        contactName: request.contactName,
        designation: request.designation,
        email: request.email,
        phone: request.phone,
        trainingLocation: request.trainingLocation,
      },

      programs: fto.programs.map((program) => ({
        programCode: program.programCode,
        programTitle: program.programTitle,
        audience: audienceByCode.get(program.programCode) ?? null,
        duration: program.duration,
        deliveryMode: program.deliveryMode,
        participants: program.participants,
        batches: program.batches,
        pricePerBatch: program.pricePerBatch.toString(),
        totalAmount: program.totalAmount.toString(),

        // Batch-wise sizes are not stored in the current FTO schema.
        batchSize: null,
      })),

      // Use persisted commercial values. No new calculation.
      subtotal: fto.subtotal.toString(),
      discountPercent: fto.discountPercent.toString(),
      discountAmount: fto.discountAmount.toString(),
      taxableAmount: fto.taxableAmount.toString(),
      gstPercent: fto.gstPercent.toString(),
      gstAmount: fto.gstAmount.toString(),
      logisticsCharges: fto.logisticsCharges.toString(),
      otherCharges: fto.otherCharges.toString(),
      grandTotal: fto.grandTotal.toString(),

      confirmedTrainingSchedule:
        fto.confirmedTrainingSchedule,
      dailyTrainingTiming: fto.dailyTrainingTiming,
      paymentMilestones: fto.paymentMilestones,
      logisticsTreatment: fto.logisticsTreatment,
      terms: fto.terms,
      specialRemarks: fto.specialRemarks,
    };

    const pdfBuffer = await generateFtoPdf(pdfData);

    const safeFileName = `${fto.ftoNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("FTO PDF Download API Error:", error);

    return apiError(
      "Unable to generate FTO PDF. Please try again.",
      500
    );
  }
}
