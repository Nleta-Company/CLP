
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  FileText,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Users,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface RequestProgram {
  code: string
  title: string
  category: string
  duration: string
  mode: string
  participants: number
  expectedBatches: number
}

interface ClientRequest {
  id: string
  requestNumber: string
  status: string
  submittedAt: string | null
  createdAt: string
  preferredDate: string | null
  alternateDate: string | null
  trainingLocation: string | null
  programmes: RequestProgram[]
  totalParticipants: number
  fto: {
    id: string
    ftoNumber: string
    grandTotal: string
    currency: string
    validUntil: string | null
    documentUrl: string | null
  } | null
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-50 text-blue-700",
  UNDER_REVIEW: "bg-amber-50 text-amber-700",
  REQUEST_ACCEPTED: "bg-emerald-50 text-emerald-700",
  REQUEST_REJECTED: "bg-red-50 text-red-700",
  TSO_DRAFT: "bg-indigo-50 text-indigo-700",
  TSO_SENT: "bg-blue-50 text-blue-700",
  TSO_ACCEPTED: "bg-emerald-50 text-emerald-700",
  TSO_REJECTED: "bg-red-50 text-red-700",
  FTO_DRAFT: "bg-violet-50 text-violet-700",
  FTO_SENT: "bg-cyan-50 text-cyan-700",
  FTO_ACCEPTED: "bg-emerald-50 text-emerald-700",
  FTO_REJECTED: "bg-red-50 text-red-700",
  PAYMENT_PENDING: "bg-amber-50 text-amber-700",
  PAYMENT_SUBMITTED: "bg-blue-50 text-blue-700",
  PAYMENT_VERIFICATION: "bg-amber-50 text-amber-700",
  PAYMENT_VERIFIED: "bg-emerald-50 text-emerald-700",
  PSGA_DRAFT: "bg-indigo-50 text-indigo-700",
  PSGA_SENT: "bg-blue-50 text-blue-700",
  PSGA_ACCEPTED: "bg-emerald-50 text-emerald-700",
  PSGA_REJECTED: "bg-red-50 text-red-700",
  TAF_DRAFT: "bg-indigo-50 text-indigo-700",
  TAF_SENT: "bg-blue-50 text-blue-700",
  TAF_ACCEPTED: "bg-emerald-50 text-emerald-700",
  TAF_REJECTED: "bg-red-50 text-red-700",
  TRAINER_ASSIGNMENT: "bg-cyan-50 text-cyan-700",
  TRAINING: "bg-violet-50 text-violet-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
}

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  REQUEST_ACCEPTED: "Request Accepted",
  REQUEST_REJECTED: "Request Rejected",
  TSO_DRAFT: "TSO Being Prepared",
  TSO_SENT: "TSO Received",
  TSO_ACCEPTED: "TSO Accepted",
  TSO_REJECTED: "TSO Rejected",
  FTO_DRAFT: "FTO Being Prepared",
  FTO_SENT: "FTO Received",
  FTO_ACCEPTED: "FTO Accepted",
  FTO_REJECTED: "FTO Rejected",
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_SUBMITTED: "Payment Submitted",
  PAYMENT_VERIFICATION: "Payment Verification",
  PAYMENT_VERIFIED: "Payment Verified",
  PSGA_DRAFT: "PSGA Being Prepared",
  PSGA_SENT: "PSGA Received",
  PSGA_ACCEPTED: "PSGA Accepted",
  PSGA_REJECTED: "PSGA Rejected",
  TAF_DRAFT: "TAF Being Prepared",
  TAF_SENT: "TAF Received",
  TAF_ACCEPTED: "TAF Accepted",
  TAF_REJECTED: "TAF Rejected",
  TRAINER_ASSIGNMENT: "Trainer Assignment",
  TRAINING: "Training In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

