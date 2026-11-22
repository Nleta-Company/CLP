
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

export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        // Only Sub Admin can generate/preview PTA PDF.
        const auth = await requireApiRole(["SUB_ADMIN"]);

        if (auth.response) return auth.response;

        const { id } = await context.params;

        // Read effective date selected by Sub Admin.
        let body: { effectiveDate?: string };

        try {
            body = await request.json();
        } catch {
            return apiError("Please provide a valid effective date.");
        }

        const effectiveDateInput = body.effectiveDate;

        let effectiveDate: Date | null = null;

        if (effectiveDateInput) {
            const parsedDate = new Date(effectiveDateInput);

            if (Number.isNaN(parsedDate.getTime())) {
                return apiError("Invalid effective date.");
            }

            effectiveDate = parsedDate;
        }

        // Fetch PTA and related client/request details.
        const pta = await prisma.ptaAgreement.findUnique({
            where: {
                requestId: id,
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
                "PTA has not been generated for this request.",
                404
            );
        }

        const serviceRequest = pta.request;
        const client = serviceRequest.client;
        const profile = client.clientProfile;

        // Save the selected date, or use the previously saved date.
        const finalEffectiveDate =
            effectiveDate ?? pta.effectiveDate;

        if (!finalEffectiveDate) {
            return apiError(
                "Effective date is required before generating the PTA PDF."
            );
        }

        if (effectiveDate) {
            await prisma.ptaAgreement.update({
                where: {
                    id: pta.id,
                },
                data: {
                    effectiveDate: finalEffectiveDate,
                },
            });
        }

        // Prefer service-request details, then client profile details.
        const organisation =
            serviceRequest.organisation ||
            profile?.organisation ||
            "";

        const billingAddress =
            serviceRequest.billingAddress ||
            profile?.address ||
            "";

        const gstin =
            serviceRequest.gstin ||
            profile?.gstin ||
            null;

        const contactName =
            serviceRequest.contactName ||
            profile?.contactName ||
            client.name ||
            "";

        const designation =
            serviceRequest.designation ||
            profile?.designation ||
            null;

        const email =
            serviceRequest.email ||
            client.email ||
            "";

        const phone =
            serviceRequest.phone ||
            profile?.phone ||
            "";

        if (!organisation || !billingAddress || !contactName || !email || !phone) {
            return apiError(
                "Client details are incomplete. Please update the client/service request details before generating the PTA."
            );
        }

        // Prepare data for the PTA document.
        const documentData = {
            ptaNumber: pta.ptaNumber,
            effectiveDate: finalEffectiveDate,
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

        // Generate PDF on the server.
        const pdfElement = React.createElement(PtaDocument, {
            data: documentData,
        }) as unknown as Parameters<typeof renderToBuffer>[0];

        const pdfBuffer = await renderToBuffer(pdfElement);

        const pdfBytes = new Uint8Array(pdfBuffer);

        const filename = `${pta.ptaNumber.replace(/\//g, "-")}.pdf`;

        const download = request.nextUrl.searchParams.get("download") === "1";

        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
                "Cache-Control": "private, no-store, max-age=0",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        console.error("PTA PDF generation error:", error);

        return apiError(
            "Unable to generate PTA PDF. Please try again.",
            500
        );
    }
}
