
import { NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// ==========================================
// GET: FETCH LOGGED-IN TRAINER'S BATCHES
// ==========================================

export async function GET() {
  try {
    const auth = await requireApiRole(["TRAINER"]);

    if (auth.response) return auth.response;

    const batches = await prisma.batch.findMany({
      where: {
        trainerAssignment: {
          is: {
            trainerId: auth.user.id,
            status: {
              in: ["ACCEPTED", "COMPLETED"],
            },
          },
        },
      },
      include: {
        requestProgram: {
          include: {
            program: true,
            request: {
              select: {
                id: true,
                requestNumber: true,
                organisation: true,
                trainingLocation: true,
                preferredDate: true,
                alternateDate: true,
                contactName: true,
                phone: true,
                email: true,
                client: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
                tafAgreement: {
                  select: {
                    tafNumber: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
        trainerAssignment: {
          include: {
            trainer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { startDate: "asc" },
        { batchNumber: "asc" },
      ],
    });

    const stats = {
      total: batches.length,

      planned: batches.filter(
        (item) => item.status === "PLANNED"
      ).length,

      inProgress: batches.filter(
        (item) => item.status === "IN_PROGRESS"
      ).length,

      completed: batches.filter(
        (item) => item.status === "COMPLETED"
      ).length,

      cancelled: batches.filter(
        (item) => item.status === "CANCELLED"
      ).length,
    };

    return NextResponse.json({
      success: true,
      stats,
      batches,
    });
  } catch (error) {
    console.error("Trainer Batches GET API Error:", error);

    return apiError(
      "Unable to fetch your training batches.",
      500
    );
  }
}
