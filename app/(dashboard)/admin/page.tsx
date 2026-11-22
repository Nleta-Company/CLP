import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { DashboardShell } from "@/components/layout/dashboard-shell"

const stats = [
  {
    title: "Pending Requests",
    value: "24",
    description: "Requires attention",
    icon: FileText,
    iconClass: "bg-blue-100 text-blue-600",
    accentClass: "bg-blue-500",
    cardClass:
      "border-blue-100 hover:border-blue-200 hover:shadow-blue-100/60",
  },
  {
    title: "Pending Approvals",
    value: "8",
    description: "Awaiting your review",
    icon: ClipboardCheck,
    iconClass: "bg-violet-100 text-violet-600",
    accentClass: "bg-violet-500",
    cardClass:
      "border-violet-100 hover:border-violet-200 hover:shadow-violet-100/60",
  },
  {
    title: "Payment Verification",
    value: "5",
    description: "Pending verification",
    icon: CreditCard,
    iconClass: "bg-amber-100 text-amber-600",
    accentClass: "bg-amber-500",
    cardClass:
      "border-amber-100 hover:border-amber-200 hover:shadow-amber-100/60",
  },
  {
    title: "Certificates",
    value: "12",
    description: "Awaiting approval",
    icon: FileCheck2,
    iconClass: "bg-emerald-100 text-emerald-600",
    accentClass: "bg-emerald-500",
    cardClass:
      "border-emerald-100 hover:border-emerald-200 hover:shadow-emerald-100/60",
  },
]

const approvals = [
  {
    id: "PAY-102",
    type: "Payment Verification",
    client: "ABC Manufacturing",
    status: "Pending",
    icon: CreditCard,
    iconClass: "bg-amber-100 text-amber-600",
    time: "10 min ago",
  },
  {
    id: "REP-204",
    type: "Training Report",
    client: "XYZ Industries",
    status: "Pending",
    icon: FileCheck2,
    iconClass: "bg-violet-100 text-violet-600",
    time: "32 min ago",
  },
  {
    id: "CERT-089",
    type: "Certificate Approval",
    client: "Global Solutions",
    status: "Pending",
    icon: CheckCircle2,
    iconClass: "bg-emerald-100 text-emerald-600",
    time: "1 hour ago",
  },
]

export default function AdminDashboard() {
  return (
    <DashboardShell role="ADMIN">
      <div className="space-y-8">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              Admin Dashboard
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Good morning, Admin
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
              Here&apos;s an overview of your CLP operations and pending
              approvals.
            </p>
          </div>

          {/* Date / status */}
          <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:block">
            <p className="text-xs font-medium text-slate-400">
              SYSTEM STATUS
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />

              <span className="text-sm font-semibold text-slate-700">
                All systems operational
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            STATS
        ====================================================== */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <Card
                key={stat.title}
                className={`group relative overflow-hidden bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${stat.cardClass}`}
              >
                {/* Top accent */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${stat.accentClass}`}
                />

                <CardHeader className="flex flex-row items-start justify-between pb-3 pt-6">
                  <div>
                    <CardTitle className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </CardTitle>
                  </div>

                  <div
                    className={`rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105 ${stat.iconClass}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-emerald-500" />

                    <p className="text-xs font-medium text-slate-500">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* ===================================================
              APPROVAL QUEUE
          ==================================================== */}
          <Card className="overflow-hidden border-indigo-100 bg-white shadow-sm lg:col-span-2">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 to-violet-50/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                      <ClipboardCheck className="size-4" />
                    </div>

                    <CardTitle className="text-base font-semibold text-slate-900">
                      Pending Approvals
                    </CardTitle>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Items waiting for your final approval.
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className="border-0 bg-indigo-100 px-3 py-1 text-indigo-700"
                >
                  8 Pending
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {approvals.map((approval) => {
                  const Icon = approval.icon

                  return (
                    <div
                      key={approval.id}
                      className="group flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-indigo-50/40"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        {/* Icon */}
                        <div
                          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${approval.iconClass}`}
                        >
                          <Icon className="size-5" />
                        </div>

                        {/* Information */}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {approval.type}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {approval.id} · {approval.client}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {approval.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <Badge className="hidden border-0 bg-amber-50 text-amber-700 hover:bg-amber-50 sm:inline-flex">
                          {approval.status}
                        </Badge>

                        <button
                          type="button"
                          className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          aria-label={`Open ${approval.type}`}
                        >
                          <ArrowUpRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* View all */}
              <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  View all approvals
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* ===================================================
              QUICK OVERVIEW
          ==================================================== */}
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <TrendingUp className="size-4" />
                </div>

                <CardTitle className="text-base font-semibold text-slate-900">
                  Quick Overview
                </CardTitle>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Current portal activity.
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Active Clients */}
              <div className="group flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 transition-colors hover:bg-blue-50">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Users className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    Active Clients
                  </p>

                  <p className="mt-0.5 text-sm text-slate-500">
                    48 clients
                  </p>
                </div>

                <span className="ml-auto text-xs font-semibold text-blue-600">
                  +8%
                </span>
              </div>

              {/* Active Requests */}
              <div className="group flex items-center gap-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4 transition-colors hover:bg-violet-50">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <FileText className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    Active Requests
                  </p>

                  <p className="mt-0.5 text-sm text-slate-500">
                    24 requests
                  </p>
                </div>

                <span className="ml-auto text-xs font-semibold text-violet-600">
                  +12%
                </span>
              </div>

              {/* Completed */}
              <div className="group flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 transition-colors hover:bg-emerald-50">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    Completed This Month
                  </p>

                  <p className="mt-0.5 text-sm text-slate-500">
                    31 services
                  </p>
                </div>

                <span className="ml-auto text-xs font-semibold text-emerald-600">
                  +18%
                </span>
              </div>

              {/* Footer */}
              <div className="mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white shadow-lg shadow-indigo-500/20">
                <p className="text-xs font-medium text-indigo-100">
                  Monthly performance
                </p>

                <div className="mt-1 flex items-end justify-between">
                  <p className="text-2xl font-bold">
                    87%
                  </p>

                  <p className="text-xs font-medium text-indigo-100">
                    +6.4% this month
                  </p>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-[87%] rounded-full bg-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =====================================================
            BOTTOM ACTIVITY STRIP
        ====================================================== */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="size-5" />
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  Portal activity is healthy
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  31 services completed successfully this month.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
            >
              View Reports
              <ArrowUpRight className="size-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}