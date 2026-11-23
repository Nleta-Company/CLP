import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/api-authorization";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ batchId: string }>;
};

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

type AttendanceInput = {
  participantId: string;
  status: AttendanceStatus;
  remarks?: string | null;
};

function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// Strictly validate YYYY-MM-DD and reject impossible dates.
function parseAttendanceDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

// Every operation verifies that the batch belongs to this trainer.
async function getAuthorizedBatch(batchId: string, trainerId: string) {
  return prisma.batch.findFirst({
    where: {
      id: batchId,
      status: { not: "CANCELLED" },
      trainerAssignment: {
        is: {
          trainerId,
          status: { in: ["ACCEPTED", "COMPLETED"] },
        },
      },
    },
    include: {
      trainerAssignment: {
        select: {
          id: true,
          status: true,
          trainerId: true,
        },
      },
      requestProgram: {
        include: {
          program: {
            select: {
              code: true,
              title: true,
            },
          },
          request: {
            select: {
              requestNumber: true,
              organisation: true,
            },
          },
        },
      },
      participantsList: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          designation: true,
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
      },
    },
  });
}

// GET /api/trainer/batches/[batchId]/attendance?date=YYYY-MM-DD
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireApiRole(["TRAINER"]);
    if (auth.response) return auth.response;

    const { batchId } = await context.params;
    const dateValue = request.nextUrl.searchParams.get("date");
    const attendanceDate = parseAttendanceDate(dateValue);

    if (!attendanceDate) {
      return apiError("Select a valid attendance date.");
    }

    const batch = await getAuthorizedBatch(batchId, auth.user.id);

    if (!batch) {
      return apiError("Batch not found or not assigned to you.", 404);
    }

    const records = await prisma.attendanceRecord.findMany({
      where: {
        attendanceDate,
        participant: { batchId: batch.id },
      },
      select: {
        participantId: true,
        status: true,
        remarks: true,
      },
    });

    const attendanceByParticipant = Object.fromEntries(
      records.map((record) => [
        record.participantId,
        {
          status: record.status,
          remarks: record.remarks ?? "",
        },
      ])
    );

    return NextResponse.json(
      {
        success: true,
        batch: {
          id: batch.id,
          batchNumber: batch.batchNumber,
          participants: batch.participants,
          status: batch.status,
          trainerAssignmentId: batch.trainerAssignmentId,
          program: batch.requestProgram.program,
          request: batch.requestProgram.request,
          participantsList: batch.participantsList,
        },
        attendanceDate: dateValue,
        attendanceByParticipant,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Trainer Attendance GET Error:", error);
    return apiError("Unable to fetch attendance.", 500);
  }
}

// POST /api/trainer/batches/[batchId]/attendance
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireApiRole(["TRAINER"]);
    if (auth.response) return auth.response;

    const { batchId } = await context.params;
    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body.attendanceDate !== "string" ||
      !Array.isArray(body.records)
    ) {
      return apiError("Invalid attendance request.");
    }

    const attendanceDate = parseAttendanceDate(body.attendanceDate);

    if (!attendanceDate) {
      return apiError("Select a valid attendance date.");
    }

    if (body.records.length === 0) {
      return apiError("No attendance records were submitted.");
    }

    const batch = await getAuthorizedBatch(batchId, auth.user.id);

    if (!batch) {
      return apiError("Batch not found or not assigned to you.", 404);
    }

    const allowedParticipantIds = new Set(
      batch.participantsList.map((participant) => participant.id)
    );

    if (allowedParticipantIds.size === 0) {
      return apiError("No participants are registered in this batch.");
    }

    if (body.records.length !== allowedParticipantIds.size) {
      return apiError(
        "Please submit attendance for every participant in this batch."
      );
    }

    const seen = new Set<string>();

    for (const record of body.records) {
      if (
        !record ||
        typeof record.participantId !== "string" ||
        !allowedParticipantIds.has(record.participantId) ||
        !["PRESENT", "ABSENT", "LATE"].includes(record.status) ||
        seen.has(record.participantId)
      ) {
        return apiError("One or more attendance entries are invalid.");
      }

      if (
        record.remarks !== undefined &&
        record.remarks !== null &&
        typeof record.remarks !== "string"
      ) {
        return apiError("Attendance remarks must be text.");
      }

      if (
        typeof record.remarks === "string" &&
        record.remarks.length > 2000
      ) {
        return apiError("Attendance remarks cannot exceed 2000 characters.");
      }

      seen.add(record.participantId);
    }

    const records = body.records as AttendanceInput[];

    await prisma.$transaction(
      records.map((record) =>
        prisma.attendanceRecord.upsert({
          where: {
            participantId_attendanceDate: {
              participantId: record.participantId,
              attendanceDate,
            },
          },
          create: {
            participantId: record.participantId,
            attendanceDate,
            status: record.status,
            remarks: record.remarks?.trim() || null,
            markedById: auth.user.id,
          },
          update: {
            status: record.status,
            remarks: record.remarks?.trim() || null,
            markedById: auth.user.id,
          },
        })
      )
    );

    return NextResponse.json(
      {
        success: true,
        message: "Attendance saved successfully.",
        savedCount: records.length,
        attendanceDate: body.attendanceDate,
        batchId: batch.id,
        trainerAssignmentId: batch.trainerAssignmentId,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Trainer Attendance POST Error:", error);
    return apiError("Unable to save attendance.", 500);
  }
}