function formatDate(value: string | null) {
  if (!value) return "Not specified"

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getStatusLabel(status: string) {
  return (
    statusLabels[status] ??
    status.replaceAll("_", " ")
  )
}

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState<ClientRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")

  async function fetchRequests() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/client/requests", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load requests.")
      }

      setRequests(data.requests ?? [])
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    const query = search.toLowerCase().trim()

    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        request.requestNumber.toLowerCase().includes(query) ||
        request.programmes.some((program) =>
          program.title.toLowerCase().includes(query) ||
          program.code.toLowerCase().includes(query)
        )

      const matchesFilter =
        filter === "ALL" ||
        request.status === filter

      return matchesSearch && matchesFilter
    })
  }, [requests, search, filter])

  return (
    <DashboardShell role="CLIENT">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Client Portal / Requests
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              My Requests
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View and track all your submitted training requests.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Total Requests</p>
                <FileText className="size-5 text-indigo-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "—" : requests.length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Under Review</p>
                <RefreshCw className="size-5 text-amber-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : requests.filter((r) =>
                      ["SUBMITTED", "UNDER_REVIEW"].includes(r.status)
                    ).length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Completed</p>
                <GraduationCap className="size-5 text-emerald-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : requests.filter((r) => r.status === "COMPLETED").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SEARCH AND FILTER */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search request number or programme..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-indigo-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="REQUEST_ACCEPTED">Request Accepted</option>
                <option value="REQUEST_REJECTED">Request Rejected</option>
                <option value="FTO_DRAFT">FTO Being Prepared</option>
                <option value="FTO_SENT">FTO Received</option>
                <option value="FTO_ACCEPTED">FTO Accepted</option>
                <option value="FTO_REJECTED">FTO Rejected</option>
                <option value="PAYMENT_PENDING">Payment Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* REQUESTS */}
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  All Service Requests
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Loading..."
                    : `${filteredRequests.length} request(s) found`}
                </p>
              </div>
              <Badge className="border-0 bg-indigo-50 text-indigo-700">
                {requests.length} Total
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">

            {error && (
              <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading && (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading your requests...
              </div>
            )}

            {!loading &&
              !error &&
              filteredRequests.length > 0 && (
                <div className="divide-y divide-slate-100">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-5 transition-colors hover:bg-slate-50/70 md:p-6"
                    >
                      <div className="flex flex-col justify-between gap-5 lg:flex-row">

                        <div className="min-w-0 flex-1">
                          {/* REQUEST NUMBER AND STATUS */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-indigo-600">
                              {request.requestNumber}
                            </span>

                            <Badge
                              className={
                                statusStyles[request.status] ??
                                "bg-slate-100 text-slate-700"
                              }
                            >
                              {getStatusLabel(request.status)}
                            </Badge>
                          </div>

                          {/* PROGRAMMES */}
                          <div className="mt-4 space-y-3">
                            {request.programmes.map((program) => (
                              <div
                                key={program.code}
                                className="flex items-start gap-3"
                              >
                                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                  <GraduationCap className="size-4" />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800">
                                    {program.title}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {program.code} · {program.category} · {program.duration}
                                  </p>

                                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                                    <span>{program.participants} Participants</span>
                                    <span>{program.expectedBatches} Batch(es)</span>
                                    <span>{program.mode} Mode</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* REQUEST INFORMATION */}
                          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="size-3.5" />
                              Preferred: {formatDate(request.preferredDate)}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <Users className="size-3.5" />
                              {request.totalParticipants} Participants
                            </span>

                            {request.trainingLocation && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="size-3.5" />
                                {request.trainingLocation}
                              </span>
                            )}
                          </div>

                          {/* FTO INFORMATION */}
                          {request.fto && (
                            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Final Training Offer
                                  </p>
                                  <p className="mt-1 font-mono text-sm font-bold text-slate-800">
                                    {request.fto.ftoNumber}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Offer Valid Until
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {formatDate(request.fto.validUntil)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ACTION */}
                        <div className="flex shrink-0 items-center lg:justify-end">
                          <Link
                            href={`/client/requests/${request.id}`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            View Details
                            <ArrowRight className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {!loading &&
              !error &&
              filteredRequests.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FileText className="size-6" />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-800">
                    {requests.length === 0
                      ? "No requests yet"
                      : "No matching requests"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {requests.length === 0
                      ? "Your submitted training requests will appear here."
                      : "Try another search or status filter."}
                  </p>

                  {requests.length === 0 && (
                    <Link
                      href="/client/services"
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Create New Request
                      <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}


