
import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

/**
 * GET:
 * Fetch assignments for the logged-in trainer.
 */
export async function GET() {
  try {
    const auth = await requireApiRole(["TRAINER"]);

    if (auth.response) return auth.response;

    const assignments = await prisma.trainerAssignment.findMany({
      where: {
        trainerId: auth.user.id,
      },
      include: {
        request: {
          select: {
            id: true,
            requestNumber: true,
            status: true,
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

            programs: {
              include: {
                program: {
                  select: {
                    id: true,
                    code: true,
                    title: true,
                    category: true,
                    audience: true,
                    duration: true,
                    mode: true,
                  },
                },
              },
            },

            tafAgreement: {
              select: {
                tafNumber: true,
                status: true,
                clientDecisionAt: true,
              },
            },
          },
        },

        requestProgram: {
          include: {
            program: {
              select: {
                id: true,
                code: true,
                title: true,
                category: true,
                audience: true,
                duration: true,
                mode: true,
              },
            },
          },
        },

        assignedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        assignedAt: "desc",
      },
    });

    const formattedAssignments = assignments.map((assignment) => {
      const isEntireRequest = !assignment.requestProgramId;

      return {
        ...assignment,

        assignmentScope: isEntireRequest
          ? "ENTIRE_REQUEST"
          : "SPECIFIC_PROGRAMME",

        assignedPrograms: isEntireRequest
          ? assignment.request.programs
          : assignment.request.programs.filter(
              (item) => item.id === assignment.requestProgramId
            ),
      };
    });

    const stats = {
      total: assignments.length,

      pending: assignments.filter(
        (item) => item.status === "ASSIGNED"
      ).length,

      accepted: assignments.filter(
        (item) => item.status === "ACCEPTED"
      ).length,

      rejected: assignments.filter(
        (item) => item.status === "REJECTED"
      ).length,

      completed: assignments.filter(
        (item) => item.status === "COMPLETED"
      ).length,
    };

    return NextResponse.json({
      success: true,
      stats,
      assignments: formattedAssignments,
    });
  } catch (error) {
    console.error("Trainer Assignments Fetch API Error:", error);

    return apiError("Unable to fetch trainer assignments.", 500);
  }
}

