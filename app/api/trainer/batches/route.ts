
import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiRole(["TRAINER"]);
    if (auth.response) return auth.response;

    const trainerId = auth.user.id;

    const assignmentId =
      request.nextUrl.searchParams.get("assignmentId")?.trim() || null;

    const batches = await prisma.batch.findMany({
      where: {
        status: { not: "CANCELLED" },
        trainerAssignment: {
          is: {
            ...(assignmentId ? { id: assignmentId } : {}),
            trainerId,
            status: { in: ["ACCEPTED", "COMPLETED"] },
          },
        },
      },

      include: {
        // Training programme and client request
        requestProgram: {
          include: {
            program: true,

            request: {
              include: {
                // Client account and profile
                client: {
                  include: {
                    clientProfile: true,
                  },
                },

                // Agreement documents
                ptaAgreement: true,
                tafAgreement: true,

                // Final Training Offer
                finalTrainingOffer: {
                  include: {
                    programs: true,
                    paymentInstallments: true,
                  },
                },
              },
            },
          },
        },

        // Trainer and assignment information
        trainerAssignment: {
          include: {
            trainer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            assignedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        // Actual registered participants
        participantsList: {
          include: {
            attendanceRecords: {
              orderBy: {
                attendanceDate: "desc",
              },
              take: 10,
              select: {
                attendanceDate: true,
                status: true,
                remarks: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
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
        { createdAt: "desc" },
      ],
    });

    const stats = {
      total: batches.length,
      planned: batches.filter((b) => b.status === "PLANNED").length,
      inProgress: batches.filter((b) => b.status === "IN_PROGRESS").length,
      completed: batches.filter((b) => b.status === "COMPLETED").length,
      cancelled: batches.filter((b) => b.status === "CANCELLED").length,
    };

    return NextResponse.json({
      success: true,
      assignmentId,
      batches,
      stats,
    });
  } catch (error) {
    console.error("Trainer Batches GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch trainer batches.",
      },
      { status: 500 }
    );
  }
}
