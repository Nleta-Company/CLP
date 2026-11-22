
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  PlayCircle,
  RefreshCw,
  Users,
} from "lucide-react";

type Assignment = {
  id: string;
  status: string;
  assignmentScope: "ENTIRE_REQUEST" | "SPECIFIC_PROGRAMME";
  batchNumber: number | null;
  assignedAt: string;
  remarks: string | null;
  assignedPrograms: {
    id: string;
    participants: number;
    expectedBatches: number;
    program: {
      code: string;
      title: string;
      category: string;
      duration: string;
    };
  }[];
  request: {
    id: string;
    requestNumber: string;
    organisation: string | null;
    trainingLocation: string | null;
    preferredDate: string | null;
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

type DashboardResponse = {
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

function formatDate(date: string | null) {
  if (!date) return "Not scheduled";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusStyle(status: string) {
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

export default function TrainerDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchAssignments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/trainer/assignments", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load trainer dashboard."
        );
      }

      setData(result);
    } catch (err) {
      console.error("Trainer Dashboard Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAssignments();
  }, []);

  const stats = [
    {
      title: "Total Assignments",
      value: data?.stats.total ?? 0,
      icon: BriefcaseBusiness,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Acceptance",
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

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-teal-700">
            TRAINER WORKSPACE
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Trainer Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your training assignments, programmes and batches.
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

      {/* STATISTICS */}
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

      {/* ASSIGNMENTS */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              My Training Assignments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Training requests assigned to you by Sub Admin.
            </p>
          </div>

          <Link
            href="/trainer/assignments"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            View all assignments
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading your assignments...
            </div>
          ) : !data?.assignments.length ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BriefcaseBusiness className="size-7" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No assignments yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your assigned training requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-200 hover:shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {assignment.request.organisation ||
                          assignment.request.client.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {assignment.request.requestNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {assignment.request.tafAgreement?.tafNumber ||
                          "TAF unavailable"}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                        assignment.status
                      )}`}
                    >
                      {assignment.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="size-4 text-slate-400" />
                      {assignment.request.client.name}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="size-4 text-slate-400" />
                      {formatDate(
                        assignment.request.preferredDate
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="size-4 text-slate-400" />
                      {assignment.request.trainingLocation ||
                        "Location not specified"}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <GraduationCap className="size-4 text-slate-400" />
                      {assignment.assignmentScope === "ENTIRE_REQUEST"
                        ? "Entire Request"
                        : "Specific Programme"}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Assigned Programmes
                    </p>

                    <div className="space-y-2">
                      {assignment.assignedPrograms.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg bg-slate-50 p-3"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {item.program.code} — {item.program.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Participants: {item.participants}
                            {" · "}
                            Expected batches: {item.expectedBatches}
                          </p>
                        </div>
                      ))}

                      {assignment.assignedPrograms.length === 0 && (
                        <p className="text-sm text-slate-400">
                          No programme details available.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="mt-4 flex justify-end">
                    {assignment.status === "ACCEPTED" ? (
                      <Link
                        href={`/trainer/training/${assignment.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                      >
                        <PlayCircle className="size-4" />
                        Open Training Workspace
                        <ArrowRight className="size-4" />
                      </Link>
                    ) : (
                      <Link
                        href="/trainer/assignments"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View Assignment
                        <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
