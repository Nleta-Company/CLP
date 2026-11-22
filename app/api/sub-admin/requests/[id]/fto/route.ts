
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";
import {
  getRateCardPrice,
  getRateCardProgram,
  TtmOption,
} from "@/lib/clp/rate-card";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isValidAmount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100000000
  );
}

function isOptionalString(value: unknown, maxLength: number): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.length <= maxLength)
  );
}

function cleanOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function fromCents(value: number) {
  return (value / 100).toFixed(2);
}

type PaymentTerm = "FULL" | "HALF_HALF" | "HALF_QUARTER_QUARTER";

function buildPaymentInstallments(
  paymentTerm: PaymentTerm,
  grandTotalCents: number
) {
  const definitions = {
    FULL: [
      { percentage: 100, milestone: "FTO_ACCEPTANCE" as const },
    ],
    HALF_HALF: [
      { percentage: 50, milestone: "FTO_ACCEPTANCE" as const },
      { percentage: 50, milestone: "BEFORE_FINAL_BATCH" as const },
    ],
    HALF_QUARTER_QUARTER: [
      { percentage: 50, milestone: "FTO_ACCEPTANCE" as const },
      { percentage: 25, milestone: "BEFORE_TRAINING" as const },
      { percentage: 25, milestone: "BEFORE_FINAL_BATCH" as const },
    ],
  } satisfies Record<
    PaymentTerm,
    { percentage: number; milestone: "FTO_ACCEPTANCE" | "BEFORE_TRAINING" | "BEFORE_FINAL_BATCH" }[]
  >;

  const selected = definitions[paymentTerm];
  let allocatedCents = 0;

  return selected.map((item, index) => {
    // Make the final installment the remainder so rounded amounts always
    // add up exactly to the FTO grand total.
    const amountCents =
      index === selected.length - 1
        ? grandTotalCents - allocatedCents
        : Math.round((grandTotalCents * item.percentage) / 100);

    allocatedCents += amountCents;

    return {
      installmentNumber: index + 1,
      percentage: item.percentage.toFixed(2),
      amount: fromCents(amountCents),
      milestone: item.milestone,
      status: "PENDING" as const,
    };
  });
}

function makeFtoNumber() {
  return `FTO-${new Date().getFullYear()}-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase()}`;
}

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

