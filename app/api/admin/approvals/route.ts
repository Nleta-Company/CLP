
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/api-authorization";

export async function GET() {
  try {
    const auth = await requireApiRole(["ADMIN"]);

    if (auth.response) return auth.response;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Pending payment submissions
    const payments = await prisma.paymentSubmission.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        amountPaid: true,
        status: true,
        createdAt: true,
        submittedBy: {
          select: { name: true },
        },
        installment: {
          select: {
            fto: {
              select: {
                request: {
                  select: {
                    requestNumber: true,
                    organisation: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // ATR-01 reports awaiting review
    const reports = await prisma.atrReport.findMany({
      where: {
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW"],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        reportNumber: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: { name: true },
        },
        trainerAssignment: {
          select: {
            request: {
              select: {
                requestNumber: true,
                organisation: true,
              },
            },
          },
        },
      },
    });

    // Actual approved records this month
    const approvedPayments = await prisma.paymentSubmission.count({
      where: {
        status: "VERIFIED",
        reviewedAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
    });

    const approvedReports = await prisma.atrReport.count({
      where: {
        status: "APPROVED",
        reviewedAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
    });

    // Actual rejected / returned records this month
    const rejectedPayments = await prisma.paymentSubmission.count({
      where: {
        status: "REJECTED",
        reviewedAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
    });

    const returnedReports = await prisma.atrReport.count({
      where: {
        status: "RETURNED_FOR_CORRECTION",
        reviewedAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
    });

    const paymentItems = payments.map((payment) => {
      const request = payment.installment.fto.request;

      return {
        id: payment.id,
        reference: request.requestNumber,
        type: "PAYMENT_VERIFICATION",
        title: "Payment Verification",
        client: request.organisation || "Organisation not specified",
        submittedBy: payment.submittedBy.name,
        amount: Number(payment.amountPaid),
        status: payment.status,
        submittedAt: payment.createdAt,
      };
    });

    const reportItems = reports.map((report) => {
      const request = report.trainerAssignment.request;

      return {
        id: report.id,
        reference: report.reportNumber,
        type: "ATR_REPORT",
        title: "ATR-01 Report Review",
        client: request.organisation || "Organisation not specified",
        submittedBy: report.createdBy.name,
        amount: null,
        status: report.status,
        submittedAt: report.createdAt,
      };
    });

    const items = [...paymentItems, ...reportItems]
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime()
      )
      .slice(0, 50);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalPending: paymentItems.length + reportItems.length,
          pendingPayments: payments.length,
          pendingReports: reports.length,
          approvedThisMonth: approvedPayments + approvedReports,
          returnedThisMonth: rejectedPayments + returnedReports,
          items,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("ADMIN_APPROVALS_API_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load approval records.",
        ...(process.env.NODE_ENV === "development"
          ? {
              debug:
                error instanceof Error ? error.message : String(error),
            }
          : {}),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
