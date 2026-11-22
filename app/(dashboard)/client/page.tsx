
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  RefreshCw,
  Search,
  Wallet,
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
  duration: number
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
  trainingLocation: string | null
  programmes: RequestProgram[]
  totalParticipants: number
  fto: {
    id: string
    ftoNumber: string
    grandTotal: string | number
    currency: string
    validUntil: string | null
  } | null
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "bg-indigo-50 text-indigo-700",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-amber-50 text-amber-700",
  },
  REQUEST_ACCEPTED: {
    label: "Request Accepted",
    className: "bg-emerald-50 text-emerald-700",
  },
  REQUEST_REJECTED: {
    label: "Request Rejected",
    className: "bg-red-50 text-red-700",
  },
  TSO_DRAFT: {
    label: "TSO Draft",
    className: "bg-blue-50 text-blue-700",
  },
  TSO_SENT: {
    label: "TSO Received",
    className: "bg-blue-50 text-blue-700",
  },
  TSO_ACCEPTED: {
    label: "TSO Accepted",
    className: "bg-emerald-50 text-emerald-700",
  },
  TSO_REJECTED: {
    label: "TSO Rejected",
    className: "bg-red-50 text-red-700",
  },
  FTO_DRAFT: {
    label: "FTO Being Prepared",
    className: "bg-blue-50 text-blue-700",
  },
  FTO_SENT: {
    label: "FTO Received",
    className: "bg-cyan-50 text-cyan-700",
  },
  FTO_ACCEPTED: {
    label: "FTO Accepted",
    className: "bg-emerald-50 text-emerald-700",
  },
  FTO_REJECTED: {
    label: "FTO Rejected",
    className: "bg-red-50 text-red-700",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    className: "bg-amber-50 text-amber-700",
  },
  PAYMENT_SUBMITTED: {
    label: "Payment Submitted",
    className: "bg-blue-50 text-blue-700",
  },
  PAYMENT_VERIFICATION: {
    label: "Payment Verification",
    className: "bg-amber-50 text-amber-700",
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    className: "bg-emerald-50 text-emerald-700",
  },
  PSGA_DRAFT: {
    label: "PSGA Draft",
    className: "bg-blue-50 text-blue-700",
  },
  PSGA_SENT: {
    label: "PSGA Received",
    className: "bg-blue-50 text-blue-700",
  },
  PSGA_ACCEPTED: {
    label: "PSGA Accepted",
    className: "bg-emerald-50 text-emerald-700",
  },
  PSGA_REJECTED: {
    label: "PSGA Rejected",
    className: "bg-red-50 text-red-700",
  },
  TAF_DRAFT: {
    label: "TAF Draft",
    className: "bg-blue-50 text-blue-700",
  },
  TAF_SENT: {
    label: "TAF Received",
    className: "bg-blue-50 text-blue-700",
  },
  TAF_ACCEPTED: {
    label: "TAF Accepted",
    className: "bg-emerald-50 text-emerald-700",
  },
  TAF_REJECTED: {
    label: "TAF Rejected",
    className: "bg-red-50 text-red-700",
  },
  TRAINER_ASSIGNMENT: {
    label: "Trainer Assignment",
    className: "bg-cyan-50 text-cyan-700",
  },
  TRAINING: {
    label: "Training In Progress",
    className: "bg-violet-50 text-violet-700",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-600",
  },
}

