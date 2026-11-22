
import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AssignmentInput = {
  trainerId: string;
  requestProgramId?: string | null;
  batchNumber?: number | null;
  remarks?: string | null;
};

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// GET: Fetch trainers, programmes and assignment history
export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        tafAgreement: true,
        programs: {
          include: {
            program: true,
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
                program: true,
              },
            },
          },
          orderBy: {
            assignedAt: "desc",
          },
        },
      },
    });

    if (!serviceRequest) {
      return apiError("Service request not found.", 404);
    }

    const trainers = await prisma.user.findMany({
      where: {
        role: "TRAINER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const tafAccepted =
      serviceRequest.tafAgreement?.status === "ACCEPTED";

    const assignments = serviceRequest.trainerAssignments;

    const hasAssignments = assignments.length > 0;

    // Reassignment is allowed only when every previous
    // assignment has been rejected.
    const allAssignmentsRejected =
      hasAssignments &&
      assignments.every((item) => item.status === "REJECTED");

    const requestInAssignmentStage =
      serviceRequest.status === "TAF_ACCEPTED" ||
      serviceRequest.status === "TRAINER_ASSIGNMENT";

    const canAssign =
      tafAccepted &&
      requestInAssignmentStage &&
      (!hasAssignments || allAssignmentsRejected);

    return NextResponse.json({
      success: true,
      canAssign,
      canReassign: allAssignmentsRejected && tafAccepted,
      tafAccepted,
      assignmentMode: serviceRequest.trainerAssignmentMode,

      request: {
        id: serviceRequest.id,
        requestNumber: serviceRequest.requestNumber,
        status: serviceRequest.status,
        organisation: serviceRequest.organisation,
        trainingLocation: serviceRequest.trainingLocation,
        preferredDate: serviceRequest.preferredDate,
      },

      taf: serviceRequest.tafAgreement,

      programs: serviceRequest.programs.map((item) => ({
        requestProgramId: item.id,
        trainingProgramId: item.trainingProgramId,
        code: item.program.code,
        title: item.program.title,
        participants: item.participants,
        expectedBatches: item.expectedBatches,
      })),

      trainers,
      assignments,

      assignmentHistory: assignments,
    });
  } catch (error) {
    console.error("Trainer Assignment GET Error:", error);

    return apiError(
      "Unable to fetch trainer assignment details.",
      500
    );
  }
}

// POST: Initial assignment or reassignment after all trainers reject
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);
    if (auth.response) return auth.response;

    const { id } = await context.params;

    let body: {
      assignmentMode?: "SINGLE" | "MULTIPLE";
      assignments?: AssignmentInput[];
    };

    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON request body.");
    }

    const { assignmentMode, assignments } = body;

    if (
      assignmentMode !== "SINGLE" &&
      assignmentMode !== "MULTIPLE"
    ) {
      return apiError("Invalid assignment mode.");
    }

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return apiError("At least one trainer is required.");
    }

    if (
      assignmentMode === "SINGLE" &&
      assignments.length !== 1
    ) {
      return apiError(
        "Single mode requires exactly one trainer."
      );
    }

    if (
      assignmentMode === "MULTIPLE" &&
      assignments.length < 2
    ) {
      return apiError(
        "Multiple mode requires at least two assignments."
      );
    }

    for (const item of assignments) {
      if (
        !item.trainerId ||
        typeof item.trainerId !== "string" ||
        !item.trainerId.trim()
      ) {
        return apiError(
          "Every assignment requires a valid trainer."
        );
      }

      if (
        item.batchNumber != null &&
        (
          !Number.isInteger(item.batchNumber) ||
          item.batchNumber < 1
        )
      ) {
        return apiError("Please provide a valid batch number.");
      }
    }

    // SINGLE: one trainer handles the entire request.
    const normalizedAssignments: AssignmentInput[] =
      assignmentMode === "SINGLE"
        ? [
            {
              trainerId: assignments[0].trainerId.trim(),
              requestProgramId: null,
              batchNumber: null,
              remarks: assignments[0].remarks?.trim() || null,
            },
          ]
        : assignments.map((item) => ({
            trainerId: item.trainerId.trim(),
            requestProgramId: item.requestProgramId || null,
            batchNumber: item.batchNumber ?? null,
            remarks: item.remarks?.trim() || null,
          }));

    // MULTIPLE requires programme-wise allocation.
    if (assignmentMode === "MULTIPLE") {
      for (const item of normalizedAssignments) {
        if (!item.requestProgramId) {
          return apiError(
            "Please select a programme for every trainer in multiple mode."
          );
        }
      }
    }

    // Prevent duplicate trainer + programme + batch combinations.
    const assignmentKeys = normalizedAssignments.map((item) =>
      [
        item.trainerId,
        item.requestProgramId ?? "ENTIRE_REQUEST",
        item.batchNumber ?? "ALL_BATCHES",
      ].join(":")
    );

    if (new Set(assignmentKeys).size !== assignmentKeys.length) {
      return apiError(
        "Duplicate trainer assignments are not allowed."
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
      const serviceRequest = await tx.serviceRequest.findUnique({
        where: { id },
        include: {
          tafAgreement: true,
          programs: true,
          trainerAssignments: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!serviceRequest) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      if (serviceRequest.tafAgreement?.status !== "ACCEPTED") {
        throw new Error("TAF_NOT_ACCEPTED");
      }

      if (
        serviceRequest.status !== "TAF_ACCEPTED" &&
        serviceRequest.status !== "TRAINER_ASSIGNMENT"
      ) {
        throw new Error("INVALID_REQUEST_STATUS");
      }

      const existingAssignments =
        serviceRequest.trainerAssignments;

      const isReassignment = existingAssignments.length > 0;

      // Existing assignments can be replaced only when
      // every previous assignment has been rejected.
      if (
        isReassignment &&
        !existingAssignments.every(
          (item) => item.status === "REJECTED"
        )
      ) {
        throw new Error("ASSIGNMENT_EXISTS");
      }

      // Validate programme and batch for MULTIPLE mode.
      if (assignmentMode === "MULTIPLE") {
        for (const item of normalizedAssignments) {
          const program = serviceRequest.programs.find(
            (program) => program.id === item.requestProgramId
          );

          if (!program) {
            throw new Error("INVALID_PROGRAM");
          }

          if (
            item.batchNumber != null &&
            item.batchNumber > program.expectedBatches
          ) {
            throw new Error("INVALID_BATCH");
          }
        }
      }

      // Validate selected active trainers.
      const trainerIds = [
        ...new Set(
          normalizedAssignments.map((item) => item.trainerId)
        ),
      ];

      const validTrainers = await tx.user.findMany({
        where: {
          id: {
            in: trainerIds,
          },
          role: "TRAINER",
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (validTrainers.length !== trainerIds.length) {
        throw new Error("INVALID_TRAINER");
      }

      // Keep the request in trainer assignment stage.
      const requestUpdated = await tx.serviceRequest.updateMany({
        where: {
          id,
          status: {
            in: ["TAF_ACCEPTED", "TRAINER_ASSIGNMENT"],
          },
        },
        data: {
          trainerAssignmentMode: assignmentMode,
          status: "TRAINER_ASSIGNMENT",
        },
      });

      if (requestUpdated.count !== 1) {
        throw new Error("REQUEST_STATUS_CHANGED");
      }

      // Create new records. Previous rejected records are
      // intentionally preserved as assignment history.
      const assignmentData = normalizedAssignments.map((item) => ({
        requestId: id,
        trainerId: item.trainerId,
        requestProgramId: item.requestProgramId ?? null,
        batchNumber: item.batchNumber ?? null,
        remarks: item.remarks || null,
        assignedById: auth.user.id,
        status: "ASSIGNED" as const,
      }));

      await tx.trainerAssignment.createMany({
        data: assignmentData,
      });

      await tx.requestTimeline.create({
        data: {
          requestId: id,
          actorId: auth.user.id,
          status: "TRAINER_ASSIGNMENT",
          remarks: isReassignment
            ? assignmentMode === "SINGLE"
              ? "Trainer reassigned to the entire request after all previous trainer assignments were rejected. Previous assignment history preserved."
              : `${normalizedAssignments.length} trainer(s) reassigned after all previous assignments were rejected. Previous assignment history preserved.`
            : assignmentMode === "SINGLE"
              ? `One trainer assigned to the entire request, including all ${serviceRequest.programs.length} programme(s) and their batches.`
              : `${normalizedAssignments.length} trainer assignment(s) created in multiple mode.`,
        },
      });

      return tx.trainerAssignment.findMany({
        where: {
          requestId: id,
        },
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
              program: true,
            },
          },
        },
        orderBy: {
          assignedAt: "desc",
        },
      });
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
          assignmentMode === "SINGLE"
            ? "One trainer assigned successfully to the entire request, including all programmes and batches."
            : "Multiple trainers assigned successfully.",
        assignmentMode,
        isReassignment: result.some(
          (item) => item.status === "REJECTED"
        ),
        assignments: result,
      },
      { status: 201 }
    );
  } catch (error) {
    const messages: Record<
      string,
      { message: string; status: number }
    > = {
      REQUEST_NOT_FOUND: {
        message: "Service request not found.",
        status: 404,
      },
      TAF_NOT_ACCEPTED: {
        message: "Client must accept TAF before trainer assignment.",
        status: 409,
      },
      ASSIGNMENT_EXISTS: {
        message:
          "Reassignment is allowed only after all previous trainers have rejected the assignment.",
        status: 409,
      },
      INVALID_REQUEST_STATUS: {
        message: "This request is not in the trainer assignment stage.",
        status: 409,
      },
      INVALID_PROGRAM: {
        message: "Invalid programme for this request.",
        status: 400,
      },
      INVALID_BATCH: {
        message:
          "Batch number exceeds the expected batches for this programme.",
        status: 400,
      },
      INVALID_TRAINER: {
        message: "Selected trainer is invalid or inactive.",
        status: 400,
      },
      REQUEST_STATUS_CHANGED: {
        message: "Request status changed. Refresh and try again.",
        status: 409,
      },
    };

    const known =
      error instanceof Error
        ? messages[error.message]
        : undefined;

    if (known) {
      return apiError(known.message, known.status);
    }

    console.error("Trainer Assignment POST Error:", error);

    return apiError(
      "Unable to save trainer assignment.",
      500
    );
  }
}
