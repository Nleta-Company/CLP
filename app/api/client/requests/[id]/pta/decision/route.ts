
import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type DecisionBody = {
  decision?: "ACCEPT" | "REJECT";
  rejectionReason?: string;
};

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["CLIENT"]);
    if (auth.response) return auth.response;

    const { id } = await context.params;

    let body: DecisionBody;

    try {
      body = await request.json();
    } catch {
      return apiError("Invalid request body.");
    }

    const { decision, rejectionReason } = body;

    if (decision !== "ACCEPT" && decision !== "REJECT") {
      return apiError("Please select a valid decision.");
    }

    if (
      decision === "REJECT" &&
      (!rejectionReason || rejectionReason.trim().length < 10)
    ) {
      return apiError(
        "Rejection reason must contain at least 10 characters."
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const serviceRequest = await tx.serviceRequest.findFirst({
        where: {
          id,
          clientId: auth.user.id,
        },
        include: {
          ptaAgreement: true,
        },
      });

      if (!serviceRequest) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      const pta = serviceRequest.ptaAgreement;

      if (!pta || pta.status !== "SENT") {
        throw new Error("PTA_NOT_AVAILABLE");
      }

      const newPtaStatus =
        decision === "ACCEPT" ? "ACCEPTED" : "REJECTED";

      const newRequestStatus =
        decision === "ACCEPT" ? "PTA_ACCEPTED" : "PTA_REJECTED";

      // Update only if the PTA is still SENT.
      const updatedPta = await tx.ptaAgreement.updateMany({
        where: {
          id: pta.id,
          status: "SENT",
        },
        data: {
          status: newPtaStatus,
          clientDecisionAt: new Date(),
          clientRejectionReason:
            decision === "REJECT" ? rejectionReason!.trim() : null,
          clientRespondedById: auth.user.id,
        },
      });

      if (updatedPta.count !== 1) {
        throw new Error("DECISION_ALREADY_SUBMITTED");
      }

      await tx.serviceRequest.update({
        where: { id },
        data: {
          status: newRequestStatus,
        },
      });

      await tx.requestTimeline.create({
        data: {
          requestId: id,
          actorId: auth.user.id,
          status: newRequestStatus,
          remarks:
            decision === "ACCEPT"
              ? "Client accepted the Professional Training Agreement."
              : `Client rejected the Professional Training Agreement. Reason: ${rejectionReason!.trim()}`,
        },
      });

      return {
        decision,
        ptaStatus: newPtaStatus,
        requestStatus: newRequestStatus,
      };
    });

    return NextResponse.json({
      success: true,
      message:
        decision === "ACCEPT"
          ? "PTA accepted successfully."
          : "PTA rejected successfully. NLETA has been notified through the request timeline.",
      result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "REQUEST_NOT_FOUND") {
        return apiError("Request not found.", 404);
      }

      if (error.message === "PTA_NOT_AVAILABLE") {
        return apiError("PTA is not available for your decision.", 409);
      }

      if (error.message === "DECISION_ALREADY_SUBMITTED") {
        return apiError(
          "A decision has already been submitted for this PTA.",
          409
        );
      }
    }

    console.error("Client PTA Decision API Error:", error);

    return apiError("Unable to submit PTA decision.", 500);
  }
}
