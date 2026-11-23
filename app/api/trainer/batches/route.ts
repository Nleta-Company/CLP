import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiRole(["TRAINER"]);
    if (auth.response) return auth.response;

    const trainerId = auth.user.id;
    const assignmentId =
      request.nextUrl.searchParams.get("assignmentId")?.trim() || null;

    // Explicit Prisma input type prevents TypeScript from inferring
    // readonly enum arrays, which are not valid Prisma filters.
    const where = {
      status: {
        not: "CANCELLED" as const,
      },
      trainerAssignment: {
        is: {
          ...(assignmentId ? { id: assignmentId } : {}),
          trainerId,
          status: {
            in: ["ACCEPTED", "COMPLETED"] as const,
          },
        },
      },
    } satisfies NonNullable<
      Parameters<typeof prisma.batch.findMany>[0]
    >["where"];

    // Fetch authorized batches and original participant details submitted by client.
    const initialBatches = await prisma.batch.findMany({
      where,
      include: {
        requestProgram: {
          include: {
            program: true,
            participantsDetails: {
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                name: true,
                email: true,
                designation: true,
                phone: true,
              },
            },
            request: {
              include: {
                client: {
                  include: {
                    clientProfile: true,
                  },
                },
                ptaAgreement: true,
                tafAgreement: true,
                finalTrainingOffer: {
                  include: {
                    programs: true,
                    paymentInstallments: true,
                  },
                },
              },
            },
          },
        },
        trainerAssignment: {
          include: {
            trainer: {
              select: { id: true, name: true, email: true },
            },
            assignedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        participantsList: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            designation: true,
            employeeId: true,
            createdAt: true,
            attendanceRecords: {
              orderBy: { attendanceDate: "desc" },
              take: 10,
              select: {
                attendanceDate: true,
                status: true,
                remarks: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    });

    // Repair legacy batches that were created before participant-copy logic existed.
    // Only empty batches are populated. Existing participant/attendance records
    // are never overwritten or duplicated by this repair.
    let syncedParticipants = 0;
    const syncWarnings: string[] = [];

    await prisma.$transaction(
      async (tx) => {
        for (const batch of initialBatches) {
          if (batch.participantsList.length > 0) continue;

          const requestProgram = batch.requestProgram;
          const sourceParticipants = requestProgram.participantsDetails;
          const totalParticipants = requestProgram.participants;
          const expectedBatches = requestProgram.expectedBatches;

          if (
            !Number.isInteger(expectedBatches) ||
            expectedBatches < 1 ||
            !Number.isInteger(totalParticipants) ||
            totalParticipants < 0
          ) {
            syncWarnings.push(
              `Batch ${batch.batchNumber}: invalid participant/batch configuration.`
            );
            continue;
          }

          if (sourceParticipants.length !== totalParticipants) {
            syncWarnings.push(
              `Batch ${batch.batchNumber}: client participant details (${sourceParticipants.length}) do not match requested count (${totalParticipants}).`
            );
            continue;
          }

          if (
            !Number.isInteger(batch.batchNumber) ||
            batch.batchNumber < 1 ||
            batch.batchNumber > expectedBatches
          ) {
            syncWarnings.push(
              `Batch ${batch.batchNumber}: batch number is outside the expected range.`
            );
            continue;
          }

          const base = Math.floor(totalParticipants / expectedBatches);
          const remainder = totalParticipants % expectedBatches;
          const count = base + (batch.batchNumber <= remainder ? 1 : 0);
          const start =
            (batch.batchNumber - 1) * base +
            Math.min(batch.batchNumber - 1, remainder);

          const assignedParticipants = sourceParticipants.slice(
            start,
            start + count
          );

          // Re-check inside the transaction before inserting.
          const existingCount = await tx.batchParticipant.count({
            where: { batchId: batch.id },
          });

          if (existingCount > 0) continue;

          if (assignedParticipants.length > 0) {
            const result = await tx.batchParticipant.createMany({
              data: assignedParticipants.map((participant) => ({
                batchId: batch.id,
                name: participant.name,
                email: participant.email,
                phone: participant.phone,
                designation: participant.designation,
              })),
            });

            syncedParticipants += result.count;
          }
        }
      },
      {
        maxWait: 10000,
        timeout: 20000,
        isolationLevel: "Serializable",
      }
    );

    // Re-fetch after synchronization so participantsList contains actual
    // BatchParticipant IDs required by the attendance API.
    const batches = await prisma.batch.findMany({
      where,
      include: {
        requestProgram: {
          include: {
            program: true,
            participantsDetails: {
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                name: true,
                email: true,
                designation: true,
                phone: true,
              },
            },
            request: {
              include: {
                client: {
                  include: {
                    clientProfile: true,
                  },
                },
                ptaAgreement: true,
                tafAgreement: true,
                finalTrainingOffer: {
                  include: {
                    programs: true,
                    paymentInstallments: true,
                  },
                },
              },
            },
          },
        },
        trainerAssignment: {
          include: {
            trainer: {
              select: { id: true, name: true, email: true },
            },
            assignedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        participantsList: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            designation: true,
            employeeId: true,
            createdAt: true,
            attendanceRecords: {
              orderBy: { attendanceDate: "desc" },
              take: 10,
              select: {
                attendanceDate: true,
                status: true,
                remarks: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    });

    const stats = {
      total: batches.length,
      planned: batches.filter((batch) => batch.status === "PLANNED").length,
      inProgress: batches.filter((batch) => batch.status === "IN_PROGRESS").length,
      completed: batches.filter((batch) => batch.status === "COMPLETED").length,
      cancelled: batches.filter((batch) => batch.status === "CANCELLED").length,
    };

    return NextResponse.json(
      {
        success: true,
        assignmentId,
        batches,
        stats,
        participantSync: {
          synced: syncedParticipants,
          warnings: syncWarnings,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Trainer Batches GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch trainer batches.",
      },
      { status: 500 }
    );
  }
}
