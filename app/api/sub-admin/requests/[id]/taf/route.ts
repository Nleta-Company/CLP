
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

function makeTafNumber() {
  return `TAF-${new Date().getFullYear()}-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase()}`;
}

/**
 * GET: Fetch TAF details and generation eligibility.
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
        tafAgreement: true,
      },
    });

    if (!serviceRequest) {
      return apiError("Service request not found.", 404);
    }

    const ptaAccepted =
      serviceRequest.status === "PTA_ACCEPTED" &&
      serviceRequest.ptaAgreement?.status === "ACCEPTED";

    return NextResponse.json({
      success: true,
      canGenerate: ptaAccepted && !serviceRequest.tafAgreement,
      ptaAccepted,
      taf: serviceRequest.tafAgreement,
    });
  } catch (error) {
    console.error("TAF Fetch API Error:", error);

    return apiError("Unable to fetch TAF details.", 500);
  }
}

/**
 * POST: Generate TAF.
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
          tafAgreement: true,
        },
      });

      if (!serviceRequest) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      if (
        serviceRequest.status !== "PTA_ACCEPTED" ||
        serviceRequest.ptaAgreement?.status !== "ACCEPTED"
      ) {
        throw new Error("PTA_NOT_ACCEPTED");
      }

      if (serviceRequest.tafAgreement) {
        throw new Error("TAF_ALREADY_EXISTS");
      }

      const taf = await tx.tafAgreement.create({
        data: {
          tafNumber: makeTafNumber(),
          requestId: id,
          generatedById: auth.user.id,
          status: "GENERATED",
        },
      });

      await tx.requestTimeline.create({
        data: {
          requestId: id,
          actorId: auth.user.id,
          status: "TAF_DRAFT",
          remarks: `TAF ${taf.tafNumber} generated.`,
        },
      });

      return taf;
    });

    return NextResponse.json(
      {
        success: true,
        message: "TAF generated successfully.",
        taf: result,
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
        PTA_NOT_ACCEPTED: {
          message: "Client must accept the PTA before generating TAF.",
          status: 409,
        },
        TAF_ALREADY_EXISTS: {
          message: "TAF has already been generated.",
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

    console.error("TAF Generate API Error:", error);

    return apiError("Unable to generate TAF.", 500);
  }
}

/**
 * PATCH: Mark generated TAF as sent to client.
 * Email functionality will be added separately.
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
      const taf = await tx.tafAgreement.findUnique({
        where: {
          requestId: id,
        },
        select: {
          id: true,
          tafNumber: true,
          status: true,
        },
      });

      if (!taf) {
        throw new Error("TAF_NOT_FOUND");
      }

      if (taf.status !== "GENERATED") {
        throw new Error("INVALID_TAF_STATUS");
      }

      const updated = await tx.tafAgreement.updateMany({
        where: {
          id: taf.id,
          status: "GENERATED",
        },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });

      if (updated.count !== 1) {
        throw new Error("INVALID_TAF_STATUS");
      }

      await tx.serviceRequest.update({
        where: { id },
        data: {
          status: "TAF_SENT",
        },
      });

      await tx.requestTimeline.create({
        data: {
          requestId: id,
          actorId: auth.user.id,
          status: "TAF_SENT",
          remarks: `TAF ${taf.tafNumber} sent to client.`,
        },
      });

      return taf;
    });

    return NextResponse.json({
      success: true,
      message: `TAF ${result.tafNumber} marked as sent to client.`,
    });
  } catch (error) {
    if (error instanceof Error) {
      const known: Record<
        string,
        { message: string; status: number }
      > = {
        TAF_NOT_FOUND: {
          message: "Generate TAF before sending it to the client.",
          status: 404,
        },
        INVALID_TAF_STATUS: {
          message: "Only a generated TAF can be sent to the client.",
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

    console.error("TAF Status Update API Error:", error);

    return apiError("Unable to update TAF status.", 500);
  }
}
