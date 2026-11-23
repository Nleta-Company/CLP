
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

// ======================================================
// TYPES
// ======================================================

type ParticipantDetail = {
  name: string;
  email?: string;
  designation: string;
  phone?: string;
};

type ProgramRequirement = {
  code: string;
  participants: string | number;
  batches: string | number;
  mode: string;
  participantsDetails?: ParticipantDetail[];
};

type RequestBody = {
  organisation?: string;
  gstin?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  contactName?: string;
  designation?: string;
  phone?: string;
  preferredDate?: string;
  alternateDate?: string;
  location?: string;
  language?: string;
  coordinator?: string;
  facilities?: string;
  assessment?: string;
  refresher?: string;
  additionalRequirements?: string;
  selectedPrograms?: { code: string }[];
  programRequirements?: ProgramRequirement[];
};

// Explicit type to prevent implicit any[] errors
type RequestProgramInput = {
  trainingProgramId: string;
  participants: number;
  expectedBatches: number;
  preferredMode: "ON" | "HY" | "OF";
  participantsDetails: {
    name: string;
    designation: string;
    email: string | null;
    phone: string | null;
  }[];
};

// ======================================================
// HELPERS
// ======================================================

function optionalDate(value?: string) {
  if (!value?.trim()) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Please provide a valid training date.");
  }

  return date;
}

function cleanOptional(value?: string) {
  return value?.trim() || null;
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
}

// ======================================================
// GET: FETCH LOGGED-IN CLIENT'S SERVICE REQUESTS
// ======================================================

