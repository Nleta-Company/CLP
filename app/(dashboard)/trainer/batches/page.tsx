
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Users,
  ClipboardCheck,
  Save,
  ArrowLeft,
} from "lucide-react";

type Participant = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  employeeId?: string | null;
};

type Batch = {
  id: string;
  batchNumber: number;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate: string | null;
  endDate: string | null;
  mode: string;
  location: string | null;
  participantsList: Participant[];
  requestProgram: {
    id: string;
    participants: number;
    expectedBatches: number;
    program: {
      id: string;
      code: string;
      title: string;
      category?: string | null;
      duration?: string | null;
    };
    request: {
      requestNumber: string;
      organisation: string | null;
      client: {
        id: string;
        name: string;
        email: string;
      };
      tafAgreement?: {
        tafNumber: string;
        status: string;
      } | null;
    };
  };
  trainerAssignment: {
    id: string;
    status: string;
    trainer: {
      id: string;
      name: string;
      email: string;
    };
  };
};

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

type AttendanceEntry = {
  status: AttendanceStatus;
  remarks: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  batches: Batch[];
  stats: {
    total: number;
    planned: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
};

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function batchStatusClasses(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-blue-50 text-blue-700";
    case "IN_PROGRESS":
      return "bg-emerald-50 text-emerald-700";
    case "PLANNED":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function TrainerBatchesPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [assignmentId, setAssignmentId] = useState("");
  const [requestedBatchId, setRequestedBatchId] = useState("");

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const [attendanceDate, setAttendanceDate] = useState(getLocalDate());
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceEntry>
  >({});

  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceSuccess, setAttendanceSuccess] = useState("");

  // Read URL parameters without useSearchParams.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setAssignmentId(params.get("assignmentId") || "");
    setRequestedBatchId(params.get("batchId") || "");
  }, []);

  // Fetch actual batches.
  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const query = assignmentId
        ? `?assignmentId=${encodeURIComponent(assignmentId)}`
        : "";

      const response = await fetch(`/api/trainer/batches${query}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to fetch batches.");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to fetch batches."
      );
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (assignmentId || window.location.search === "") {
      void fetchBatches();
    }
  }, [assignmentId, fetchBatches]);

  const visibleBatches = useMemo(() => {
    const batches = data?.batches ?? [];
    const searchText = search.trim().toLowerCase();

    if (!searchText) return batches;

    return batches.filter((batch) => {
      const program = batch.requestProgram?.program;
      const request = batch.requestProgram?.request;

      return (
        `${program?.code ?? ""} ${program?.title ?? ""}`
          .toLowerCase()
          .includes(searchText) ||
        (request?.requestNumber ?? "").toLowerCase().includes(searchText) ||
        (request?.organisation ?? "").toLowerCase().includes(searchText) ||
        (request?.client?.name ?? "").toLowerCase().includes(searchText) ||
        String(batch.batchNumber).includes(searchText)
      );
    });
  }, [data, search]);

  // Fetch saved attendance for selected batch and date.
  const fetchAttendance = useCallback(
    async (batchId: string, date: string, batch: Batch) => {
      try {
        setAttendanceLoading(true);
        setAttendanceError("");
        setAttendanceSuccess("");

        const response = await fetch(
          `/api/trainer/batches/${batchId}/attendance?date=${encodeURIComponent(date)}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load attendance.");
        }

        const savedRecords = result.attendanceByParticipant ?? {};
        const nextAttendance: Record<string, AttendanceEntry> = {};

        for (const participant of batch.participantsList ?? []) {
          const saved = savedRecords[participant.id];

          nextAttendance[participant.id] = {
            status: saved?.status || "PRESENT",
            remarks: saved?.remarks || "",
          };
        }

        setAttendance(nextAttendance);
      } catch (err) {
        setAttendanceError(
          err instanceof Error
            ? err.message
            : "Unable to load saved attendance."
        );
      } finally {
        setAttendanceLoading(false);
      }
    },
    []
  );

  function openBatch(batch: Batch) {
    setSelectedBatch(batch);
    setAttendanceDate(getLocalDate());
    setAttendanceError("");
    setAttendanceSuccess("");
    setAttendance({});
    void fetchAttendance(batch.id, getLocalDate(), batch);
  }

  function updateAttendance(
    participantId: string,
    field: keyof AttendanceEntry,
    value: string
  ) {
    setAttendance((previous) => ({
      ...previous,
      [participantId]: {
        ...(previous[participantId] ?? {
          status: "PRESENT",
          remarks: "",
        }),
        [field]: value,
      },
    }));

    setAttendanceSuccess("");
  }

  async function handleDateChange(value: string) {
    setAttendanceDate(value);

    if (selectedBatch && value) {
      await fetchAttendance(selectedBatch.id, value, selectedBatch);
    }
  }

  async function saveAttendance() {
    if (!selectedBatch) return;

    const participants = selectedBatch.participantsList ?? [];

    if (!participants.length) {
      setAttendanceError("No registered participants found in this batch.");
      return;
    }

    const missing = participants.filter(
      (participant) => !attendance[participant.id]?.status
    );

    if (missing.length) {
      setAttendanceError("Please select attendance for every participant.");
      return;
    }

    try {
      setSaving(true);
      setAttendanceError("");
      setAttendanceSuccess("");

      const records = participants.map((participant) => ({
        participantId: participant.id,
        status: attendance[participant.id].status,
        remarks: attendance[participant.id].remarks.trim(),
      }));

      const response = await fetch(
        `/api/trainer/batches/${selectedBatch.id}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendanceDate,
            records,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save attendance.");
      }

      setAttendanceSuccess(
        `Attendance saved successfully for ${result.savedCount ?? records.length} participants.`
      );
    } catch (err) {
      setAttendanceError(
        err instanceof Error ? err.message : "Unable to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  const stats = [
    {
      label: "Total Batches",
      value: data?.stats.total ?? 0,
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Planned",
      value: data?.stats.planned ?? 0,
      icon: CalendarDays,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "In Progress",
      value: data?.stats.inProgress ?? 0,
      icon: Clock3,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Completed",
      value: data?.stats.completed ?? 0,
      icon: CheckCircle2,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  // Attendance screen
  if (selectedBatch) {
    const program = selectedBatch.requestProgram.program;
    const request = selectedBatch.requestProgram.request;
    const participants = selectedBatch.participantsList ?? [];

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          type="button"
          onClick={() => {
            setSelectedBatch(null);
            setAttendance({});
            setAttendanceError("");
            setAttendanceSuccess("");
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"
        >
          <ArrowLeft className="size-4" />
          Back to My Batches
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-semibold text-teal-700">
                TRAINING ATTENDANCE
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Batch {selectedBatch.batchNumber}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {program.code} - {program.title}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${batchStatusClasses(selectedBatch.status)}`}
            >
              {selectedBatch.status.replace("_", " ")}
            </span>
          </div>

          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">Client</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {request.organisation || request.client.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Request Number</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {request.requestNumber}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Training Location</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-800">
                <MapPin className="size-4 text-slate-400" />
                {selectedBatch.location || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Participants</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {participants.length}
              </p>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Participant Attendance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select the training date and mark each participant's attendance.
              </p>
            </div>

            <div className="w-full sm:w-52">
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Training Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(event) => handleDateChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="p-5">
            {attendanceError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {attendanceError}
              </div>
            )}

            {attendanceSuccess && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {attendanceSuccess}
              </div>
            )}

            {attendanceLoading ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Loading attendance...
              </div>
            ) : !participants.length ? (
              <div className="py-12 text-center">
                <Users className="mx-auto size-9 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-700">
                  No participants found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Participants need to be added to this batch by Sub Admin.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Present
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-red-500" />
                    Absent
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-amber-500" />
                    Late
                  </span>
                </div>

                <div className="space-y-3">
                  {participants.map((participant, index) => {
                    const entry = attendance[participant.id] ?? {
                      status: "PRESENT" as AttendanceStatus,
                      remarks: "",
                    };

                    return (
                      <div
                        key={participant.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                          <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">
                              {index + 1}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {participant.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {participant.employeeId
                                  ? `ID: ${participant.employeeId}`
                                  : participant.email || "No contact details"}
                              </p>
                              {participant.phone && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {participant.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {(
                              ["PRESENT", "ABSENT", "LATE"] as const
                            ).map((status) => {
                              const active = entry.status === status;

                              const styles = {
                                PRESENT: active
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
                                ABSENT: active
                                  ? "border-red-600 bg-red-600 text-white"
                                  : "border-red-200 text-red-700 hover:bg-red-50",
                                LATE: active
                                  ? "border-amber-500 bg-amber-500 text-white"
                                  : "border-amber-200 text-amber-700 hover:bg-amber-50",
                              };

                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() =>
                                    updateAttendance(
                                      participant.id,
                                      "status",
                                      status
                                    )
                                  }
                                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${styles[status]}`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-3">
                          <input
                            type="text"
                            value={entry.remarks}
                            onChange={(event) =>
                              updateAttendance(
                                participant.id,
                                "remarks",
                                event.target.value
                              )
                            }
                            maxLength={2000}
                            placeholder="Attendance remarks (optional)"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                  <p className="text-xs text-slate-500">
                    {participants.length} participants · Date: {attendanceDate}
                  </p>

                  <button
                    type="button"
                    onClick={saveAttendance}
                    disabled={saving || attendanceLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {saving ? "Saving Attendance..." : "Save Attendance"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Batch listing screen
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-teal-700">
            TRAINER WORKSPACE
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Batches
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View your assigned training batches and manage participant attendance.
          </p>
        </div>

        <button
          onClick={fetchBatches}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <div className={`flex size-11 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? "—" : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Assigned Training Batches
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Batches assigned to your accepted training assignments.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search batch, client or programme..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-teal-600 sm:w-72"
            />
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading training batches...
            </div>
          ) : !visibleBatches.length ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <GraduationCap className="size-7" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No training batches found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Batches created and assigned by Sub Admin will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {visibleBatches.map((batch) => {
                const program = batch.requestProgram.program;
                const request = batch.requestProgram.request;
                const participants = batch.participantsList ?? [];

                return (
                  <article
                    key={batch.id}
                    className={`rounded-xl border p-5 transition hover:border-teal-200 hover:shadow-sm ${
                      requestedBatchId === batch.id
                        ? "border-teal-400 bg-teal-50/30"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                          {request.requestNumber}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                          Batch {batch.batchNumber}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {request.organisation || request.client.name}
                        </p>
                      </div>

                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${batchStatusClasses(batch.status)}`}>
                        {batch.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-800">
                        {program.code} - {program.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {program.category || "Training Programme"}
                        {program.duration ? ` · ${program.duration}` : ""}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Participants</p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <Users className="size-4 text-slate-400" />
                          {participants.length}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Training Mode</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {batch.mode || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Start Date</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {formatDate(batch.startDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">End Date</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {formatDate(batch.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                      <MapPin className="size-4 shrink-0" />
                      {batch.location || "Location not specified"}
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => openBatch(batch)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                      >
                        <ClipboardCheck className="size-4" />
                        Open Batch & Mark Attendance
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
