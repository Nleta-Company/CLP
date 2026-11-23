
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

    return NextResponse.json(
      {
        success: true,
        stats,
        assignments: formattedAssignments,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
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
 * - Distributes client-submitted participants across batches.
 * - Copies participant details into BatchParticipant.
 * - Links batches to TrainerAssignment.
 * - Prevents duplicate participant creation.
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
        let copiedParticipantCount = 0;

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

              // Original participant details submitted by client.
              participantsDetails: {
                orderBy: {
                  createdAt: "asc",
                },
                select: {
                  id: true,
                  name: true,
                  email: true,
                  designation: true,
                  phone: true,
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
            const participantDetails =
              requestProgram.participantsDetails;

            if (
              !Number.isInteger(expectedBatches) ||
              expectedBatches < 1 ||
              !Number.isInteger(totalParticipants) ||
              totalParticipants < 0
            ) {
              throw new Error("INVALID_BATCH_CONFIGURATION");
            }

            // Do not create batches with missing client details.
            if (participantDetails.length !== totalParticipants) {
              throw new Error("PARTICIPANT_DETAILS_MISMATCH");
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
              // Distribute participants evenly between batches.
              const participantCount =
                baseParticipants +
                (batchNumber <= remainder ? 1 : 0);

              const startIndex =
                (batchNumber - 1) * baseParticipants +
                Math.min(batchNumber - 1, remainder);

              const batchParticipants = participantDetails.slice(
                startIndex,
                startIndex + participantCount
              );

              // Check whether batch already exists.
              const existingBatch = await tx.batch.findUnique({
                where: {
                  requestProgramId_batchNumber: {
                    requestProgramId: requestProgram.id,
                    batchNumber,
                  },
                },

                include: {
                  participantsList: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      phone: true,
                      designation: true,
                    },
                  },
                },
              });

              let batchId: string;
              let existingParticipantCount = 0;

              if (existingBatch) {
                // Never overwrite a batch assigned to another trainer.
                if (
                  existingBatch.trainerAssignmentId &&
                  existingBatch.trainerAssignmentId !== assignment.id
                ) {
                  throw new Error("BATCH_ALREADY_ASSIGNED");
                }

                // Link existing unassigned batch.
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

                batchId = existingBatch.id;
                existingParticipantCount =
                  existingBatch.participantsList.length;
              } else {
                // Create a new batch.
                const createdBatch = await tx.batch.create({
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

                batchId = createdBatch.id;
                createdBatchCount++;
              }

              // Existing participant records are not overwritten.
              // Copy only when the batch has no participants.
              if (existingParticipantCount === 0) {
                if (batchParticipants.length > 0) {
                  await tx.batchParticipant.createMany({
                    data: batchParticipants.map((participant) => ({
                      batchId,

                      name: participant.name,
                      email: participant.email,
                      phone: participant.phone,
                      designation: participant.designation,
                    })),
                  });

                  copiedParticipantCount += batchParticipants.length;
                }
              } else {
                // Check whether an existing batch has the expected
                // participant count. Do not silently leave it incomplete.
                if (existingParticipantCount !== participantCount) {
                  throw new Error("EXISTING_BATCH_PARTICIPANTS_MISMATCH");
                }
              }
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
                ? `Trainer accepted assignment ${assignment.id}. ${createdBatchCount} batches created, ${linkedBatchCount} existing batches linked and ${copiedParticipantCount} participant records copied.`
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
          copiedParticipantCount,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    return NextResponse.json(
      {
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

        participants: {
          copied: result.copiedParticipantCount,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
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

        PARTICIPANT_DETAILS_MISMATCH: {
          message:
            "Participant details are missing or do not match the requested participant count. Please check the client-submitted participant details.",
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

        EXISTING_BATCH_PARTICIPANTS_MISMATCH: {
          message:
            "An existing batch has an incomplete or incorrect participant list. Please reconcile its participant records before accepting this assignment.",
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