/** GET: Fetch FTO and server-calculated rate-card preview. */
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
      select: {
        id: true,
        requestNumber: true,
        status: true,
        programs: {
          include: {
            program: {
              select: {
                code: true,
                title: true,
                duration: true,
              },
            },
          },
        },
      },
    });

    if (!serviceRequest) {
      return apiError("Service request not found.", 404);
    }

    const fto = await prisma.finalTrainingOffer.findUnique({
      where: { requestId: id },
      include: { programs: true, paymentInstallments: true },
    });

    const pricingPreview = serviceRequest.programs.map((item) => {
      const code = item.program.code;
      const rateProgram = getRateCardProgram(code);
      const isTtm = rateProgram?.family === "TTM";

      const categoryRate = isTtm
        ? null
        : getRateCardPrice(code, item.participants);

      return {
        programCode: code,
        title: item.program.title,
        participants: item.participants,
        batches: item.expectedBatches,
        batchCategory: categoryRate?.category ?? null,
        pricePerBatch: categoryRate?.pricePerBatch ?? null,
        lineTotal: categoryRate
          ? categoryRate.pricePerBatch * item.expectedBatches
          : null,
        rateStatus: rateProgram?.rateStatus ?? "RATE_NOT_FOUND",
        isTtm,
        option1: isTtm
          ? getRateCardPrice(code, item.participants, "OPTION_1")
            ?.pricePerBatch ?? null
          : null,
        option2: isTtm
          ? getRateCardPrice(code, item.participants, "OPTION_2")
            ?.pricePerBatch ?? null
          : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        fto,
        pricingPreview,
        rateCardRevision: "CLP-01-Rev-1",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("FTO Fetch API Error:", error);
    return apiError("Unable to fetch FTO details.", 500);
  }
}

/** POST: Create an FTO draft. Prices are resolved on the server. */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);
    if (auth.response) return auth.response;

    const { id } = await context.params;
    const body = await request.json();

    const {
      ttmOptions = {},
      logisticsCharges = 0,
      otherCharges = 0,
      gstPercent = 18,
      validUntil,
      jurisdiction,
      terms,
      specialRemarks,

      // Additional official FTO fields
      clientPoNumber,
      confirmedTrainingSchedule,
      dailyTrainingTiming,
      paymentMilestones,
      logisticsTreatment,
      paymentTerm = "HALF_HALF",
    } = body as {
      ttmOptions?: Record<string, TtmOption>;
      logisticsCharges?: number;
      otherCharges?: number;
      gstPercent?: number;
      validUntil?: string | null;
      jurisdiction?: string;
      terms?: string;
      specialRemarks?: string;

      clientPoNumber?: string | null;
      confirmedTrainingSchedule?: string | null;
      dailyTrainingTiming?: string | null;
      paymentMilestones?: string | null;
      logisticsTreatment?: string | null;
      paymentTerm?: PaymentTerm;
    };

    if (
      paymentTerm !== "FULL" &&
      paymentTerm !== "HALF_HALF" &&
      paymentTerm !== "HALF_QUARTER_QUARTER"
    ) {
      return apiError("Please select a valid payment term.");
    }

    if (
      !ttmOptions ||
      typeof ttmOptions !== "object" ||
      Array.isArray(ttmOptions) ||
      !isValidAmount(logisticsCharges) ||
      !isValidAmount(otherCharges) ||
      !isValidAmount(gstPercent) ||
      gstPercent > 100
    ) {
      return apiError("Please enter valid charges and GST values.");
    }

    // Validate additional FTO fields.
    if (
      !isOptionalString(clientPoNumber, 200) ||
      !isOptionalString(confirmedTrainingSchedule, 5000) ||
      !isOptionalString(dailyTrainingTiming, 500) ||
      !isOptionalString(paymentMilestones, 5000) ||
      !isOptionalString(logisticsTreatment, 3000) ||
      !isOptionalString(jurisdiction, 500) ||
      !isOptionalString(terms, 10000) ||
      !isOptionalString(specialRemarks, 5000)
    ) {
      return apiError("One or more FTO text fields are invalid or too long.");
    }

    let parsedValidUntil: Date;

    if (validUntil) {
      parsedValidUntil = new Date(validUntil);

      if (
        Number.isNaN(parsedValidUntil.getTime()) ||
        parsedValidUntil.getTime() < Date.now()
      ) {
        return apiError(
          "FTO validity date must be a valid future date."
        );
      }
    } else {
      // Default validity: 30 calendar days from issue date.
      parsedValidUntil = new Date();
      parsedValidUntil.setDate(parsedValidUntil.getDate() + 30);
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const serviceRequest = await tx.serviceRequest.findUnique({
          where: { id },
          include: {
            programs: {
              include: {
                program: {
                  select: {
                    code: true,
                    title: true,
                    duration: true,
                  },
                },
              },
            },
            finalTrainingOffer: {
              select: { id: true },
            },
          },
        });

        if (!serviceRequest) {
          throw new Error("REQUEST_NOT_FOUND");
        }

        if (serviceRequest.status !== "REQUEST_ACCEPTED") {
          throw new Error("INVALID_REQUEST_STATUS");
        }

        if (serviceRequest.finalTrainingOffer) {
          throw new Error("FTO_ALREADY_EXISTS");
        }

        if (serviceRequest.programs.length === 0) {
          throw new Error("NO_REQUEST_PROGRAMS");
        }

        const ftoPrograms = serviceRequest.programs.map((item) => {
          const code = item.program.code;
          const rateProgram = getRateCardProgram(code);

          if (!rateProgram) {
            throw new Error(`RATE_NOT_FOUND:${code}`);
          }

          let selectedOption: TtmOption | null = null;

          if (rateProgram.family === "TTM") {
            const option = ttmOptions[code];

            if (
              option !== "OPTION_1" &&
              option !== "OPTION_2"
            ) {
              throw new Error(`TTM_OPTION_REQUIRED:${code}`);
            }

            selectedOption = option;

            if (
              process.env.CLP_TTM_OPTION_BASIS_CONFIRMED !== "true"
            ) {
              throw new Error("TTM_BASIS_NOT_CONFIRMED");
            }
          } else if (
            process.env.CLP_RATE_CARD_APPROVED !== "true"
          ) {
            throw new Error("RATE_CARD_NOT_APPROVED");
          }

          const rate = getRateCardPrice(
            code,
            item.participants,
            selectedOption
          );

          if (!rate) {
            throw new Error(`RATE_NOT_FOUND:${code}`);
          }

          const totalCents =
            toCents(rate.pricePerBatch) * item.expectedBatches;

          return {
            programCode: code,
            programTitle: item.program.title,
            duration: item.program.duration,
            deliveryMode: item.preferredMode,
            participants: item.participants,
            batches: item.expectedBatches,
            pricePerBatch: fromCents(
              toCents(rate.pricePerBatch)
            ),
            totalAmount: fromCents(totalCents),
            totalCents,
          };
        });

        const subtotalCents = ftoPrograms.reduce(
          (sum, item) => sum + item.totalCents,
          0
        );

        const logisticsCents = toCents(logisticsCharges);
        const otherCents = toCents(otherCharges);

        const taxableCents =
          subtotalCents + logisticsCents + otherCents;

        const gstCents = Math.round(
          (taxableCents * gstPercent) / 100
        );

        const grandTotalCents = taxableCents + gstCents;

        const fto = await tx.finalTrainingOffer.create({
          data: {
            ftoNumber: makeFtoNumber(),
            requestId: id,
            currency: "INR",

            subtotal: fromCents(subtotalCents),

            // Legacy database fields retained.
            discountPercent: "0.00",
            discountAmount: "0.00",

            logisticsCharges: fromCents(logisticsCents),
            otherCharges: fromCents(otherCents),
            taxableAmount: fromCents(taxableCents),
            gstPercent: gstPercent.toFixed(2),
            gstAmount: fromCents(gstCents),
            grandTotal: fromCents(grandTotalCents),

            validUntil: parsedValidUntil,
            jurisdiction: cleanOptionalString(jurisdiction),
            terms: cleanOptionalString(terms),
            specialRemarks: cleanOptionalString(specialRemarks),
            paymentTerm,

            // Additional official FTO fields
            clientPoNumber: cleanOptionalString(clientPoNumber),
            confirmedTrainingSchedule:
              cleanOptionalString(confirmedTrainingSchedule),
            dailyTrainingTiming:
              cleanOptionalString(dailyTrainingTiming),
            paymentMilestones:
              cleanOptionalString(paymentMilestones),
            logisticsTreatment:
              cleanOptionalString(logisticsTreatment),

            createdById: auth.user.id,

            programs: {
              create: ftoPrograms.map(
                ({ totalCents: _totalCents, ...item }) => item
              ),
            },
            paymentInstallments: {
              create: buildPaymentInstallments(paymentTerm, grandTotalCents),
            },
          },
          include: {
            programs: true,
            paymentInstallments: true,
          },
        });

        await tx.serviceRequest.update({
          where: { id },
          data: {
            status: "FTO_DRAFT",
          },
        });

        await tx.requestTimeline.create({
          data: {
            requestId: id,
            actorId: auth.user.id,
            status: "FTO_DRAFT",
            remarks: `FTO ${fto.ftoNumber} created as a draft using CLP-01-Rev-1 rate card.`,
          },
        });

        return fto;
      },
      {
        // Increased Prisma interactive transaction limits.
        maxWait: 10000,
        timeout: 20000,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "FTO draft created successfully.",
        fto: result,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;

      const known: Record<
        string,
        { message: string; status: number }
      > = {
        REQUEST_NOT_FOUND: {
          message: "Service request not found.",
          status: 404,
        },
        INVALID_REQUEST_STATUS: {
          message:
            "FTO can only be created after request acceptance.",
          status: 409,
        },
        FTO_ALREADY_EXISTS: {
          message:
            "An FTO already exists for this request.",
          status: 409,
        },
        NO_REQUEST_PROGRAMS: {
          message:
            "No training programmes found in this request.",
          status: 400,
        },
        RATE_CARD_NOT_APPROVED: {
          message:
            "Rate Card is not internally approved yet. FTO creation is blocked.",
          status: 409,
        },
        TTM_BASIS_NOT_CONFIRMED: {
          message:
            "TTM Option 1/2 basis has not been internally confirmed yet.",
          status: 409,
        },
      };

      if (message.startsWith("RATE_NOT_FOUND:")) {
        return apiError(
          `Rate not found for programme ${message.split(":")[1]}.`,
          400
        );
      }

      if (message.startsWith("TTM_OPTION_REQUIRED:")) {
        return apiError(
          `Please select TTM Option 1 or Option 2 for ${message.split(":")[1]}.`,
          400
        );
      }

      if (known[message]) {
        return apiError(
          known[message].message,
          known[message].status
        );
      }
    }

    console.error("FTO Create API Error:", error);

    return apiError(
      "Unable to create FTO draft.",
      500
    );
  }
}


