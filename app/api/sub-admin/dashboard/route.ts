
import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);

    if (auth.response) return auth.response;

    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dashboardData = await prisma.$transaction(
      async (tx) => {
        // 1. Request statistics
        const totalRequests = await tx.serviceRequest.count();

        const newRequests = await tx.serviceRequest.count({
          where: { status: "SUBMITTED" },
        });

        const verificationRequests = await tx.serviceRequest.count({
          where: { status: "UNDER_REVIEW" },
        });

        const trainerAssignmentRequests =
          await tx.serviceRequest.count({
            where: { status: "TRAINER_ASSIGNMENT" },
          });

        const trainingRequests = await tx.serviceRequest.count({
          where: { status: "TRAINING" },
        });

        const completedRequests = await tx.serviceRequest.count({
          where: { status: "COMPLETED" },
        });

        // 2. Trainer statistics
        const activeTrainers = await tx.user.count({
          where: {
            role: "TRAINER",
            isActive: true,
          },
        });

        const activeAssignments = await tx.trainerAssignment.findMany({
          where: {
            status: {
              in: ["ASSIGNED", "ACCEPTED"],
            },
            trainer: {
              isActive: true,
            },
          },
          select: {
            trainerId: true,
          },
          distinct: ["trainerId"],
        });

        // 3. Recent service requests
        const recentRequests = await tx.serviceRequest.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: 6,
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                clientProfile: {
                  select: {
                    organisation: true,
                  },
                },
              },
            },
            programs: {
              include: {
                program: {
                  select: {
                    code: true,
                    title: true,
                    category: true,
                  },
                },
              },
            },
            trainerAssignments: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        });

        // 4. Today's activity
        const requestsProcessedToday =
          await tx.requestTimeline.count({
            where: {
              createdAt: {
                gte: today,
                lt: tomorrow,
              },
            },
          });

        const trainersAssignedToday =
          await tx.trainerAssignment.count({
            where: {
              assignedAt: {
                gte: today,
                lt: tomorrow,
              },
            },
          });

        const completedToday = await tx.serviceRequest.count({
          where: {
            status: "COMPLETED",
            updatedAt: {
              gte: today,
              lt: tomorrow,
            },
          },
        });

        // 5. Document workflow statistics
        const workflowTSO = await tx.serviceRequest.count({
          where: {
            status: {
              in: ["TSO_DRAFT", "TSO_SENT"],
            },
          },
        });

        const workflowPTA = await tx.serviceRequest.count({
          where: {
            status: {
              in: ["FTO_DRAFT", "FTO_SENT"],
            },
          },
        });

        const workflowPSGA = await tx.serviceRequest.count({
          where: {
            status: {
              in: ["PSGA_DRAFT", "PSGA_SENT"],
            },
          },
        });

        const workflowTAF = await tx.serviceRequest.count({
          where: {
            status: {
              in: ["TAF_DRAFT", "TAF_SENT"],
            },
          },
        });

        const workflowTrainer =
          await tx.trainerAssignment.count({
            where: {
              status: "ASSIGNED",
            },
          });

        // 6. Batch statistics
        const plannedBatches = await tx.batch.count({
          where: {
            status: "PLANNED",
          },
        });

        const inProgressBatches = await tx.batch.count({
          where: {
            status: "IN_PROGRESS",
          },
        });

        const completedBatches = await tx.batch.count({
          where: {
            status: "COMPLETED",
          },
        });

        return {
          totalRequests,
          newRequests,
          verificationRequests,
          trainerAssignmentRequests,
          trainingRequests,
          completedRequests,
          activeTrainers,
          activeAssignments,
          recentRequests,
          requestsProcessedToday,
          trainersAssignedToday,
          completedToday,
          workflowTSO,
          workflowPTA,
          workflowPSGA,
          workflowTAF,
          workflowTrainer,
          plannedBatches,
          inProgressBatches,
          completedBatches,
        };
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    const assignedTrainerCount =
      dashboardData.activeAssignments.length;

    const trainersWithoutActiveAssignments = Math.max(
      0,
      dashboardData.activeTrainers - assignedTrainerCount
    );

    return NextResponse.json(
      {
        success: true,

        stats: {
          totalRequests: dashboardData.totalRequests,
          newRequests: dashboardData.newRequests,
          verificationRequests: dashboardData.verificationRequests,
          trainerAssignmentRequests:
            dashboardData.trainerAssignmentRequests,
          trainingRequests: dashboardData.trainingRequests,
          completedRequests: dashboardData.completedRequests,
        },

        workflow: {
          verification: dashboardData.verificationRequests,
          tso: dashboardData.workflowTSO,
          pta: dashboardData.workflowPTA,
          psga: dashboardData.workflowPSGA,
          taf: dashboardData.workflowTAF,
          trainer: dashboardData.workflowTrainer,
          training:
            dashboardData.plannedBatches +
            dashboardData.inProgressBatches,
          reports: dashboardData.completedRequests,
        },

        today: {
          requestsProcessed: dashboardData.requestsProcessedToday,
          trainersAssigned: dashboardData.trainersAssignedToday,
          completedRequests: dashboardData.completedToday,
        },

        trainers: {
          active: dashboardData.activeTrainers,
          withActiveAssignments: assignedTrainerCount,
          withoutActiveAssignments:
            trainersWithoutActiveAssignments,
        },

        batches: {
          planned: dashboardData.plannedBatches,
          inProgress: dashboardData.inProgressBatches,
          completed: dashboardData.completedBatches,
          total:
            dashboardData.plannedBatches +
            dashboardData.inProgressBatches +
            dashboardData.completedBatches,
        },

        recentRequests: dashboardData.recentRequests,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Sub Admin Dashboard API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard data.",
      },
      { status: 500 }
    );
  }
}
