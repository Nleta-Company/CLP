import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";
import { generateTafPdf } from "@/lib/taf/generate-taf-pdf";
import type { TafPdfData } from "@/lib/taf/taf-pdf-template";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function dateText(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * GET: Generate and download the saved TAF-01 as a PDF.
 * This endpoint only reads existing records; it does not approve activation,
 * change workflow status, or update any database record.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const taf = await prisma.tafAgreement.findUnique({
      where: { requestId: id },
      include: {
        generatedBy: { select: { name: true } },
        request: {
          include: {
            programs: {
              include: {
                program: {
                  select: {
                    code: true,
                    title: true,
                    audience: true,
                    duration: true,
                    mode: true,
                  },
                },
              },
            },
            timeline: {
              where: { status: { in: ["FTO_ACCEPTED", "PTA_ACCEPTED"] } },
              orderBy: { createdAt: "desc" },
              select: { status: true, createdAt: true, remarks: true },
            },
            ptaAgreement: true,
            finalTrainingOffer: {
              include: {
                programs: true,
                paymentInstallments: {
                  orderBy: { installmentNumber: "asc" },
                  include: {
                    submissions: {
                      where: { status: "VERIFIED" },
                      orderBy: { reviewedAt: "desc" },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!taf) return apiError("TAF not found for this request.", 404);

    const request = taf.request;
    const pta = request.ptaAgreement;
    const fto = request.finalTrainingOffer;

    if (!pta || pta.status !== "ACCEPTED") {
      return apiError("PTA must be accepted before generating the TAF PDF.", 409);
    }
    if (!fto) {
      return apiError("FTO not found for this request.", 409);
    }

    const ftoAcceptedEvent = request.timeline.find((item) => item.status === "FTO_ACCEPTED");
    const ptaAcceptedEvent = request.timeline.find((item) => item.status === "PTA_ACCEPTED");
    const firstInstallment = fto.paymentInstallments.find((item) => item.installmentNumber === 1);
    const verifiedSubmission = firstInstallment?.submissions[0];
    const paymentVerified = firstInstallment?.status === "VERIFIED" || Boolean(verifiedSubmission);

    const pdfData: TafPdfData = {
      tafNumber: taf.tafNumber,
      revision: "1",
      generatedAt: taf.generatedAt.toISOString(),
      documentOwner: "Training Operations",
      client: {
        legalName: request.organisation ?? "",
        billingAddress: request.billingAddress,
        gstin: request.gstin,
        contactName: request.contactName,
        contactRole: request.designation,
        contactEmail: request.email,
        contactPhone: request.phone,
        nletaCoordinator: null,
        trainingLocation: request.trainingLocation,
      },
      ptaReference: pta.ptaNumber,
      ptaAcceptanceDate: dateText(pta.clientDecisionAt ?? ptaAcceptedEvent?.createdAt),
      ftoReference: fto.ftoNumber,
      ftoRevision: "1",
      ftoAcceptanceDate: dateText(ftoAcceptedEvent?.createdAt),
      tspReference: null,
      engagementId: request.requestNumber,
      batchId: null,
      programs: fto.programs.map((item) => ({
          code: item.programCode,
          title: item.programTitle,
          revision: null,
          mode: item.deliveryMode,
          duration: item.duration,
          batchOrHeadcount: `${item.batches} batch(es) / ${item.participants} participants`,
          dateAndTime: fto.confirmedTrainingSchedule,
      })),
      readiness: [
        { check: "PTA-01 signed or formally accepted by authorised parties", status: pta.status === "ACCEPTED" ? "Yes" : "No", reference: `${pta.ptaNumber} / ${dateText(pta.clientDecisionAt ?? ptaAcceptedEvent?.createdAt) ?? "Date not recorded"}` },
        { check: "FTO issued, scope confirmed and accepted by authorised client representative", status: ftoAcceptedEvent ? "Yes" : "Pending", reference: `${fto.ftoNumber} / Rev.1` },
        { check: "Client legal, billing and contact details verified", status: request.organisation && request.billingAddress && request.contactName && request.email ? "Yes" : "Pending", reference: "Service request record" },
        { check: "Program codes/titles, specification, audience and prerequisites confirmed", status: request.programs.length ? "Pending review" : "No", reference: request.programs.map((p) => p.program.code).join(", ") || null },
        { check: "Delivery mode, venue/platform, schedule, duration, batch count and trainer confirmed", status: "Pending", reference: "Trainer assignment / schedule confirmation required" },
        { check: "Participant cap, language, learning outcomes and assessment criteria confirmed", status: "Pending", reference: request.preferredLanguage ?? null },
        { check: "Fee, discount, taxes and payment milestones match accepted FTO", status: ftoAcceptedEvent ? "Yes" : "Pending", reference: `FTO ${fto.ftoNumber}` },
        { check: "Advance/payment milestone verified or approved credit terms recorded", status: paymentVerified ? "Yes" : "Pending", reference: verifiedSubmission?.transactionReference ?? (firstInstallment ? `Installment 1: ${firstInstallment.status}` : "No installment record") },
        { check: "Materials, platform, equipment and venue readiness confirmed where applicable", status: "Pending", reference: null },
        { check: "For onsite/hybrid: site access, induction, emergency and safety arrangements confirmed", status: "Pending / N.A. to be reviewed", reference: null },
        { check: "Participant list and lawful basis/notice for personal-data sharing confirmed", status: "Pending", reference: null },
        { check: "Attendance method and TAR-01 record owner confirmed", status: "Pending", reference: null },
        { check: "Assessment, result reporting and certificate-control requirements confirmed", status: "Pending", reference: null },
        { check: "Client deliverables and handover expectations confirmed", status: "Pending", reference: "TAR-01, ATR-01, CTR-01 where applicable, TCR-01" },
        { check: "Special conditions, approved deviations or change orders documented", status: "Pending review", reference: fto.specialRemarks },
      ],
      commercial: {
        approvedTotal: `₹ ${fto.taxableAmount.toString()}`,
        taxesAndTotal: `Tax: ₹ ${fto.gstAmount.toString()} | Total: ₹ ${fto.grandTotal.toString()}`,
        advanceDueReceivedDate: firstInstallment
          ? `₹ ${firstInstallment.amount.toString()} / ${verifiedSubmission ? `Received ${dateText(verifiedSubmission.reviewedAt) ?? ""}` : `Status: ${firstInstallment.status}`}`
          : null,
        paymentEvidence: verifiedSubmission
          ? `Verified submission${verifiedSubmission.transactionReference ? ` / Ref: ${verifiedSubmission.transactionReference}` : ""}`
          : "No verified payment evidence recorded",
        balanceMilestone: fto.paymentMilestones,
        logistics: fto.logisticsTreatment,
        creditException: null,
      },
      activation: {
        status: "HOLD — pending readiness review and authorised approval",
        effectiveDate: null,
        approvedBatchIds: null,
        pendingItems: "Complete mandatory readiness checklist and obtain authorised approval before delivery.",
        approverName: null,
        approvalEvidence: null,
      },
      signoff: [
        { role: "Prepared — Training Coordinator", name: taf.generatedBy.name, date: dateText(taf.generatedAt) },
        { role: "Reviewed — Commercial / Operations" },
        { role: "Approved — Authorized NLETA Approver" },
        { role: "Client acknowledgement, if required by contract" },
      ],
    };

    const pdfBuffer = await generateTafPdf(pdfData);
    const safeFileName = `${taf.tafNumber}.pdf`;

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
    console.error("TAF PDF Download API Error:", error);
    return apiError("Unable to generate TAF PDF. Please try again.", 500);
  }
}