/** PATCH: Send the existing FTO draft to the client. */
export async function PATCH(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireApiRole(["SUB_ADMIN"]);
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const result = await prisma.$transaction(async (tx) => {
      const serviceRequest = await tx.serviceRequest.findUnique({
        where: { id },
        select: {
          id: true,
          requestNumber: true,
          status: true,
          finalTrainingOffer: {
            select: {
              id: true,
              ftoNumber: true,
              jurisdiction: true,
              validUntil: true,
            },
          },
        },
      });

      if (!serviceRequest) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      if (serviceRequest.status !== "FTO_DRAFT") {
        throw new Error("INVALID_FTO_STATUS");
      }

      const fto = serviceRequest.finalTrainingOffer;

      if (!fto) {
        throw new Error("FTO_NOT_FOUND");
      }

      if (!fto.jurisdiction?.trim()) {
        throw new Error("JURISDICTION_REQUIRED");
      }

      if (!fto.validUntil) {
        throw new Error("VALIDITY_REQUIRED");
      }

      // Allow the offer to remain valid through its expiry date.
      const expiryDate = new Date(fto.validUntil)
        .toISOString()
        .slice(0, 10);

      const today = new Date().toISOString().slice(0, 10);

      if (expiryDate < today) {
        throw new Error("FTO_EXPIRED");
      }

      // Prevent duplicate or concurrent send actions.
      const updated = await tx.serviceRequest.updateMany({
        where: {
          id,
          status: "FTO_DRAFT",
        },
        data: {
          status: "FTO_SENT",
        },
      });

      if (updated.count !== 1) {
        throw new Error("INVALID_FTO_STATUS");
      }

      await tx.requestTimeline.create({
        data: {
          requestId: id,
          actorId: auth.user.id,
          status: "FTO_SENT",
          remarks: `FTO ${fto.ftoNumber} sent to client.`,
        },
      });

      return fto;
    });

    return NextResponse.json({
      success: true,
      message: `FTO ${result.ftoNumber} has been sent to the client.`,
      fto: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      const known: Record<string, { message: string; status: number }> = {
        REQUEST_NOT_FOUND: {
          message: "Service request not found.",
          status: 404,
        },
        FTO_NOT_FOUND: {
          message: "Create the FTO draft before sending it.",
          status: 404,
        },
        INVALID_FTO_STATUS: {
          message: "Only an FTO draft can be sent to the client.",
          status: 409,
        },
        JURISDICTION_REQUIRED: {
          message: "Please complete the FTO jurisdiction before sending.",
          status: 409,
        },
        VALIDITY_REQUIRED: {
          message: "FTO validity date is missing.",
          status: 409,
        },
        FTO_EXPIRED: {
          message: "This FTO has expired. Update its validity before sending.",
          status: 409,
        },
      };

      const knownError = known[error.message];

      if (knownError) {
        return apiError(knownError.message, knownError.status);
      }
    }

    console.error("FTO Send API Error:", error);
    return apiError("Unable to send FTO to the client.", 500);
  }
}
