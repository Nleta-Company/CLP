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
  return NextResponse.json({ success: false, message }, { status });
}

/**
 * Client decision for a sent TAF.
 * A decision is accepted only once, while the TAF remains SENT.
 */
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
          tafAgreement: true,
        },
      });

      if (!serviceRequest) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      const taf = serviceRequest.tafAgreement;

      if (!taf || taf.status !== "SENT") {
        throw new Error("TAF_NOT_AVAILABLE");
      }

      const newTafStatus = decision === "ACCEPT" ? "ACCEPTED" : "REJECTED";
      const newRequestStatus =
        decision === "ACCEPT" ? "TAF_ACCEPTED" : "TAF_REJECTED";

      // Update only if the TAF is still SENT to prevent duplicate decisions.
      const updatedTaf = await tx.tafAgreement.updateMany({
        where: {
          id: taf.id,
          status: "SENT",
        },
        data: {
          status: newTafStatus,
          clientDecisionAt: new Date(),
          clientRejectionReason:
            decision === "REJECT" ? rejectionReason!.trim() : null,
          clientRespondedById: auth.user.id,
        },
      });

      if (updatedTaf.count !== 1) {
        throw new Error("DECISION_ALREADY_SUBMITTED");
      }

      await tx.serviceRequest.update({
        where: { id },
        data: { status: newRequestStatus },
      });

      await tx.requestTimeline.create({
        data: {
          requestId: id,
          actorId: auth.user.id,
          status: newRequestStatus,
          remarks:
            decision === "ACCEPT"
              ? "Client accepted the Training Activation Form."
              : `Client rejected the Training Activation Form. Reason: ${rejectionReason!.trim()}`,
        },
      });

      return {
        decision,
        tafStatus: newTafStatus,
        requestStatus: newRequestStatus,
      };
    });

    return NextResponse.json({
      success: true,
      message:
        decision === "ACCEPT"
          ? "TAF accepted successfully. Trainer assignment can proceed."
          : "TAF rejected successfully. NLETA has been notified through the request timeline.",
      result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "REQUEST_NOT_FOUND") {
        return apiError("Request not found.", 404);
      }

      if (error.message === "TAF_NOT_AVAILABLE") {
        return apiError("TAF is not available for your decision.", 409);
      }

      if (error.message === "DECISION_ALREADY_SUBMITTED") {
        return apiError(
          "A decision has already been submitted for this TAF.",
          409
        );
      }
    }

    console.error("Client TAF Decision API Error:", error);
    return apiError("Unable to submit TAF decision.", 500);
  }
}
