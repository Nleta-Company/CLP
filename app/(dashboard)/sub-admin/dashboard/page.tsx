
"use client"

import Link from "next/link"

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
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const requests = [
  {
    id: "REQ-2026-0102",
    client: "ABC Manufacturing",
    service: "Corporate Safety Training",
    status: "Verification",
    submitted: "10 min ago",
    priority: "High",
  },
  {
    id: "REQ-2026-0101",
    client: "XYZ Industries",
    service: "Fire Safety Training",
    status: "TSO Pending",
    submitted: "32 min ago",
    priority: "Medium",
  },
  {
    id: "REQ-2026-0098",
    client: "Global Tech Pvt. Ltd.",
    service: "Workplace Safety Training",
    status: "Trainer Assignment",
    submitted: "1 hour ago",
    priority: "High",
  },
  {
    id: "REQ-2026-0096",
    client: "Prime Engineering",
    service: "Industrial Safety Training",
    status: "Report Preparation",
    submitted: "2 hours ago",
    priority: "Medium",
  },
]

const workflowSteps = [
  {
    label: "Verification",
    count: 8,
    icon: ClipboardCheck,
    color: "amber",
  },
  {
    label: "TSO",
    count: 5,
    icon: FileText,
    color: "blue",
  },
  {
    label: "PSGA",
    count: 3,
    icon: FileCheck2,
    color: "violet",
  },
  {
    label: "TAF",
    count: 4,
    icon: FileCheck2,
    color: "indigo",
  },
  {
    label: "Trainer",
    count: 6,
    icon: UserPlus,
    color: "cyan",
  },
  {
    label: "Training",
    count: 9,
    icon: GraduationCap,
    color: "emerald",
  },
  {
    label: "Reports",
    count: 4,
    icon: Award,
    color: "rose",
  },
]

const statCards = [
  {
    title: "New Requests",
    value: "12",
    description: "Awaiting processing",
    icon: ClipboardCheck,
    className:
      "border-indigo-100 bg-gradient-to-br from-indigo-50 to-white",
    iconClass: "bg-indigo-100 text-indigo-600",
    valueClass: "text-indigo-700",
  },
  {
    title: "Verification",
    value: "8",
    description: "Need your attention",
    icon: ShieldCheck,
    className:
      "border-amber-100 bg-gradient-to-br from-amber-50 to-white",
    iconClass: "bg-amber-100 text-amber-600",
    valueClass: "text-amber-700",
  },
  {
    title: "Trainer Assignment",
    value: "6",
    description: "Ready for assignment",
    icon: UserPlus,
    className:
      "border-cyan-100 bg-gradient-to-br from-cyan-50 to-white",
    iconClass: "bg-cyan-100 text-cyan-600",
    valueClass: "text-cyan-700",
  },
  {
    title: "Reports Pending",
    value: "4",
    description: "Awaiting preparation",
    icon: FileCheck2,
    className:
      "border-rose-100 bg-gradient-to-br from-rose-50 to-white",
    iconClass: "bg-rose-100 text-rose-600",
    valueClass: "text-rose-700",
  },
]

function getStatusClasses(status: string) {
  if (status === "Verification") {
    return "border-0 bg-amber-50 text-amber-700 hover:bg-amber-50"
  }

  if (status === "TSO Pending") {
    return "border-0 bg-blue-50 text-blue-700 hover:bg-blue-50"
  }

  if (status === "Trainer Assignment") {
    return "border-0 bg-cyan-50 text-cyan-700 hover:bg-cyan-50"
  }

  return "border-0 bg-violet-50 text-violet-700 hover:bg-violet-50"
}

function getPriorityClasses(priority: string) {
  if (priority === "High") {
    return "text-red-600"
  }

  return "text-slate-500"
}

export default function SubAdminDashboardPage() {
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

        <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <CalendarDays className="size-5" />
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Today's Operations
            </p>

            <p className="text-sm font-semibold text-slate-800">
              27 October 2026
            </p>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon

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
                  <p
                    className={`text-3xl font-bold ${stat.valueClass}`}
                  >
                    {stat.value}
                  </p>

                  <p className="pb-1 text-right text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
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
                Current workload across the service request lifecycle.
              </p>
            </div>

            <Badge className="w-fit border-0 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
              39 Active Items
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon

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
                        {step.count}
                      </p>
                    </div>
                  </div>

                  {index < workflowSteps.length - 1 && (
                    <ChevronRight className="hidden size-4 shrink-0 text-slate-300 xl:block" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* REQUEST QUEUE */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Recent Service Requests
                </CardTitle>

                <p className="mt-1 text-sm text-slate-500">
                  Requests currently moving through operations.
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
            <div className="divide-y divide-slate-100">
              {requests.map((request) => (
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-800 group-hover:text-indigo-700">
                            {request.client}
                          </p>

                          <span
                            className={`text-[11px] font-semibold ${getPriorityClasses(
                              request.priority
                            )}`}
                          >
                            {request.priority} Priority
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {request.service}
                        </p>

                        <p className="mt-1 font-mono text-xs text-slate-400">
                          {request.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 xl:justify-end">
                      <div className="text-left xl:text-right">
                        <Badge
                          className={getStatusClasses(request.status)}
                        >
                          {request.status}
                        </Badge>

                        <p className="mt-2 text-xs text-slate-400">
                          {request.submitted}
                        </p>
                      </div>

                      <div className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors group-hover:border-indigo-200 group-hover:text-indigo-600">
                        <ArrowRight className="size-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* TODAY */}
          <Card className="overflow-hidden border-indigo-100 bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-500" />

            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                Today&apos;s Workload
              </CardTitle>

              <p className="text-sm text-slate-500">
                Operational activity for today.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <ClipboardCheck className="size-4" />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    Requests processed
                  </span>
                </div>

                <span className="text-lg font-bold text-indigo-700">
                  14
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
                  5
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="size-4" />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    Tasks completed
                  </span>
                </div>

                <span className="text-lg font-bold text-emerald-700">
                  21
                </span>
              </div>
            </CardContent>
          </Card>

          {/* TRAINER AVAILABILITY */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Trainer Availability
                  </CardTitle>

                  <p className="mt-1 text-sm text-slate-500">
                    Current trainer pool.
                  </p>
                </div>

                <Users className="size-5 text-indigo-500" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
                  <Users className="size-7" />
                </div>

                <div>
                  <p className="text-3xl font-bold text-slate-900">
                    18
                  </p>

                  <p className="text-sm text-slate-500">
                    Available trainers
                  </p>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              </div>

              <div className="mt-2 flex justify-between text-xs">
                <span className="text-slate-400">
                  72% available
                </span>

                <span className="font-medium text-emerald-600">
                  Healthy capacity
                </span>
              </div>
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
                Assign trainers to verified requests.
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
                Prepare reports for Admin approval.
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
                Sub Admin manages the operational workflow and prepares
                documents, assignments and reports. Final approval remains
                with the Admin.
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
  )
}
