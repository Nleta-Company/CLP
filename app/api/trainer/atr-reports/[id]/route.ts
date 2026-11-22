
import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

const reportInclude = {
  trainerAssignment: {
    include: {
      request: {
        include: {
          client: {
            select: {
              name: true,
              email: true,
            },
          },
          programs: {
            include: {
              program: true,
            },
          },
          ptaAgreement: true,
          tafAgreement: true,
          finalTrainingOffer: true,
        },
      },
      trainer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  batch: {
    include: {
      participantsList: true,
    },
  },
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
};

/**
 * GET:
 * Fetch one ATR-01 report belonging to the logged-in trainer.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["TRAINER"]);

    if (auth.response) return auth.response;

    const { id } = await context.params;

    const report = await prisma.atrReport.findFirst({
      where: {
        id,
        createdById: auth.user.id,
        trainerAssignment: {
          trainerId: auth.user.id,
        },
      },
      include: reportInclude,
    });

    if (!report) {
      return apiError("ATR-01 report not found.", 404);
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Trainer ATR Report GET Error:", error);

    return apiError(
      "Unable to fetch ATR-01 report.",
      500
    );
  }
}

/**
 * PATCH:
 * Save/update ATR-01 report sections.
 *
 * Only DRAFT and RETURNED_FOR_CORRECTION reports
 * can be edited by the trainer.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["TRAINER"]);

    if (auth.response) return auth.response;

    const { id } = await context.params;

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON request body.");
    }

    // 1. Find report and verify trainer ownership.
    const existingReport = await prisma.atrReport.findFirst({
      where: {
        id,
        createdById: auth.user.id,
        trainerAssignment: {
          trainerId: auth.user.id,
        },
      },
    });

    if (!existingReport) {
      return apiError("ATR-01 report not found.", 404);
    }

    // 2. Only draft or returned reports can be edited.
    if (
      existingReport.status !== "DRAFT" &&
      existingReport.status !== "RETURNED_FOR_CORRECTION"
    ) {
      return apiError(
        "This report cannot be edited in its current status.",
        409
      );
    }

    // 3. Allowed text and scalar fields.
    const scalarFields = [
      "clientLegalEntity",
      "clientContactDepartment",
      "ptaReference",
      "ftfReference",
      "ftfRevision",
      "tafReference",
      "tspReference",
      "programmeSpecification",
      "programmeRevision",
      "actualDuration",
      "venueOrPlatform",
      "trainerName",
      "trainerRole",
      "trainerQualificationRef",
      "tarReference",
      "attendanceNotes",
      "attendanceRequirementSource",
      "reviewNotes",
      "approvalEvidence",
      "preparedByName",
      "preparedByRole",
      "clientHandoverRef",
      "correctionNote",
    ] as const;

    // 4. Allowed date fields.
    const dateFields = [
      "ptaDate",
      "ftfAcceptanceDate",
      "tafActivationDate",
      "trainingStartDate",
      "trainingEndDate",
      "clientHandoverDate",
    ] as const;

    // 5. Allowed numeric fields.
    const numberFields = [
      "registeredParticipants",
      "participantsAttended",
      "participantsMeetingRequirement",
    ] as const;

    // 6. Allowed JSON fields.
    const jsonFields = [
      "trainingDelivery",
      "deliveryDeviations",
      "assessmentCriteria",
      "participantResults",
      "cohortSummary",
      "trainerObservations",
      "linkedDeliverables",
    ] as const;

    const data: Record<string, unknown> = {};

    // Validate and collect scalar fields.
    for (const field of scalarFields) {
      if (!(field in body)) continue;

      const value = body[field];

      if (value !== null && typeof value !== "string") {
        return apiError(`${field} must be a string or null.`);
      }

      data[field] = value;
    }

    // Validate and collect date fields.
    for (const field of dateFields) {
      if (!(field in body)) continue;

      const value = body[field];

      if (value === null || value === "") {
        data[field] = null;
        continue;
      }

      if (typeof value !== "string") {
        return apiError(`${field} must be a valid date or null.`);
      }

      const parsedDate = new Date(value);

      if (Number.isNaN(parsedDate.getTime())) {
        return apiError(`${field} contains an invalid date.`);
      }

      data[field] = parsedDate;
    }

    // Validate and collect numeric fields.
    for (const field of numberFields) {
      if (!(field in body)) continue;

      const value = body[field];

      if (value === null || value === "") {
        data[field] = null;
        continue;
      }

      if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 0
      ) {
        return apiError(
          `${field} must be a non-negative integer or null.`
        );
      }

      data[field] = value;
    }

    // Validate and collect JSON fields.
    for (const field of jsonFields) {
      if (!(field in body)) continue;

      const value = body[field];

      if (
        value !== null &&
        typeof value !== "object"
      ) {
        return apiError(
          `${field} must be an object, array or null.`
        );
      }

      data[field] = value;
    }

    // Validate delivery mode.
    if ("deliveryMode" in body) {
      const value = body.deliveryMode;

      if (
        value !== null &&
        value !== "ON" &&
        value !== "HY" &&
        value !== "OF"
      ) {
        return apiError("Invalid delivery mode.");
      }

      data.deliveryMode = value;
    }

    // 7. Validate participant counts when supplied together.
    const registered =
      data.registeredParticipants ??
      existingReport.registeredParticipants;

    const attended =
      data.participantsAttended ??
      existingReport.participantsAttended;

    const meetingRequirement =
      data.participantsMeetingRequirement ??
      existingReport.participantsMeetingRequirement;

    if (
      typeof registered === "number" &&
      typeof attended === "number" &&
      attended > registered
    ) {
      return apiError(
        "Attended participants cannot exceed registered participants."
      );
    }

    if (
      typeof attended === "number" &&
      typeof meetingRequirement === "number" &&
      meetingRequirement > attended
    ) {
      return apiError(
        "Participants meeting the attendance requirement cannot exceed participants attended."
      );
    }

    // 8. Validate training date sequence.
    const startDate =
      data.trainingStartDate ??
      existingReport.trainingStartDate;

    const endDate =
      data.trainingEndDate ??
      existingReport.trainingEndDate;

    if (
      startDate instanceof Date &&
      endDate instanceof Date &&
      endDate < startDate
    ) {
      return apiError(
        "Training end date cannot be before training start date."
      );
    }

    if (Object.keys(data).length === 0) {
      return apiError("No valid report fields were provided.");
    }

    // 9. Save report.
    const updatedReport = await prisma.atrReport.update({
      where: {
        id: existingReport.id,
      },
      data: data as any,
      include: reportInclude,
    });

    return NextResponse.json({
      success: true,
      message: "ATR-01 report saved successfully.",
      report: updatedReport,
    });
  } catch (error) {
    console.error("Trainer ATR Report PATCH Error:", error);

    return apiError(
      "Unable to update ATR-01 report.",
      500
    );
  }
}