/**
 * PATCH:
 * Trainer accepts or rejects an assignment.
 *
 * On ACCEPT:
 * - Automatically creates batches.
 * - Uses expectedBatches from RequestProgram.
 * - Distributes participant count across batches.
 * - Links batches to TrainerAssignment.
 * - Prevents duplicate batch creation.
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireApiRole(["TRAINER"]);

    if (auth.response) return auth.response;

    let body: {
      assignmentId?: string;
      decision?: string;
      remarks?: string;
    };

    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON request body.");
    }

    const { assignmentId, decision, remarks } = body;

    if (
      typeof assignmentId !== "string" ||
      !assignmentId.trim()
    ) {
      return apiError("Assignment ID is required.");
    }

    if (decision !== "ACCEPT" && decision !== "REJECT") {
      return apiError("Decision must be ACCEPT or REJECT.");
    }

    if (remarks !== undefined && typeof remarks !== "string") {
      return apiError("Invalid remarks.");
    }

    if (
      decision === "REJECT" &&
      (!remarks || remarks.trim().length < 10)
    ) {
      return apiError(
        "Please provide a rejection reason of at least 10 characters."
      );
    }

    if (remarks && remarks.trim().length > 1000) {
      return apiError("Remarks cannot exceed 1000 characters.");
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Verify assignment belongs to logged-in trainer.
        const assignment = await tx.trainerAssignment.findFirst({
          where: {
            id: assignmentId.trim(),
            trainerId: auth.user.id,
          },
        });

        if (!assignment) {
          throw new Error("ASSIGNMENT_NOT_FOUND");
        }

        if (assignment.status !== "ASSIGNED") {
          throw new Error("INVALID_ASSIGNMENT_STATUS");
        }

        // 2. Update assignment status.
        const updated = await tx.trainerAssignment.updateMany({
          where: {
            id: assignment.id,
            trainerId: auth.user.id,
            status: "ASSIGNED",
          },

          data: {
            status:
              decision === "ACCEPT"
                ? "ACCEPTED"
                : "REJECTED",

            remarks:
              decision === "REJECT"
                ? remarks!.trim()
                : remarks?.trim() || assignment.remarks,
          },
        });

        if (updated.count !== 1) {
          throw new Error("INVALID_ASSIGNMENT_STATUS");
        }

        let createdBatchCount = 0;
        let linkedBatchCount = 0;

        // 3. Automatically generate batches after acceptance.
        if (decision === "ACCEPT") {
          const requestPrograms = await tx.requestProgram.findMany({
            where: {
              requestId: assignment.requestId,

              ...(assignment.requestProgramId
                ? { id: assignment.requestProgramId }
                : {}),
            },
            include: {
              request: {
                select: {
                  preferredDate: true,
                  alternateDate: true,
                  trainingLocation: true,
                },
              },
            },
          });

          if (!requestPrograms.length) {
            throw new Error("REQUEST_PROGRAMS_NOT_FOUND");
          }

          for (const requestProgram of requestPrograms) {
            const totalParticipants = requestProgram.participants;
            const expectedBatches = requestProgram.expectedBatches;

            if (
              !Number.isInteger(expectedBatches) ||
              expectedBatches < 1 ||
              !Number.isInteger(totalParticipants) ||
              totalParticipants < 0
            ) {
              throw new Error("INVALID_BATCH_CONFIGURATION");
            }

            // If a specific batch was assigned, process only that batch.
            const batchNumbers =
              assignment.requestProgramId && assignment.batchNumber
                ? [assignment.batchNumber]
                : Array.from(
                    { length: expectedBatches },
                    (_, index) => index + 1
                  );

            if (
              batchNumbers.some(
                (number) =>
                  !Number.isInteger(number) ||
                  number < 1 ||
                  number > expectedBatches
              )
            ) {
              throw new Error("INVALID_ASSIGNED_BATCH_NUMBER");
            }

            const baseParticipants = Math.floor(
              totalParticipants / expectedBatches
            );

            const remainder =
              totalParticipants % expectedBatches;

            for (const batchNumber of batchNumbers) {
              const existingBatch = await tx.batch.findUnique({
                where: {
                  requestProgramId_batchNumber: {
                    requestProgramId: requestProgram.id,
                    batchNumber,
                  },
                },
              });

              if (existingBatch) {
                // Never overwrite a batch assigned to another trainer.
                if (
                  existingBatch.trainerAssignmentId &&
                  existingBatch.trainerAssignmentId !== assignment.id
                ) {
                  throw new Error("BATCH_ALREADY_ASSIGNED");
                }

                // Link an existing unassigned batch to this assignment.
                if (!existingBatch.trainerAssignmentId) {
                  await tx.batch.update({
                    where: {
                      id: existingBatch.id,
                    },
                    data: {
                      trainerAssignmentId: assignment.id,
                    },
                  });

                  linkedBatchCount++;
                }

                continue;
              }

              const participantCount =
                baseParticipants +
                (batchNumber <= remainder ? 1 : 0);

              await tx.batch.create({
                data: {
                  requestProgramId: requestProgram.id,
                  trainerAssignmentId: assignment.id,

                  batchNumber,
                  participants: participantCount,

                  startDate:
                    requestProgram.request.preferredDate ||
                    requestProgram.request.alternateDate ||
                    null,

                  mode: requestProgram.preferredMode,

                  location:
                    requestProgram.request.trainingLocation,

                  status: "PLANNED",

                  createdById: auth.user.id,
                },
              });

              createdBatchCount++;
            }
          }
        }

        // 4. Add entry to request timeline.
        await tx.requestTimeline.create({
          data: {
            requestId: assignment.requestId,
            actorId: auth.user.id,
            status: "TRAINER_ASSIGNMENT",

            remarks:
              decision === "ACCEPT"
                ? `Trainer accepted assignment ${assignment.id}. ${createdBatchCount} batches created and ${linkedBatchCount} existing batches linked.`
                : `Trainer rejected assignment ${assignment.id}. Reason: ${remarks!.trim()}`,
          },
        });

        // 5. Return updated assignment.
        return {
          assignment: await tx.trainerAssignment.findUnique({
            where: {
              id: assignment.id,
            },

            include: {
              request: {
                select: {
                  requestNumber: true,
                  organisation: true,

                  programs: {
                    include: {
                      program: true,
                    },
                  },
                },
              },

              requestProgram: {
                include: {
                  program: true,
                },
              },
            },
          }),

          createdBatchCount,
          linkedBatchCount,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    return NextResponse.json({
      success: true,

      message:
        decision === "ACCEPT"
          ? "Assignment accepted and batches generated successfully."
          : "Assignment rejected successfully.",

      assignment: result.assignment,

      batches: {
        created: result.createdBatchCount,
        linked: result.linkedBatchCount,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      const known: Record<
        string,
        { message: string; status: number }
      > = {
        ASSIGNMENT_NOT_FOUND: {
          message: "Assignment not found.",
          status: 404,
        },

        INVALID_ASSIGNMENT_STATUS: {
          message:
            "This assignment has already been accepted, rejected or updated.",
          status: 409,
        },

        REQUEST_PROGRAMS_NOT_FOUND: {
          message: "No programmes found for this request.",
          status: 400,
        },

        INVALID_BATCH_CONFIGURATION: {
          message:
            "Invalid participant count or expected batch configuration.",
          status: 400,
        },

        INVALID_ASSIGNED_BATCH_NUMBER: {
          message:
            "The assigned batch number is outside the expected batch range.",
          status: 400,
        },

        BATCH_ALREADY_ASSIGNED: {
          message:
            "One or more batches are already assigned to another trainer.",
          status: 409,
        },
      };

      const knownError = known[error.message];

      if (knownError) {
        return apiError(
          knownError.message,
          knownError.status
        );
      }
    }

    console.error(
      "Trainer Assignment Decision API Error:",
      error
    );

    return apiError("Unable to update trainer assignment.", 500);
  }
}
