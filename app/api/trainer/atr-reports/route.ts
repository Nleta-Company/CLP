
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
 * Fetch ATR reports belonging to the logged-in trainer.
 */
export async function GET() {
  try {
    const auth = await requireApiRole(["TRAINER"]);

    if (auth.response) return auth.response;

    const reports = await prisma.atrReport.findMany({
      where: {
        createdById: auth.user.id,
      },
      include: {
        trainerAssignment: {
          include: {
            request: {
              select: {
                id: true,
                requestNumber: true,
                organisation: true,
                trainingLocation: true,
                client: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        batch: true,
        requestProgram: {
          include: {
            program: true,
          },
        },
        reviewedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Trainer ATR Reports GET Error:", error);

    return apiError(
      "Unable to fetch ATR reports.",
      500
    );
  }
}

/**
 * POST:
 * Create a new ATR-01 draft for an accepted trainer assignment.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiRole(["TRAINER"]);

    if (auth.response) return auth.response;

    let body: {
      assignmentId?: string;
      requestProgramId?: string | null;
      batchId?: string | null;
    };

    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON request body.");
    }

    const assignmentId =
      typeof body.assignmentId === "string"
        ? body.assignmentId.trim()
        : "";

    let requestProgramId =
      typeof body.requestProgramId === "string"
        ? body.requestProgramId.trim()
        : null;

    const batchId =
      typeof body.batchId === "string"
        ? body.batchId.trim()
        : null;

    if (!assignmentId) {
      return apiError("Trainer assignment ID is required.");
    }

    // 1. Verify assignment belongs to trainer and is accepted.
    const assignment = await prisma.trainerAssignment.findFirst({
      where: {
        id: assignmentId,
        trainerId: auth.user.id,
        status: "ACCEPTED",
      },
      include: {
        request: {
          select: {
            id: true,
            requestNumber: true,
            organisation: true,
          },
        },
      },
    });

    if (!assignment) {
      return apiError(
        "Accepted trainer assignment not found.",
        404
      );
    }

    // 2. Resolve programme from assignment or selected batch.
    if (assignment.requestProgramId) {
      if (
        requestProgramId &&
        requestProgramId !== assignment.requestProgramId
      ) {
        return apiError(
          "Selected programme does not belong to this assignment."
        );
      }

      requestProgramId = assignment.requestProgramId;
    }

    // 3. Validate selected programme.
    if (requestProgramId) {
      const requestProgram = await prisma.requestProgram.findFirst({
        where: {
          id: requestProgramId,
          requestId: assignment.requestId,
        },
      });

      if (!requestProgram) {
        return apiError(
          "Selected programme does not belong to this request.",
          404
        );
      }
    }

    // 4. Validate selected batch.
    if (batchId) {
      const batch = await prisma.batch.findFirst({
        where: {
          id: batchId,
          requestProgram: {
            requestId: assignment.requestId,
          },
        },
      });

      if (!batch) {
        return apiError(
          "Selected batch does not belong to this request.",
          404
        );
      }

      if (
        batch.trainerAssignmentId &&
        batch.trainerAssignmentId !== assignment.id
      ) {
        return apiError(
          "This batch is assigned to another trainer assignment."
        );
      }

      if (
        requestProgramId &&
        batch.requestProgramId !== requestProgramId
      ) {
        return apiError(
          "Selected batch does not belong to the selected programme."
        );
      }

      requestProgramId = batch.requestProgramId;
    }

    // 5. Check whether a report already exists for this scope.
    const existingReport = await prisma.atrReport.findFirst({
      where: {
        trainerAssignmentId: assignment.id,
        batchId,
        requestProgramId,
        createdById: auth.user.id,
        status: {
          not: "CANCELLED",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingReport) {
      return NextResponse.json({
        success: true,
        message: "An ATR-01 report already exists for this selection.",
        report: existingReport,
        existing: true,
      });
    }

    // 6. Generate a unique report number.
    const year = new Date().getFullYear();

    const reportNumber =
      `NLETA/ATR/${year}/${Date.now()}`;

    // 7. Create ATR-01 draft.
    const report = await prisma.atrReport.create({
      data: {
        reportNumber,
        revision: "Rev.2",

        trainerAssignmentId: assignment.id,
        batchId,
        requestProgramId,

        createdById: auth.user.id,

        status: "DRAFT",
      },
      include: {
        trainerAssignment: {
          include: {
            request: {
              select: {
                id: true,
                requestNumber: true,
                organisation: true,
              },
            },
          },
        },
        batch: true,
        requestProgram: {
          include: {
            program: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "ATR-01 draft created successfully.",
        report,
        existing: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Trainer ATR Report POST Error:", error);

    return apiError(
      "Unable to create ATR-01 draft.",
      500
    );
  }
}
