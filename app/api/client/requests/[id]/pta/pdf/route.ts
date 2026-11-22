import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";
import PtaDocument from "@/lib/pta/pta-document";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["CLIENT"]);
    if (auth.response) return auth.response;

    const { id } = await context.params;

    // Allow the owning client to view the PTA after it has been sent,
    // including after the client has accepted or rejected it.
    const pta = await prisma.ptaAgreement.findFirst({
      where: {
        requestId: id,
        status: {
          in: ["SENT", "ACCEPTED", "REJECTED"],
        },
        request: {
          is: {
            clientId: auth.user.id,
          },
        },
      },
      include: {
        request: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                clientProfile: true,
              },
            },
          },
        },
      },
    });

    if (!pta) {
      return apiError(
        "PTA not found, does not belong to your account, or has not been sent yet.",
        404
      );
    }

    const serviceRequest = pta.request;
    const client = serviceRequest.client;
    const profile = client.clientProfile;

    if (!pta.effectiveDate) {
      return apiError(
        "PTA effective date is not available. Please contact NLETA.",
        409
      );
    }

    const organisation =
      serviceRequest.organisation || profile?.organisation || "";

    const billingAddress =
      serviceRequest.billingAddress || profile?.address || "";

    const gstin =
      serviceRequest.gstin || profile?.gstin || null;

    const contactName =
      serviceRequest.contactName ||
      profile?.contactName ||
      client.name ||
      "";

    const designation =
      serviceRequest.designation || profile?.designation || null;

    const email =
      serviceRequest.email || client.email || "";

    const phone =
      serviceRequest.phone || profile?.phone || "";

    if (!organisation || !billingAddress || !contactName || !email || !phone) {
      return apiError(
        "Client details required for the PTA PDF are incomplete. Please contact NLETA.",
        409
      );
    }

    // Use saved PTA information. Do not update the agreement or workflow status.
    const documentData = {
      ptaNumber: pta.ptaNumber,
      effectiveDate: pta.effectiveDate,
      generatedAt: pta.generatedAt,
      client: {
        organisation,
        billingAddress,
        gstin,
        contactName,
        designation,
        email,
        phone,
      },
    };

    const pdfElement = React.createElement(PtaDocument, {
      data: documentData,
    }) as unknown as Parameters<typeof renderToBuffer>[0];

    const pdfBuffer = await renderToBuffer(pdfElement);
    const filename = `${pta.ptaNumber.replace(/[^\w.-]/g, "-")}.pdf`;
    const download = request.nextUrl.searchParams.get("download") === "1";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Client PTA PDF API Error:", error);

    return apiError(
      "Unable to generate PTA PDF. Please try again.",
      500
    );
  }
}
