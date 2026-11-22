
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  ClipboardCheck,
  FileText,
  ArrowRight,
  AlertCircle,
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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return date.toLocaleDateString("en-IN", {
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

export default function TrainerDashboardPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
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
    fetchDashboard();
  }, [fetchDashboard]);

  const assignments = data?.assignments ?? [];

  const upcomingAssignments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return assignments
      .filter((assignment) => {
        if (assignment.status !== "ACCEPTED") return false;

        const dateValue =
          assignment.request.preferredDate ||
          assignment.request.alternateDate;

        if (!dateValue) return false;

        const date = new Date(dateValue);

        return !Number.isNaN(date.getTime()) && date >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.request.preferredDate ||
          a.request.alternateDate ||
          ""
        ).getTime();

        const dateB = new Date(
          b.request.preferredDate ||
          b.request.alternateDate ||
          ""
        ).getTime();

        return dateA - dateB;
      })
      .slice(0, 5);
  }, [assignments]);

  const recentAssignments = useMemo(() => {
    return [...assignments]
      .sort(
        (a, b) =>
          new Date(b.assignedAt).getTime() -
          new Date(a.assignedAt).getTime()
      )
      .slice(0, 5);
  }, [assignments]);

  const totalParticipants = assignments
    .filter((item) => item.status === "ACCEPTED")
    .reduce(
      (total, assignment) =>
        total +
        assignment.assignedPrograms.reduce(
          (sum, program) => sum + program.participants,
          0
        ),
      0
    );

  const stats = [
    {
      title: "Total Assignments",
      value: data?.stats.total ?? 0,
      icon: BriefcaseBusiness,
      color: "bg-blue-50 text-blue-600",
      description: "All allocated requests",
    },
    {
      title: "Pending Response",
      value: data?.stats.pending ?? 0,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
      description: "Awaiting your response",
    },
    {
      title: "Accepted",
      value: data?.stats.accepted ?? 0,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
      description: "Accepted assignments",
    },
    {
      title: "Completed",
      value: data?.stats.completed ?? 0,
      icon: GraduationCap,
      color: "bg-violet-50 text-violet-600",
      description: "Completed assignments",
    },
  ];

  const quickLinks = [
    {
      title: "My Assignments",
      description: "Review and respond to training assignments",
      href: "/trainer/assignments",
      icon: BriefcaseBusiness,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "My Batches",
      description: "Manage your assigned training batches",
      href: "/trainer/batches",
      icon: Users,
      color: "bg-violet-50 text-violet-700",
    },
    {
      title: "Attendance",
      description: "Manage participant attendance",
      href: "/trainer/attendance",
      icon: ClipboardCheck,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Assessments",
      description: "Manage training assessments",
      href: "/trainer/assessments",
      icon: GraduationCap,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Reports",
      description: "View training reports and records",
      href: "/trainer/reports",
      icon: FileText,
      color: "bg-cyan-50 text-cyan-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold tracking-wider text-teal-700">
            TRAINER WORKSPACE
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Trainer Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your training assignments, batches and activities.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="size-5 shrink-0" />
          {error}
        </div>
      )}

      {/* STATS */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Performance Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your current training assignment summary.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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

                <p className="mt-1 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PARTICIPANTS + UPCOMING */}
      <div className="grid gap-5 lg:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Participants in Accepted Assignments
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "—" : totalParticipants}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Based on assigned programme participant counts
              </p>
            </div>

            <div className="flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Users className="size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Upcoming Training Schedule
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your accepted assignments with future preferred dates.
              </p>
            </div>

            <CalendarDays className="size-5 text-teal-700" />
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="py-5 text-center text-sm text-slate-400">
                Loading schedule...
              </p>
            ) : upcomingAssignments.length === 0 ? (
              <p className="py-5 text-center text-sm text-slate-400">
                No upcoming scheduled assignments.
              </p>
            ) : (
              upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {assignment.request.organisation ||
                        assignment.request.client.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {assignment.request.requestNumber}
                    </p>

                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="size-3.5" />
                      {assignment.request.trainingLocation ||
                        "Location not specified"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                    <CalendarDays className="size-4" />
                    {formatDate(
                      assignment.request.preferredDate ||
                      assignment.request.alternateDate
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Quick Access
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Navigate to your training management sections.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-700" />
                </div>

                <h3 className="mt-4 font-bold text-slate-800">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* RECENT ASSIGNMENTS */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Assignments
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Recently allocated training requests.
            </p>
          </div>

          <Link
            href="/trainer/assignments"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Loading assignments...
            </p>
          ) : recentAssignments.length === 0 ? (
            <div className="py-12 text-center">
              <BriefcaseBusiness className="mx-auto size-10 text-slate-300" />

              <h3 className="mt-3 font-semibold text-slate-800">
                No assignments yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                New training assignments will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800">
                      {assignment.request.organisation ||
                        assignment.request.client.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Request: {assignment.request.requestNumber}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {assignment.assignedPrograms
                        .map((item) => item.program.title)
                        .join(", ") || "No programme details"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses(
                        assignment.status
                      )}`}
                    >
                      {assignment.status}
                    </span>

                    <Link
                      href="/trainer/assignments"
                      className="text-xs font-semibold text-teal-700 hover:underline"
                    >
                      View Details
                    </Link>
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
