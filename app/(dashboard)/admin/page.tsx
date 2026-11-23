
"use client"

import { useEffect, useState } from "react"
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  Users,
  GraduationCap,
  Layers,
  FileCheck,
  RefreshCw,
  AlertCircle,
  Activity,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { DashboardShell } from "@/components/layout/dashboard-shell"

type ActivityItem = {
  id: string
  status: string
  remarks: string | null
  createdAt: string
  actor: {
    name: string
  } | null
  request: {
    requestNumber: string
    organisation: string | null
  }
}

type DashboardData = {
  pendingRequests: number
  pendingApprovals: number
  paymentVerification: number
  activeClients: number
  activeTrainers: number
  activeRequests: number
  completedThisMonth: number
  totalBatches: number
  totalParticipants: number
  totalAtrReports: number
  recentActivity: ActivityItem[]
}

const emptyData: DashboardData = {
  pendingRequests: 0,
  pendingApprovals: 0,
  paymentVerification: 0,
  activeClients: 0,
  activeTrainers: 0,
  activeRequests: 0,
  completedThisMonth: 0,
  totalBatches: 0,
  totalParticipants: 0,
  totalAtrReports: 0,
  recentActivity: [],
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadDashboard() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load dashboard data."
        )
      }

      setData({
        ...emptyData,
        ...result.data,
      })
    } catch (err) {
      console.error("Dashboard loading error:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const stats = [
    {
      title: "Pending Requests",
      value: data.pendingRequests,
      description: "Requests awaiting review",
      icon: FileText,
      iconClass: "bg-blue-100 text-blue-600",
      accentClass: "bg-blue-500",
      cardClass: "border-blue-100",
    },
    {
      title: "Pending Approvals",
      value: data.pendingApprovals,
      description: "Awaiting client decisions",
      icon: ClipboardCheck,
      iconClass: "bg-violet-100 text-violet-600",
      accentClass: "bg-violet-500",
      cardClass: "border-violet-100",
    },
    {
      title: "Payment Verification",
      value: data.paymentVerification,
      description: "Payments awaiting verification",
      icon: CreditCard,
      iconClass: "bg-amber-100 text-amber-600",
      accentClass: "bg-amber-500",
      cardClass: "border-amber-100",
    },
    {
      title: "Completed This Month",
      value: data.completedThisMonth,
      description: "Completed service requests",
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-600",
      accentClass: "bg-emerald-500",
      cardClass: "border-emerald-100",
    },
  ]

  const overview = [
    {
      title: "Active Clients",
      value: data.activeClients,
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Trainers",
      value: data.activeTrainers,
      icon: GraduationCap,
      color: "violet",
    },
    {
      title: "Active Requests",
      value: data.activeRequests,
      icon: FileText,
      color: "amber",
    },
    {
      title: "Total Batches",
      value: data.totalBatches,
      icon: Layers,
      color: "emerald",
    },
    {
      title: "Participants",
      value: data.totalParticipants,
      icon: Users,
      color: "blue",
    },
    {
      title: "ATR-01 Reports",
      value: data.totalAtrReports,
      icon: FileCheck,
      color: "violet",
    },
  ]

  const colorClasses: Record<string, string> = {
    blue: "border-blue-100 bg-blue-50/50 text-blue-600",
    violet: "border-violet-100 bg-violet-50/50 text-violet-600",
    amber: "border-amber-100 bg-amber-50/50 text-amber-600",
    emerald: "border-emerald-100 bg-emerald-50/50 text-emerald-600",
  }

  return (
    <DashboardShell role="ADMIN">
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              Admin Dashboard
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Live overview of your CLP Portal operations.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">
                  Dashboard data unavailable
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
                <p className="mt-1 text-xs text-red-600">
                  Showing no figures until the database response is available.
                </p>
              </div>
            </div>

            <button
              onClick={loadDashboard}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* MAIN STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <Card
                key={stat.title}
                className={`group relative overflow-hidden bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${stat.cardClass}`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${stat.accentClass}`} />

                <CardHeader className="flex flex-row items-start justify-between pb-3 pt-6">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </CardTitle>

                  <div className={`rounded-xl p-2.5 ${stat.iconClass}`}>
                    <Icon className="size-5" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {loading ? "—" : stat.value}
                  </div>

                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* MAIN CONTENT */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* RECENT ACTIVITY */}
          <Card className="overflow-hidden border-indigo-100 bg-white shadow-sm lg:col-span-2">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 to-violet-50/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                      <Activity className="size-4" />
                    </div>

                    <CardTitle className="text-base font-semibold text-slate-900">
                      Recent Activity
                    </CardTitle>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Latest recorded request timeline updates.
                  </p>
                </div>

                <Badge variant="secondary">
                  {loading ? "Loading" : `${data.recentActivity.length} Records`}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Loading recent activity...
                </div>
              ) : data.recentActivity.length === 0 ? (
                <div className="p-8 text-center">
                  <Activity className="mx-auto size-8 text-slate-300" />
                  <p className="mt-3 font-medium text-slate-700">
                    No activity recorded yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Actual request activity will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 px-6 py-5 transition-colors hover:bg-indigo-50/40"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                        <Activity className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-800">
                            {formatStatus(item.status)}
                          </p>
                          <Badge variant="outline">
                            {item.request.requestNumber}
                          </Badge>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.request.organisation || "Organisation not specified"}
                        </p>

                        {item.remarks && (
                          <p className="mt-1 text-sm text-slate-600">
                            {item.remarks}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          {item.actor?.name || "System"} · {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* QUICK OVERVIEW */}
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <Activity className="size-4" />
                </div>

                <CardTitle className="text-base font-semibold text-slate-900">
                  Quick Overview
                </CardTitle>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Actual portal records.
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {overview.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${colorClasses[item.color]}`}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/80">
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {loading ? "Loading..." : item.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* BOTTOM INFORMATION */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Activity className="size-5" />
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  CLP Portal Database Overview
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Fetching live database records..."
                    : error
                      ? "Database information could not be loaded."
                      : "Dashboard figures are based on actual database records."}
                </p>
              </div>
            </div>

            <Badge variant="outline" className="w-fit">
              {loading ? "Loading" : error ? "Unavailable" : "Live Data"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
