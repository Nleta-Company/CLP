
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

import { requireApiRole } from "@/lib/auth/api-authorization"
import { prisma } from "@/lib/prisma"

type ProgramRequirement = {
  code: string
  participants: string | number
  batches: string | number
  mode: string
}

type RequestBody = {
  organisation?: string
  gstin?: string
  address?: string
  country?: string
  state?: string
  city?: string
  contactName?: string
  designation?: string
  phone?: string
  preferredDate?: string
  alternateDate?: string
  location?: string
  language?: string
  coordinator?: string
  facilities?: string
  assessment?: string
  refresher?: string
  additionalRequirements?: string
  selectedPrograms?: { code: string }[]
  programRequirements?: ProgramRequirement[]
}

function optionalDate(value?: string) {
  if (!value?.trim()) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error("Please provide a valid training date.")
  }

  return date
}

// ======================================================
// GET: FETCH LOGGED-IN CLIENT'S SERVICE REQUESTS
// ======================================================

export async function GET() {
  try {
    const auth = await requireApiRole(["CLIENT"])

    if (auth.response) {
      return auth.response
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
    })

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
        code: item.program.code,
        title: item.program.title,
        category: item.program.category,
        duration: item.program.duration,
        mode: item.preferredMode,
        participants: item.participants,
        expectedBatches: item.expectedBatches,
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
    }))

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
    )
  } catch (error) {
    console.error("Client Requests Fetch Error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch your service requests.",
      },
      { status: 500 }
    )
  }
}

// ======================================================
// POST: SUBMIT NEW CLIENT SERVICE REQUEST
// ======================================================

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiRole(["CLIENT"])

    if (auth.response) {
      return auth.response
    }

    let body: RequestBody

    try {
      body = (await request.json()) as RequestBody
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or empty JSON request body.",
        },
        { status: 400 }
      )
    }

    if (
      !body.organisation?.trim() ||
      !body.address?.trim() ||
      !body.state?.trim() ||
      !body.city?.trim() ||
      !body.contactName?.trim() ||
      !body.phone?.trim() ||
      !body.location?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please complete all required client and training details.",
        },
        { status: 400 }
      )
    }

    if (
      !Array.isArray(body.selectedPrograms) ||
      body.selectedPrograms.length === 0 ||
      !Array.isArray(body.programRequirements)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select at least one training programme.",
        },
        { status: 400 }
      )
    }

    const requirements = new Map(
      body.programRequirements.map((item) => [item.code, item])
    )

    const codes = [
      ...new Set(body.selectedPrograms.map((item) => item.code)),
    ]

    if (codes.length !== body.selectedPrograms.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate training programmes are not allowed.",
        },
        { status: 400 }
      )
    }

    const programs = await prisma.trainingProgram.findMany({
      where: {
        code: { in: codes },
        isActive: true,
      },
      select: {
        id: true,
        code: true,
      },
    })

    if (programs.length !== codes.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more selected programmes are invalid or inactive.",
        },
        { status: 400 }
      )
    }

    const requestPrograms = programs.map((program) => {
      const requirement = requirements.get(program.code)

      const participants = Number(requirement?.participants)
      const expectedBatches = Number(requirement?.batches)
      const preferredMode = requirement?.mode

      if (
        !Number.isInteger(participants) ||
        participants < 1 ||
        !Number.isInteger(expectedBatches) ||
        expectedBatches < 1 ||
        !["ON", "HY", "OF"].includes(preferredMode ?? "")
      ) {
        throw new Error(
          `Please enter valid participants, batches and delivery mode for ${program.code}.`
        )
      }

      return {
        trainingProgramId: program.id,
        participants,
        expectedBatches,
        preferredMode: preferredMode as "ON" | "HY" | "OF",
      }
    })

    const preferredDate = optionalDate(body.preferredDate)
    const alternateDate = optionalDate(body.alternateDate)

    const requestNumber = `CLP-${new Date().getFullYear()}-${randomUUID()
      .replace(/-/g, "")
      .slice(0, 8)
      .toUpperCase()}`

    const createdRequest = await prisma.$transaction(async (tx) => {
      const serviceRequest = await tx.serviceRequest.create({
        data: {
          requestNumber,
          clientId: auth.user.id,
          status: "SUBMITTED",

          organisation: body.organisation!.trim(),
          gstin: body.gstin?.trim() || null,
          billingAddress: body.address!.trim(),
          country: body.country?.trim() || "India",
          state: body.state!.trim(),
          city: body.city!.trim(),
          contactName: body.contactName!.trim(),
          designation: body.designation?.trim() || null,
          email: auth.user.email,
          phone: body.phone!.trim(),

          preferredDate,
          alternateDate,
          trainingLocation: body.location!.trim(),
          preferredLanguage: body.language?.trim() || null,
          coordinator: body.coordinator?.trim() || null,
          facilities: body.facilities?.trim() || null,
          assessment: body.assessment?.trim() || null,
          refresher: body.refresher?.trim() || null,
          additionalRequirements:
            body.additionalRequirements?.trim() || null,

          submittedAt: new Date(),

          programs: {
            create: requestPrograms,
          },

          timeline: {
            create: {
              actorId: auth.user.id,
              status: "SUBMITTED",
              remarks: "Service request submitted by client.",
            },
          },
        },

        select: {
          id: true,
          requestNumber: true,
          status: true,
          submittedAt: true,
        },
      })

      return serviceRequest
    })

    return NextResponse.json(
      {
        success: true,
        message: "Service request submitted successfully.",
        request: createdRequest,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Client Request API Error:", error)

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit service request.",
      },
      { status: 500 }
    )
  }
}
