
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  RefreshCw,
  Users,
  X,
  XCircle,
} from "lucide-react";

type Program = {
  id: string;
  participants: number;
  expectedBatches: number;
  program: {
    code: string;
    title: string;
    category: string;
    duration: string;
  };
};

type Assignment = {
  id: string;
  status: string;
  assignmentScope: "ENTIRE_REQUEST" | "SPECIFIC_PROGRAMME";
  batchNumber: number | null;
  assignedAt: string;
  remarks: string | null;
  assignedPrograms: Program[];
  request: {
    id: string;
    requestNumber: string;
    organisation: string | null;
    trainingLocation: string | null;
    preferredDate: string | null;
    alternateDate: string | null;
    client: {
      name: string;
      email: string;
    };
    tafAgreement: {
      tafNumber: string;
      status: string;
    } | null;
  };
};

type ApiResponse = {
  success: boolean;
  stats: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
  };
  assignments: Assignment[];
  message?: string;
};

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClasses(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "bg-emerald-50 text-emerald-700";

    case "REJECTED":
      return "bg-red-50 text-red-700";

    case "COMPLETED":
      return "bg-blue-50 text-blue-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function TrainerAssignmentsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/trainer/assignments", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to fetch assignments."
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  async function updateAssignment(
    assignment: Assignment,
    decision: "ACCEPT" | "REJECT",
    remarks = ""
  ) {
    try {
      setActionLoading(true);
      setActionError("");

      const response = await fetch("/api/trainer/assignments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId: assignment.id,
          decision,
          remarks,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update assignment."
        );
      }

      setSelectedAssignment(null);
      setRejectionReason("");

      await fetchAssignments();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to update assignment."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function submitRejection() {
    if (rejectionReason.trim().length < 10) {
      setActionError(
        "Please enter a rejection reason of at least 10 characters."
      );
      return;
    }

    if (selectedAssignment) {
      updateAssignment(
        selectedAssignment,
        "REJECT",
        rejectionReason.trim()
      );
    }
  }

  const stats = [
    {
      title: "Total Assignments",
      value: data?.stats.total ?? 0,
      icon: BriefcaseBusiness,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: data?.stats.pending ?? 0,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Accepted",
      value: data?.stats.accepted ?? 0,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Completed",
      value: data?.stats.completed ?? 0,
      icon: GraduationCap,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-teal-700">
            TRAINER WORKSPACE
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Assignments
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review your assigned programmes and respond to training requests.
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ACTION FEEDBACK */}
      {actionError && !selectedAssignment && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${stat.color}`}
                >
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

      {/* ASSIGNMENT LIST */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Assigned Training Requests
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            All assignments allocated to your trainer account.
          </p>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading assignments...
            </div>
          ) : !data?.assignments.length ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BriefcaseBusiness className="size-7" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No assignments found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                New assignments from Sub Admin will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {data.assignments.map((assignment) => (
                <article
                  key={assignment.id}
                  className="rounded-xl border border-slate-200 p-5 transition hover:border-teal-200 hover:shadow-sm"
                >
                  {/* REQUEST HEADER */}
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {assignment.request.organisation ||
                          assignment.request.client.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Request: {assignment.request.requestNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        TAF:{" "}
                        {assignment.request.tafAgreement?.tafNumber ||
                          "Not available"}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses(
                        assignment.status
                      )}`}
                    >
                      {assignment.status}
                    </span>
                  </div>

                  {/* REQUEST DETAILS */}
                  <div className="mt-5 grid gap-4 border-y border-slate-100 py-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 size-4 text-slate-400" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Client
                        </p>

                        <p className="text-sm font-medium text-slate-700">
                          {assignment.request.client.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 size-4 text-slate-400" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Preferred Date
                        </p>

                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(
                            assignment.request.preferredDate
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 text-slate-400" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Training Location
                        </p>

                        <p className="text-sm font-medium text-slate-700">
                          {assignment.request.trainingLocation ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ASSIGNMENT SCOPE */}
                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">
                        Assignment Scope
                      </h3>

                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                        {assignment.assignmentScope === "ENTIRE_REQUEST"
                          ? "Entire Request - All Programmes"
                          : "Specific Programme"}
                      </span>
                    </div>

                    {/* PROGRAMMES */}
                    <div className="mt-3 space-y-3">
                      {assignment.assignedPrograms.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="flex flex-col justify-between gap-2 sm:flex-row">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.program.code} - {item.program.title}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {item.program.category} ·{" "}
                                {item.program.duration}
                              </p>
                            </div>

                            {assignment.batchNumber ? (
                              <span className="w-fit rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                Batch {assignment.batchNumber}
                              </span>
                            ) : (
                              <span className="w-fit rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                All batches
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                            <span>
                              Participants: {item.participants}
                            </span>

                            <span>
                              Expected batches: {item.expectedBatches}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* REJECTION REASON */}
                  {assignment.status === "REJECTED" && (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                        Rejection Reason
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-red-800">
                        {assignment.remarks ||
                          "No rejection remarks were provided."}
                      </p>
                    </div>
                  )}

                  {/* ACCEPTED ASSIGNMENT */}
                  {assignment.status === "ACCEPTED" && (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                        You accepted this assignment. Sub Admin can now
                        proceed with the next steps.
                      </div>

                      {/* TRAINING WORKSPACE BUTTON */}
                      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">
                            Training Workspace
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Access your assigned batches, attendance,
                            assessments and ATR-01 report.
                          </p>
                        </div>

                        <Link
                          href={`/trainer/training/${assignment.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
                        >
                          <GraduationCap className="size-4" />
                          Open Training Workspace
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* COMPLETED ASSIGNMENT */}
                  {assignment.status === "COMPLETED" && (
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                      This training assignment has been marked as completed.
                    </div>
                  )}

                  {/* ACCEPT / REJECT ACTIONS */}
                  {assignment.status === "ASSIGNED" && (
                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                      <button
                        onClick={() => {
                          setActionError("");
                          setRejectionReason("");
                          setSelectedAssignment(assignment);
                        }}
                        disabled={actionLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle className="size-4" />
                        Reject Assignment
                      </button>

                      <button
                        onClick={() =>
                          updateAssignment(assignment, "ACCEPT")
                        }
                        disabled={actionLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                      >
                        <CheckCircle2 className="size-4" />
                        Accept Assignment
                      </button>
                    </div>
                  )}

                  {/* RESPONSE HISTORY */}
                  {assignment.status !== "ASSIGNED" && (
                    <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      {assignment.status === "REJECTED"
                        ? "Your rejection response has been recorded."
                        : assignment.status === "ACCEPTED"
                          ? "Your acceptance response has been recorded."
                          : "This assignment is no longer awaiting your response."}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* REJECTION MODAL */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Reject Assignment
              </h2>

              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setRejectionReason("");
                  setActionError("");
                }}
                disabled={actionLoading}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Please provide a reason for rejecting this training assignment.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(event) => {
                setRejectionReason(event.target.value);
                setActionError("");
              }}
              rows={4}
              maxLength={1000}
              placeholder="Enter your reason (minimum 10 characters)..."
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {rejectionReason.length}/1000
            </p>

            {actionError && (
              <p className="mt-2 text-sm text-red-600">
                {actionError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setRejectionReason("");
                  setActionError("");
                }}
                disabled={actionLoading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={submitRejection}
                disabled={actionLoading}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading
                  ? "Submitting..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
