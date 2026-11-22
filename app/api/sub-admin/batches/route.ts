
import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// ==========================================
// GET: FETCH ALL BATCHES FOR SUB ADMIN
// ==========================================


export async function GET() {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);

    if (auth.response) return auth.response;

    const [batches, requestPrograms] = await Promise.all([
      prisma.batch.findMany({
        include: {
          requestProgram: {
            include: {
              program: true,
              request: {
                select: {
                  id: true,
                  requestNumber: true,
                  organisation: true,
                  status: true,
                  trainingLocation: true,
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
          participantsList: {
            orderBy: { createdAt: "asc" },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { createdAt: "desc" },
          { batchNumber: "asc" },
        ],
      }),

      prisma.requestProgram.findMany({
        where: {
          request: {
            is: {
              tafAgreement: {
                is: {
                  status: "ACCEPTED",
                },
              },
            },
          },
        },
        include: {
          program: true,
          batches: {
            orderBy: {
              batchNumber: "asc",
            },
          },
          trainerAssignments: {
            where: {
              status: "ACCEPTED",
            },
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
          request: {
            select: {
              id: true,
              requestNumber: true,
              organisation: true,
              trainingLocation: true,
              trainerAssignmentMode: true,
              tafAgreement: {
                select: {
                  tafNumber: true,
                  status: true,
                },
              },
              trainerAssignments: {
                where: {
                  status: "ACCEPTED",
                  requestProgramId: null,
                },
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
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const eligiblePrograms = requestPrograms.map((item) => {
      const isSingle =
        item.request.trainerAssignmentMode === "SINGLE";

      const acceptedAssignments = isSingle
        ? item.request.trainerAssignments
        : item.trainerAssignments;

      const remainingParticipants =
        item.participants -
        item.batches.reduce(
          (total, batch) => total + batch.participants,
          0
        );

      return {
        ...item,
        acceptedAssignments,
        remainingParticipants: Math.max(
          0,
          remainingParticipants
        ),
        remainingBatches: Math.max(
          0,
          item.expectedBatches - item.batches.length
        ),
        canCreateBatch:
          acceptedAssignments.length > 0 &&
          remainingParticipants > 0 &&
          item.batches.length < item.expectedBatches,
      };
    });

    return NextResponse.json({
      success: true,

      stats: {
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
      },

      batches,
      eligiblePrograms,
    });
  } catch (error) {
    console.error("Sub Admin Batch GET Error:", error);

    return apiError("Unable to fetch batches.", 500);
  }
}

// ==========================================
// POST: CREATE A NEW BATCH
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);

    if (auth.response) return auth.response;

    let body: {
      requestProgramId?: string;
      batchNumber?: number;
      participants?: number;
      participantDetails?: {
        name?: string;
        email?: string | null;
        phone?: string | null;
        employeeId?: string | null;
      }[];
      startDate?: string | null;
      endDate?: string | null;
      mode?: string;
      location?: string | null;
    };

    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON request body.");
    }

    const {
      requestProgramId,
      batchNumber,
      participants,
      participantDetails,
      startDate,
      endDate,
      mode,
      location,
    } = body;

    // Basic validation
    if (!requestProgramId) {
      return apiError("Request programme ID is required.");
    }

    if (
      !Number.isInteger(batchNumber) ||
      !batchNumber ||
      batchNumber < 1
    ) {
      return apiError("Enter a valid batch number.");
    }

    if (!Array.isArray(participantDetails) || participantDetails.length < 1) {
      return apiError("Add at least one participant.");
    }

    const cleanedParticipants = participantDetails.map((participant) => ({
      name: typeof participant.name === "string" ? participant.name.trim() : "",
      email: typeof participant.email === "string" ? participant.email.trim() : "",
      phone: typeof participant.phone === "string" ? participant.phone.trim() : "",
      employeeId: typeof participant.employeeId === "string" ? participant.employeeId.trim() : "",
    }));

    if (cleanedParticipants.some((participant) => !participant.name)) {
      return apiError("Participant name is required for every row.");
    }

    const invalidEmail = cleanedParticipants.find(
      (participant) => participant.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email)
    );
    if (invalidEmail) {
      return apiError("Enter a valid email address for every participant.");
    }

    const participantsCount = cleanedParticipants.length;

    if (participants !== undefined && participants !== participantsCount) {
      return apiError("Participant count does not match the participant details.");
    }

    if (!mode || !["ON", "HY", "OF"].includes(mode)) {
      return apiError("Select a valid training mode.");
    }

    const parsedStartDate = startDate
      ? new Date(startDate)
      : null;

    const parsedEndDate = endDate
      ? new Date(endDate)
      : null;

    if (
      parsedStartDate &&
      Number.isNaN(parsedStartDate.getTime())
    ) {
      return apiError("Invalid training start date.");
    }

    if (
      parsedEndDate &&
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return apiError("Invalid training end date.");
    }

    if (
      parsedStartDate &&
      parsedEndDate &&
      parsedEndDate < parsedStartDate
    ) {
      return apiError(
        "End date cannot be earlier than start date."
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find the selected programme and its parent request.
      const requestProgram = await tx.requestProgram.findUnique({
        where: {
          id: requestProgramId,
        },
        include: {
          program: true,
          request: {
            include: {
              tafAgreement: true,
            },
          },
          batches: true,
        },
      });

      if (!requestProgram) {
        throw new Error("PROGRAMME_NOT_FOUND");
      }

      const serviceRequest = requestProgram.request;

      // TAF must be accepted before batch creation.
      if (serviceRequest.tafAgreement?.status !== "ACCEPTED") {
        throw new Error("TAF_NOT_ACCEPTED");
      }

      // Batch number must be within expected batches.
      if (batchNumber! > requestProgram.expectedBatches) {
        throw new Error("INVALID_BATCH_NUMBER");
      }

      // Total participants across batches cannot exceed
      // the participants registered for this programme.
      const alreadyAllocated = requestProgram.batches.reduce(
        (total, batch) => total + batch.participants,
        0
      );

      if (
        alreadyAllocated + participantsCount >
        requestProgram.participants
      ) {
        throw new Error("PARTICIPANT_LIMIT_EXCEEDED");
      }

      // Prevent duplicate batch numbers.
      const existingBatch = requestProgram.batches.find(
        (batch) => batch.batchNumber === batchNumber
      );

      if (existingBatch) {
        throw new Error("BATCH_ALREADY_EXISTS");
      }

      // Find the accepted trainer assignment.
      let trainerAssignment = null;

      if (
        serviceRequest.trainerAssignmentMode === "SINGLE"
      ) {
        trainerAssignment =
          await tx.trainerAssignment.findFirst({
            where: {
              requestId: serviceRequest.id,
              requestProgramId: null,
              batchNumber: null,
              status: "ACCEPTED",
            },
          });
      } else if (
        serviceRequest.trainerAssignmentMode === "MULTIPLE"
      ) {
        const matchingAssignments =
          await tx.trainerAssignment.findMany({
            where: {
              requestId: serviceRequest.id,
              requestProgramId: requestProgram.id,
              status: "ACCEPTED",
              OR: [
                { batchNumber: batchNumber! },
                { batchNumber: null },
              ],
            },
          });

        // Prefer a batch-specific assignment.
        trainerAssignment =
          matchingAssignments.find(
            (item) => item.batchNumber === batchNumber
          ) ||
          matchingAssignments.find(
            (item) => item.batchNumber === null
          ) ||
          null;
      } else {
        throw new Error("ASSIGNMENT_MODE_NOT_FOUND");
      }

      if (!trainerAssignment) {
        throw new Error("ACCEPTED_TRAINER_NOT_FOUND");
      }

      // Create batch.
      const batch = await tx.batch.create({
        data: {
          requestProgramId: requestProgram.id,
          trainerAssignmentId: trainerAssignment.id,
          batchNumber: batchNumber!,
          participants: participantsCount,
          participantsList: {
            create: cleanedParticipants.map((participant) => ({
              name: participant.name,
              email: participant.email || null,
              phone: participant.phone || null,
              employeeId: participant.employeeId || null,
            })),
          },
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          mode: mode as "ON" | "HY" | "OF",
          location: location?.trim() || null,
          createdById: auth.user.id,
          status: "PLANNED",
        },
        include: {
          requestProgram: {
            include: {
              program: true,
              request: {
                select: {
                  requestNumber: true,
                  organisation: true,
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
        },
      });

      // Record the batch creation in request timeline.
      await tx.requestTimeline.create({
        data: {
          requestId: serviceRequest.id,
          actorId: auth.user.id,
          status: "TRAINER_ASSIGNMENT",
          remarks:
            `Batch ${batchNumber} created for ` +
            `${requestProgram.program.code} with ${participantsCount} participants. ` +
            `Trainer: ${trainerAssignment.trainerId}.`,
        },
      });

      return batch;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Batch created successfully.",
        batch: result,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      const knownErrors: Record<
        string,
        { message: string; status: number }
      > = {
        PROGRAMME_NOT_FOUND: {
          message: "Selected programme was not found.",
          status: 404,
        },
        TAF_NOT_ACCEPTED: {
          message: "Client must accept TAF before batch creation.",
          status: 400,
        },
        INVALID_BATCH_NUMBER: {
          message: "Batch number exceeds the expected batch count.",
          status: 400,
        },
        PARTICIPANT_LIMIT_EXCEEDED: {
          message: "Total batch participants exceed the programme participant count.",
          status: 400,
        },
        BATCH_ALREADY_EXISTS: {
          message: "This batch number already exists for the selected programme.",
          status: 409,
        },
        ASSIGNMENT_MODE_NOT_FOUND: {
          message: "Trainer assignment mode is not configured.",
          status: 400,
        },
        ACCEPTED_TRAINER_NOT_FOUND: {
          message: "No accepted trainer assignment found for this batch.",
          status: 400,
        },
      };

      const knownError = knownErrors[error.message];

      if (knownError) {
        return apiError(
          knownError.message,
          knownError.status
        );
      }
    }

    console.error("Sub Admin Batch POST Error:", error);

    return apiError("Unable to create batch.", 500);
  }
}
