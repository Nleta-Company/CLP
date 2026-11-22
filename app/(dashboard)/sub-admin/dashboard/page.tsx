
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ==========================================
// TYPES
// ==========================================

type RequestProgram = {
  program: {
    code: string;
    title: string;
    category: string;
  };
};

type RecentRequest = {
  id: string;
  requestNumber: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  organisation: string | null;

  client: {
    id: string;
    name: string;
    email: string;
    clientProfile?: {
      organisation: string;
    } | null;
  };

  programs: RequestProgram[];

  trainerAssignments: {
    id: string;
    status: string;
  }[];
};

type DashboardData = {
  success: boolean;

  stats: {
    totalRequests: number;
    newRequests: number;
    verificationRequests: number;
    trainerAssignmentRequests: number;
    trainingRequests: number;
    completedRequests: number;
  };

  workflow: {
    verification: number;
    tso: number;
    pta: number;
    taf: number;
    trainer: number;
    training: number;
    reports: number;
  };

  today: {
    requestsProcessed: number;
    trainersAssigned: number;
    completedRequests: number;
  };

  trainers: {
    active: number;
    withActiveAssignments: number;
    withoutActiveAssignments: number;
  };

  recentRequests: RecentRequest[];
};

// ==========================================
// HELPERS
// ==========================================

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTimeAgo(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  return formatDate(date);
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClasses(status: string) {
  if (
    status === "SUBMITTED" ||
    status === "UNDER_REVIEW" ||
    status.includes("VERIFICATION")
  ) {
    return "border-0 bg-amber-50 text-amber-700 hover:bg-amber-50";
  }

  if (status.includes("TSO")) {
    return "border-0 bg-blue-50 text-blue-700 hover:bg-blue-50";
  }

  

  if (status.includes("TAF")) {
    return "border-0 bg-indigo-50 text-indigo-700 hover:bg-indigo-50";
  }

  if (status.includes("TRAINER")) {
    return "border-0 bg-cyan-50 text-cyan-700 hover:bg-cyan-50";
  }

  if (status === "TRAINING") {
    return "border-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
  }

  if (status === "COMPLETED") {
    return "border-0 bg-green-50 text-green-700 hover:bg-green-50";
  }

  if (status.includes("REJECTED") || status === "CANCELLED") {
    return "border-0 bg-red-50 text-red-700 hover:bg-red-50";
  }

  return "border-0 bg-slate-100 text-slate-600 hover:bg-slate-100";
}

function getOrganisation(request: RecentRequest) {
  return (
    request.organisation ||
    request.client.clientProfile?.organisation ||
    request.client.name
  );
}

// ==========================================
// DASHBOARD
// ==========================================

export default function SubAdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/sub-admin/dashboard", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load dashboard information."
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // ==========================================
  // STAT CARDS
  // ==========================================

  const statCards = useMemo(() => {
    const stats = data?.stats;

    return [
      {
        title: "New Requests",
        value: stats?.newRequests ?? 0,
        description: "Awaiting processing",
        icon: ClipboardCheck,
        className:
          "border-indigo-100 bg-gradient-to-br from-indigo-50 to-white",
        iconClass: "bg-indigo-100 text-indigo-600",
        valueClass: "text-indigo-700",
      },
      {
        title: "Verification",
        value: stats?.verificationRequests ?? 0,
        description: "Under review",
        icon: ShieldCheck,
        className:
          "border-amber-100 bg-gradient-to-br from-amber-50 to-white",
        iconClass: "bg-amber-100 text-amber-600",
        valueClass: "text-amber-700",
      },
      {
        title: "Trainer Assignment",
        value: stats?.trainerAssignmentRequests ?? 0,
        description: "In trainer assignment stage",
        icon: UserPlus,
        className:
          "border-cyan-100 bg-gradient-to-br from-cyan-50 to-white",
        iconClass: "bg-cyan-100 text-cyan-600",
        valueClass: "text-cyan-700",
      },
      {
        title: "Completed Requests",
        value: stats?.completedRequests ?? 0,
        description: "Successfully completed",
        icon: CheckCircle2,
        className:
          "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white",
        iconClass: "bg-emerald-100 text-emerald-600",
        valueClass: "text-emerald-700",
      },
    ];
  }, [data]);

  // ==========================================
  // WORKFLOW
  // ==========================================

  const workflowSteps = useMemo(() => {
    const workflow = data?.workflow;

    return [
      {
        label: "Verification",
        count: workflow?.verification ?? 0,
        icon: ClipboardCheck,
      },
      {
        label: "TSO",
        count: workflow?.tso ?? 0,
        icon: FileText,
      },
      {
        label: "PTA",
        count: workflow?.pta ?? 0,
        icon: FileCheck2,
      },
      
      {
        label: "TAF",
        count: workflow?.taf ?? 0,
        icon: FileCheck2,
      },
      {
        label: "Trainer",
        count: workflow?.trainer ?? 0,
        icon: UserPlus,
      },
      {
        label: "Training",
        count: workflow?.training ?? 0,
        icon: GraduationCap,
      },
    ];
  }, [data]);

  const today = useMemo(() => new Date(), []);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-600">
            <ShieldCheck className="size-4" />
            Operations Center
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Sub Admin Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Manage service requests, documents, trainer assignments,
            training operations and reports from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays className="size-5" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Today's Operations
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {formatDate(today)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center"
        >
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={loadDashboard}
            className="text-sm font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.title}
              className={`${stat.className} shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl ${stat.iconClass}`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <MoreHorizontal className="size-5 text-slate-300" />
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className={`text-3xl font-bold ${stat.valueClass}`}>
                    {loading ? "—" : stat.value}
                  </p>

                  <p className="pb-1 text-right text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* TOTAL REQUESTS */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Total Service Requests
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "—" : data?.stats.totalRequests ?? 0}
          </p>
        </div>

        <Link
          href="/sub-admin/requests"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View Requests
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {/* WORKFLOW */}
      <Card className="overflow-hidden border-indigo-100 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/40">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Operational Workflow
              </CardTitle>

              <p className="mt-1 text-sm text-slate-500">
                Current records across the service request lifecycle.
              </p>
            </div>

            <Badge className="w-fit border-0 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
              {loading
                ? "Loading..."
                : `${data?.stats.totalRequests ?? 0} Total Requests`}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.label}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-500">
                        {step.label}
                      </p>

                      <p className="mt-0.5 text-xl font-bold text-slate-900">
                        {loading ? "—" : step.count}
                      </p>
                    </div>
                  </div>

                  {index < workflowSteps.length - 1 && (
                    <ChevronRight className="hidden size-4 shrink-0 text-slate-300 xl:block" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* RECENT REQUESTS */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Recent Service Requests
                </CardTitle>

                <p className="mt-1 text-sm text-slate-500">
                  Latest requests retrieved from the database.
                </p>
              </div>

              <Link
                href="/sub-admin/requests"
                className="hidden items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:flex"
              >
                View all
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Loading recent requests...
              </div>
            ) : !data?.recentRequests.length ? (
              <div className="p-10 text-center">
                <FileText className="mx-auto size-9 text-slate-300" />

                <p className="mt-3 font-semibold text-slate-700">
                  No service requests found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Newly submitted requests will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentRequests.map((request) => {
                  const programs = request.programs
                    .map((item) => item.program.title)
                    .filter(Boolean);

                  const service =
                    programs.length > 0
                      ? programs.join(", ")
                      : "No programme selected";

                  const organisation = getOrganisation(request);

                  return (
                    <Link
                      key={request.id}
                      href={`/sub-admin/requests/${request.id}`}
                      className="group block p-5 transition-colors hover:bg-indigo-50/30"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                            <FileText className="size-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 group-hover:text-indigo-700">
                              {organisation}
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-500">
                              {service}
                            </p>

                            <p className="mt-1 font-mono text-xs text-slate-400">
                              {request.requestNumber}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Client: {request.client.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 xl:justify-end">
                          <div className="text-left xl:text-right">
                            <Badge
                              className={getStatusClasses(request.status)}
                            >
                              {formatStatus(request.status)}
                            </Badge>

                            <p className="mt-2 text-xs text-slate-400">
                              {formatTimeAgo(
                                request.submittedAt || request.createdAt
                              )}
                            </p>
                          </div>

                          <div className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors group-hover:border-indigo-200 group-hover:text-indigo-600">
                            <ArrowRight className="size-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* TODAY'S WORKLOAD */}
          <Card className="overflow-hidden border-indigo-100 bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-500" />

            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                Today&apos;s Workload
              </CardTitle>

              <p className="text-sm text-slate-500">
                Activity recorded today in the database.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <ClipboardCheck className="size-4" />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    Request timeline entries
                  </span>
                </div>

                <span className="text-lg font-bold text-indigo-700">
                  {loading ? "—" : data?.today.requestsProcessed ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                    <UserPlus className="size-4" />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    Trainers assigned
                  </span>
                </div>

                <span className="text-lg font-bold text-cyan-700">
                  {loading ? "—" : data?.today.trainersAssigned ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="size-4" />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    Requests completed
                  </span>
                </div>

                <span className="text-lg font-bold text-emerald-700">
                  {loading ? "—" : data?.today.completedRequests ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* TRAINER POOL */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Trainer Pool
                  </CardTitle>

                  <p className="mt-1 text-sm text-slate-500">
                    Active trainer account summary.
                  </p>
                </div>

                <Users className="size-5 text-indigo-500" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
                  <Users className="size-7" />
                </div>

                <div>
                  <p className="text-3xl font-bold text-slate-900">
                    {loading ? "—" : data?.trainers.active ?? 0}
                  </p>

                  <p className="text-sm text-slate-500">
                    Active trainer accounts
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-cyan-50 p-3">
                  <p className="text-xs text-cyan-700">
                    With active assignments
                  </p>

                  <p className="mt-1 text-xl font-bold text-cyan-800">
                    {loading
                      ? "—"
                      : data?.trainers.withActiveAssignments ?? 0}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">
                    Without active assignments
                  </p>

                  <p className="mt-1 text-xl font-bold text-emerald-800">
                    {loading
                      ? "—"
                      : data?.trainers.withoutActiveAssignments ?? 0}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-400">
                Assignment counts do not confirm actual trainer availability.
              </p>

              <Link
                href="/sub-admin/trainers"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Manage Trainers
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Quick Actions
          </CardTitle>

          <p className="mt-1 text-sm text-slate-500">
            Common operational tasks.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              href="/sub-admin/requests"
              className="group rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <ClipboardCheck className="size-5" />
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Service Requests
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Review and process incoming requests.
              </p>
            </Link>

            <Link
              href="/sub-admin/trainers"
              className="group rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                <UserPlus className="size-5" />
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Assign Trainer
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Assign trainers to eligible requests.
              </p>
            </Link>

            <Link
              href="/sub-admin/documents"
              className="group rounded-xl border border-violet-100 bg-violet-50/50 p-4 transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <FileText className="size-5" />
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Documents
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Generate and manage workflow documents.
              </p>
            </Link>

            <Link
              href="/sub-admin/reports"
              className="group rounded-xl border border-rose-100 bg-rose-50/50 p-4 transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Award className="size-5" />
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Reports
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Open training and operational reports.
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* OPERATIONS NOTE */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-5 text-white shadow-lg shadow-indigo-500/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <p className="font-semibold">
                Operational Responsibility
              </p>

              <p className="mt-1 max-w-2xl text-sm leading-5 text-indigo-100">
                Sub Admin manages the operational workflow, documents and
                trainer assignments. Final approval remains with the Admin.
              </p>
            </div>
          </div>

          <Link
            href="/sub-admin/requests"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
          >
            Open Requests
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