export async function GET() {
  try {
    const auth = await requireApiRole(["CLIENT"]);

    if (auth.response) {
      return auth.response;
    }

    const requests = await prisma.serviceRequest.findMany({
      where: {
        clientId: auth.user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        programs: {
          include: {
            program: {
              select: {
                code: true,
                title: true,
                category: true,
                duration: true,
                mode: true,
              },
            },

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
        },

        finalTrainingOffer: {
          select: {
            id: true,
            ftoNumber: true,
            currency: true,
            grandTotal: true,
            validUntil: true,
            documentUrl: true,
            issueDate: true,
          },
        },
      },
    });

    const formattedRequests = requests.map((request) => ({
      id: request.id,
      requestNumber: request.requestNumber,
      status: request.status,

      submittedAt: request.submittedAt,
      createdAt: request.createdAt,

      preferredDate: request.preferredDate,
      alternateDate: request.alternateDate,
      trainingLocation: request.trainingLocation,
      coordinator: request.coordinator,

      programmes: request.programs.map((item) => ({
        id: item.id,
        code: item.program.code,
        title: item.program.title,
        category: item.program.category,
        duration: item.program.duration,
        mode: item.preferredMode,
        participants: item.participants,
        expectedBatches: item.expectedBatches,

        participantsDetails: item.participantsDetails,
      })),

      totalParticipants: request.programs.reduce(
        (total, item) => total + item.participants,
        0
      ),

      fto: request.finalTrainingOffer
        ? {
            id: request.finalTrainingOffer.id,
            ftoNumber: request.finalTrainingOffer.ftoNumber,
            currency: request.finalTrainingOffer.currency,
            grandTotal:
              request.finalTrainingOffer.grandTotal.toString(),
            validUntil: request.finalTrainingOffer.validUntil,
            documentUrl: request.finalTrainingOffer.documentUrl,
            issueDate: request.finalTrainingOffer.issueDate,
          }
        : null,
    }));

    return NextResponse.json(
      {
        success: true,
        total: formattedRequests.length,
        requests: formattedRequests,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Client Requests Fetch Error:", error);

    return errorResponse(
      "Unable to fetch your service requests.",
      500
    );
  }
}

// ======================================================
// POST: SUBMIT NEW CLIENT SERVICE REQUEST
// ======================================================

export async function POST(request: NextRequest) {
  try {
    // ----------------------------------------------
    // 1. AUTHENTICATION
    // ----------------------------------------------

    const auth = await requireApiRole(["CLIENT"]);

    if (auth.response) {
      return auth.response;
    }

    // ----------------------------------------------
    // 2. READ REQUEST BODY
    // ----------------------------------------------

    let body: RequestBody;

    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return errorResponse(
        "Invalid or empty JSON request body.",
        400
      );
    }

    // ----------------------------------------------
    // 3. VALIDATE CLIENT INFORMATION
    // ----------------------------------------------

    if (
      !body.organisation?.trim() ||
      !body.address?.trim() ||
      !body.state?.trim() ||
      !body.city?.trim() ||
      !body.contactName?.trim() ||
      !body.phone?.trim() ||
      !body.location?.trim()
    ) {
      return errorResponse(
        "Please complete all required client and training details.",
        400
      );
    }

    // ----------------------------------------------
    // 4. VALIDATE SELECTED PROGRAMMES
    // ----------------------------------------------

    if (
      !Array.isArray(body.selectedPrograms) ||
      body.selectedPrograms.length === 0 ||
      !Array.isArray(body.programRequirements) ||
      body.programRequirements.length !==
        body.selectedPrograms.length
    ) {
      return errorResponse(
        "Please select programmes and provide requirements for each one.",
        400
      );
    }

    const codes = body.selectedPrograms.map((item) =>
      item.code?.trim()
    );

    if (
      codes.some((code) => !code) ||
      new Set(codes).size !== codes.length
    ) {
      return errorResponse(
        "Invalid or duplicate training programmes.",
        400
      );
    }

    // ----------------------------------------------
    // 5. CREATE REQUIREMENTS MAP
    // ----------------------------------------------

    const requirements = new Map<string, ProgramRequirement>();

    for (const item of body.programRequirements) {
      if (!item?.code || requirements.has(item.code)) {
        return errorResponse(
          "Duplicate or invalid programme requirements.",
          400
        );
      }

      requirements.set(item.code, item);
    }

    if (codes.some((code) => !requirements.has(code))) {
      return errorResponse(
        "Programme requirements do not match selected programmes.",
        400
      );
    }

    // ----------------------------------------------
    // 6. FETCH ACTIVE PROGRAMMES
    // ----------------------------------------------

    const programs = await prisma.trainingProgram.findMany({
      where: {
        code: {
          in: codes,
        },
        isActive: true,
      },

      select: {
        id: true,
        code: true,
      },
    });

    if (programs.length !== codes.length) {
      return errorResponse(
        "One or more selected programmes are invalid or inactive.",
        400
      );
    }

    // ----------------------------------------------
    // 7. VALIDATE PROGRAMMES AND PARTICIPANTS
    // ----------------------------------------------

    const requestPrograms: RequestProgramInput[] =
      programs.map((program) => {
        const requirement = requirements.get(program.code);

        if (!requirement) {
          throw new Error(
            `Requirements missing for ${program.code}.`
          );
        }

        const participants = Number(
          requirement.participants
        );

        const expectedBatches = Number(
          requirement.batches
        );

        const preferredMode = requirement.mode;

        if (
          !Number.isInteger(participants) ||
          participants < 1 ||
          participants > 500
        ) {
          throw new Error(
            `Please enter a valid participant count for ${program.code}.`
          );
        }

        if (
          !Number.isInteger(expectedBatches) ||
          expectedBatches < 1 ||
          expectedBatches > participants
        ) {
          throw new Error(
            `Please enter a valid batch count for ${program.code}.`
          );
        }

        if (!["ON", "HY", "OF"].includes(preferredMode)) {
          throw new Error(
            `Please select a valid delivery mode for ${program.code}.`
          );
        }

        // Validate participant details
        const details = requirement.participantsDetails;

        if (
          !Array.isArray(details) ||
          details.length !== participants
        ) {
          throw new Error(
            `Please provide details for all ${participants} participants in ${program.code}.`
          );
        }

        const cleanedParticipants = details.map(
          (person, index) => {
            const name = person?.name?.trim() || "";
            const designation =
              person?.designation?.trim() || "";

            const email = cleanOptional(person?.email);
            const phone = cleanOptional(person?.phone);

            if (!name) {
              throw new Error(
                `Participant ${index + 1} in ${program.code}: Full Name is required.`
              );
            }

            if (!designation) {
              throw new Error(
                `Participant ${index + 1} in ${program.code}: Designation is required.`
              );
            }

            if (
              email &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ) {
              throw new Error(
                `Please enter a valid email for participant ${index + 1} in ${program.code}.`
              );
            }

            return {
              name,
              designation,
              email,
              phone,
            };
          }
        );

        return {
          trainingProgramId: program.id,
          participants,
          expectedBatches,
          preferredMode:
            preferredMode as "ON" | "HY" | "OF",
          participantsDetails: cleanedParticipants,
        };
      });

    // ----------------------------------------------
    // 8. VALIDATE DATES
    // ----------------------------------------------

    const preferredDate = optionalDate(
      body.preferredDate
    );

    const alternateDate = optionalDate(
      body.alternateDate
    );

    // ----------------------------------------------
    // 9. GENERATE REQUEST NUMBER
    // ----------------------------------------------

    const requestNumber = `CLP-${new Date().getFullYear()}-${randomUUID()
      .replace(/-/g, "")
      .slice(0, 8)
      .toUpperCase()}`;

    // ----------------------------------------------
    // 10. DATABASE TRANSACTION
    // ----------------------------------------------

    const createdRequest = await prisma.$transaction(
      async (tx) => {
        const serviceRequest =
          await tx.serviceRequest.create({
            data: {
              requestNumber,
              clientId: auth.user.id,
              status: "SUBMITTED",

              organisation: body.organisation!.trim(),
              gstin: cleanOptional(body.gstin),
              billingAddress: body.address!.trim(),
              country: body.country?.trim() || "India",
              state: body.state!.trim(),
              city: body.city!.trim(),
              contactName: body.contactName!.trim(),
              designation: cleanOptional(body.designation),
              email: auth.user.email,
              phone: body.phone!.trim(),

              preferredDate,
              alternateDate,
              trainingLocation: body.location!.trim(),
              preferredLanguage: cleanOptional(body.language),
              coordinator: cleanOptional(body.coordinator),
              facilities: cleanOptional(body.facilities),
              assessment: cleanOptional(body.assessment),
              refresher: cleanOptional(body.refresher),
              additionalRequirements: cleanOptional(
                body.additionalRequirements
              ),

              submittedAt: new Date(),

              // Create programmes and their participants
              programs: {
                create: requestPrograms.map((item) => ({
                  trainingProgramId: item.trainingProgramId,
                  participants: item.participants,
                  expectedBatches: item.expectedBatches,
                  preferredMode: item.preferredMode,

                  participantsDetails: {
                    create: item.participantsDetails,
                  },
                })),
              },

              // Create request timeline
              timeline: {
                create: {
                  actorId: auth.user.id,
                  status: "SUBMITTED",
                  remarks:
                    "Service request submitted by client.",
                },
              },
            },

            select: {
              id: true,
              requestNumber: true,
              status: true,
              submittedAt: true,

              programs: {
                select: {
                  id: true,
                  participants: true,
                  expectedBatches: true,

                  participantsDetails: {
                    select: {
                      id: true,
                      name: true,
                      designation: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          });

        return serviceRequest;
      },
      {
        // Allow enough time for the request, programme, participants,
        // and timeline records to be committed together.
        maxWait: 10000,
        timeout: 20000,
      }
    );

    // ----------------------------------------------
    // 11. SUCCESS RESPONSE
    // ----------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Service request and participant details saved successfully.",

        request: createdRequest,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Client Request API Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit service request.";

    const isValidationError =
      message.startsWith("Please") ||
      message.startsWith("Participant") ||
      message.startsWith("One or more") ||
      message.startsWith("Requirements");

    return NextResponse.json(
      {
        success: false,
        message: isValidationError
          ? message
          : "Unable to submit service request.",

        ...(process.env.NODE_ENV === "development" && {
          debug: message,
        }),
      },
      {
        status: isValidationError ? 400 : 500,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  }
}
