
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/api-authorization";

export async function GET() {
  try {
    // Admin authentication
    const auth = await requireApiRole(["ADMIN"]);

    if (auth.response) {
      return auth.response;
    }

    const now = new Date();

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    // 1. Pending Service Requests
    const pendingRequests = await prisma.serviceRequest.count({
      where: {
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW"],
        },
      },
    });

    // 2. Pending Client Approvals
    const pendingApprovals = await prisma.serviceRequest.count({
      where: {
        status: {
          in: ["TSO_SENT", "FTO_SENT", "PTA_SENT", "TAF_SENT"],
        },
      },
    });

    // 3. Pending Payment Verification
    const paymentVerification = await prisma.paymentSubmission.count({
      where: {
        status: "PENDING",
      },
    });

    // 4. Active Clients
    const activeClients = await prisma.user.count({
      where: {
        role: "CLIENT",
        isActive: true,
      },
    });

    // 5. Active Trainers
    const activeTrainers = await prisma.user.count({
      where: {
        role: "TRAINER",
        isActive: true,
      },
    });

    // 6. Active Service Requests
    const activeRequests = await prisma.serviceRequest.count({
      where: {
        status: {
          in: [
            "SUBMITTED",
            "UNDER_REVIEW",
            "REQUEST_ACCEPTED",
            "TSO_DRAFT",
            "TSO_SENT",
            "TSO_ACCEPTED",
            "FTO_DRAFT",
            "FTO_SENT",
            "FTO_ACCEPTED",
            "PAYMENT_PENDING",
            "PAYMENT_SUBMITTED",
            "PAYMENT_VERIFICATION",
            "PAYMENT_VERIFIED",
            "PTA_SENT",
            "PTA_ACCEPTED",
            "TAF_DRAFT",
            "TAF_SENT",
            "TAF_ACCEPTED",
            "TRAINER_ASSIGNMENT",
            "TRAINING",
          ],
        },
      },
    });

    // 7. Completed Requests This Month
    const completedThisMonth = await prisma.serviceRequest.count({
      where: {
        status: "COMPLETED",
        updatedAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
    });

    // 8. Total Batches
    const totalBatches = await prisma.batch.count();

    // 9. Total Participants
    const totalParticipants = await prisma.batchParticipant.count();

    // 10. Total ATR-01 Reports
    const totalAtrReports = await prisma.atrReport.count();

    // 11. Recent Request Activity
    const recentActivity = await prisma.requestTimeline.findMany({
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        remarks: true,
        createdAt: true,
        actor: {
          select: {
            name: true,
          },
        },
        request: {
          select: {
            requestNumber: true,
            organisation: true,
          },
        },
      },
    });

    // Actual database response
    const dashboardData = {
      pendingRequests,
      pendingApprovals,
      paymentVerification,
      activeClients,
      activeTrainers,
      activeRequests,
      completedThisMonth,
      totalBatches,
      totalParticipants,
      totalAtrReports,
      recentActivity,
    };

    return NextResponse.json(
      {
        success: true,
        data: dashboardData,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("ADMIN_DASHBOARD_API_ERROR:", error);

    const debugMessage =
      error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load admin dashboard data.",
        ...(process.env.NODE_ENV === "development"
          ? { debug: debugMessage }
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