function formatDate(value: string | null) {
  if (!value) return "Not specified"

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getStatus(status: string) {
  return statusConfig[status] ?? {
    label: status.replaceAll("_", " "),
    className: "bg-slate-100 text-slate-700",
  }
}

function formatCurrency(amount: string | number, currency: string) {
  const value = Number(amount)

  if (!Number.isFinite(value)) return "Amount unavailable"

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(value)
}

export default function ClientDashboardPage() {
  const [requests, setRequests] = useState<ClientRequest[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadRequests() {
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
        throw new Error(data.message || "Unable to load your requests.")
      }

      setRequests(data.requests ?? [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading requests."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    const query = search.toLowerCase().trim()

    return requests.filter((request) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "FTO_ACTION" &&
          request.status === "FTO_SENT") ||
        (filter === "PAYMENT" &&
          [
            "PAYMENT_PENDING",
            "PAYMENT_SUBMITTED",
            "PAYMENT_VERIFICATION",
          ].includes(request.status))

      const programmeNames = request.programmes
        .map((program) => program.title)
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        !query ||
        request.requestNumber.toLowerCase().includes(query) ||
        programmeNames.includes(query)

      return matchesFilter && matchesSearch
    })
  }, [requests, search, filter])

  const pendingCount = requests.filter((request) =>
    ["SUBMITTED", "UNDER_REVIEW"].includes(request.status)
  ).length

  const ftoActionCount = requests.filter(
    (request) => request.status === "FTO_SENT"
  ).length

  const paymentCount = requests.filter((request) =>
    [
      "PAYMENT_PENDING",
      "PAYMENT_SUBMITTED",
      "PAYMENT_VERIFICATION",
    ].includes(request.status)
  ).length

  const completedCount = requests.filter(
    (request) => request.status === "COMPLETED"
  ).length

  return (
    <DashboardShell role="CLIENT">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <GraduationCap className="size-4" />
              Client Portal
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              My Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Track your training requests, offers and payment progress.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadRequests}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <Link
              href="/client/services"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              New Service Request
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <FileText className="size-5" />
                </div>
                <span className="text-xs font-semibold text-indigo-600">TOTAL</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? "—" : requests.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">My service requests</p>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Clock3 className="size-5" />
                </div>
                <span className="text-xs font-semibold text-amber-600">REVIEW</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? "—" : pendingCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-100 bg-gradient-to-br from-cyan-50 to-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                  <Wallet className="size-5" />
                </div>
                <span className="text-xs font-semibold text-cyan-600">PAYMENT</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? "—" : paymentCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Payment stage</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-600">DONE</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? "—" : completedCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Completed requests</p>
            </CardContent>
          </Card>
        </div>

        {/* FTO ACTION ALERT */}
        {!loading && ftoActionCount > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  FTO requires your attention
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  You have {ftoActionCount} Final Training Offer(s) waiting for your response.
                </p>
              </div>
            </div>
            <span className="text-sm font-semibold text-cyan-700">
              Please review your requests below
            </span>
          </div>
        )}

        {/* FILTERS */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by request number or programme..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="ALL">All Requests</option>
                <option value="FTO_ACTION">FTO Awaiting Response</option>
                <option value="PAYMENT">Payment Stage</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* REQUEST LIST */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  My Service Requests
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Loading requests..."
                    : `${filteredRequests.length} request(s) found`}
                </p>
              </div>
              <Badge className="border-0 bg-indigo-50 text-indigo-700">
                Client Requests
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
              <div className="px-6 py-16 text-center text-sm text-slate-500">
                Loading your service requests...
              </div>
            )}

            {!loading && !error && filteredRequests.length > 0 && (
              <div className="divide-y divide-slate-100">
                {filteredRequests.map((request) => {
                  const status = getStatus(request.status)
                  const fto = request.fto
                  const canReviewFto = request.status === "FTO_SENT"

                  return (
                    <div
                      key={request.id}
                      className="p-5 transition-colors hover:bg-slate-50/70 md:p-6"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-indigo-600">
                              {request.requestNumber}
                            </span>
                            <Badge className={status.className}>
                              {status.label}
                            </Badge>
                          </div>

                          <div className="mt-3 space-y-2">
                            {request.programmes.slice(0, 3).map((program) => (
                              <div
                                key={program.code}
                                className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-700"
                              >
                                <GraduationCap className="size-4 text-slate-400" />
                                <span className="font-medium">{program.title}</span>
                                <span className="text-xs text-slate-400">
                                  {program.participants} participants
                                </span>
                              </div>
                            ))}

                            {request.programmes.length > 3 && (
                              <p className="text-xs font-medium text-indigo-600">
                                +{request.programmes.length - 3} more programmes
                              </p>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="size-3.5" />
                              {formatDate(request.preferredDate)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <GraduationCap className="size-3.5" />
                              {request.totalParticipants} participants
                            </span>
                          </div>

                          {fto && (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Final Training Offer
                                  </p>
                                  <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                                    {fto.ftoNumber}
                                  </p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="text-xs text-slate-500">
                                    Offer Amount
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-slate-900">
                                    {formatCurrency(fto.grandTotal, fto.currency)}
                                  </p>
                                </div>
                              </div>
                              {fto.validUntil && (
                                <p className="mt-2 text-xs text-slate-500">
                                  Valid until: {formatDate(fto.validUntil)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          {canReviewFto && (
                            <Link
                              href={`/client/requests/${request.id}`}
                              className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white hover:bg-cyan-700"
                            >
                              Review FTO
                              <ArrowUpRight className="size-4" />
                            </Link>
                          )}

                          <Link
                            href={`/client/requests/${request.id}`}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            View Details
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!loading && !error && filteredRequests.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FileText className="size-6" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-800">
                  {requests.length === 0
                    ? "No service requests yet"
                    : "No requests found"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {requests.length === 0
                    ? "Your submitted training requests will appear here."
                    : "Try changing your search or filter."}
                </p>
                {requests.length === 0 && (
                  <Link
                    href="/client/services"
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Create Service Request
                    <ArrowUpRight className="size-4" />
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* WORKFLOW */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                Your training request journey
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Request Submission → Review → FTO → Your Approval → Payment
                → PSGA → TAF → Trainer Assignment → Training → Completion
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
