
import { NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);

    if (auth.response) return auth.response;

    const [requests, totalTrainers] = await Promise.all([
      prisma.serviceRequest.findMany({
        where: {
          status: {
            in: ["TAF_ACCEPTED", "TRAINER_ASSIGNMENT"],
          },
          tafAgreement: {
            is: {
              status: "ACCEPTED",
            },
          },
        },
        include: {
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
              clientDecisionAt: true,
            },
          },
          programs: {
            include: {
              program: {
                select: {
                  code: true,
                  title: true,
                },
              },
            },
          },
          trainerAssignments: {
            include: {
              trainer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              requestProgram: {
                include: {
                  program: {
                    select: {
                      code: true,
                      title: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              assignedAt: "desc",
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),

      prisma.user.count({
        where: {
          role: "TRAINER",
          isActive: true,
        },
      }),
    ]);

    // Requests without any trainer assignment.
    const pendingCount = requests.filter(
      (item) => item.trainerAssignments.length === 0
    ).length;

    // Requests where every assignment has been rejected.
    const rejectedCount = requests.filter((item) => {
      const assignments = item.trainerAssignments;

      return (
        assignments.length > 0 &&
        assignments.every(
          (assignment) => assignment.status === "REJECTED"
        )
      );
    }).length;

    // Requests having at least one non-rejected assignment.
    const assignedCount = requests.filter((item) => {
      const assignments = item.trainerAssignments;

      return (
        assignments.length > 0 &&
        !assignments.every(
          (assignment) => assignment.status === "REJECTED"
        )
      );
    }).length;

    // Return assignment history, including rejection remarks.
    const formattedRequests = requests.map((item) => {
      const assignments = item.trainerAssignments;

      const allAssignmentsRejected =
        assignments.length > 0 &&
        assignments.every(
          (assignment) => assignment.status === "REJECTED"
        );

      return {
        ...item,

        // Keep all old and new assignment records.
        trainerAssignments: assignments,

        // Useful status flags for frontend filtering.
        hasAssignments: assignments.length > 0,
        allAssignmentsRejected,
        canReassign: allAssignmentsRejected,
      };
    });

    return NextResponse.json({
      success: true,

      stats: {
        totalRequests: requests.length,
        pendingCount,
        assignedCount,
        rejectedCount,
        totalTrainers,
      },

      requests: formattedRequests,
    });
  } catch (error) {
    console.error("Trainer Assignment List API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch trainer assignment requests.",
      },
      { status: 500 }
    );
  }
}
