import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function makePtaNumber() {
  return `PTA-${new Date().getFullYear()}-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase()}`;
}

/**
 * GET: Fetch PTA details and generation eligibility.
 */
export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);

    if (auth.response) return auth.response;

    const { id } = await context.params;

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        ptaAgreement: true,
        finalTrainingOffer: {
          include: {
            paymentInstallments: {
              where: {
                installmentNumber: 1,
              },
              include: {
                submissions: {
                  where: {
                    status: "VERIFIED",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!serviceRequest) {
      return apiError("Service request not found.", 404);
    }

    const firstInstallment =
      serviceRequest.finalTrainingOffer?.paymentInstallments?.[0];

    const firstPaymentVerified =
      Boolean(firstInstallment?.submissions?.length);

    return NextResponse.json({
      success: true,
      canGenerate:
        firstPaymentVerified && !serviceRequest.ptaAgreement,
      firstPaymentVerified,
      pta: serviceRequest.ptaAgreement,
    });
  } catch (error) {
    console.error("PTA Fetch API Error:", error);

    return apiError("Unable to fetch PTA details.", 500);
  }
}

/**
 * POST: Generate PTA.
 */
export async function POST(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);

    if (auth.response) return auth.response;

    const { id } = await context.params;

    const result = await prisma.$transaction(async (tx) => {
      const serviceRequest = await tx.serviceRequest.findUnique({
        where: { id },
        include: {
          ptaAgreement: true,
          finalTrainingOffer: {
            include: {
              paymentInstallments: {
                where: {
                  installmentNumber: 1,
                },
                include: {
                  submissions: {
                    where: {
                      status: "VERIFIED",
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!serviceRequest) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      if (serviceRequest.ptaAgreement) {
        throw new Error("PTA_ALREADY_EXISTS");
      }

      const firstInstallment =
        serviceRequest.finalTrainingOffer?.paymentInstallments?.[0];

      const firstPaymentVerified =
        Boolean(firstInstallment?.submissions?.length);

      if (!firstPaymentVerified) {
        throw new Error("FIRST_PAYMENT_NOT_VERIFIED");
      }

      const pta = await tx.ptaAgreement.create({
        data: {
          ptaNumber: makePtaNumber(),
          requestId: id,
          generatedById: auth.user.id,
          status: "GENERATED",
        },
      });

      return pta;
    });

    return NextResponse.json(
      {
        success: true,
        message: "PTA generated successfully.",
        pta: result,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      const known: Record<
        string,
        { message: string; status: number }
      > = {
        REQUEST_NOT_FOUND: {
          message: "Service request not found.",
          status: 404,
        },
        PTA_ALREADY_EXISTS: {
          message: "PTA has already been generated.",
          status: 409,
        },
        FIRST_PAYMENT_NOT_VERIFIED: {
          message:
            "First installment payment must be verified before generating PTA.",
          status: 409,
        },
      };

      const knownError = known[error.message];

      if (knownError) {
        return apiError(
          knownError.message,
          knownError.status
        );
      }
    }

    console.error("PTA Generate API Error:", error);

    return apiError("Unable to generate PTA.", 500);
  }
}

/**
 * PATCH: Mark generated PTA as sent.
 * Email functionality will be added later.
 */
export async function PATCH(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);

    if (auth.response) return auth.response;

    const { id } = await context.params;

    const result = await prisma.$transaction(async (tx) => {
      const pta = await tx.ptaAgreement.findUnique({
        where: {
          requestId: id,
        },
        select: {
          id: true,
          ptaNumber: true,
          status: true,
        },
      });

      if (!pta) {
        throw new Error("PTA_NOT_FOUND");
      }

      if (pta.status !== "GENERATED") {
        throw new Error("INVALID_PTA_STATUS");
      }

      const updated = await tx.ptaAgreement.updateMany({
        where: {
          id: pta.id,
          status: "GENERATED",
        },
        data: {
          status: "SENT",
        },
      });

      if (updated.count !== 1) {
        throw new Error("INVALID_PTA_STATUS");
      }

      await tx.requestTimeline.create({
        data: {
          requestId: id,
          actorId: auth.user.id,
          status: "PTA_SENT",
          remarks: `PTA ${pta.ptaNumber} marked as sent to client.`,
        },
      });

      return pta;
    });

    return NextResponse.json({
      success: true,
      message: `PTA ${result.ptaNumber} marked as sent.`,
    });
  } catch (error) {
    if (error instanceof Error) {
      const known: Record<
        string,
        { message: string; status: number }
      > = {
        PTA_NOT_FOUND: {
          message: "Generate the PTA before marking it as sent.",
          status: 404,
        },
        INVALID_PTA_STATUS: {
          message: "Only a generated PTA can be marked as sent.",
          status: 409,
        },
      };

      const knownError = known[error.message];

      if (knownError) {
        return apiError(
          knownError.message,
          knownError.status
        );
      }
    }

    console.error("PTA Status Update API Error:", error);

    return apiError(
      "Unable to update PTA status.",
      500
    );
  }
}