
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileText,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react"

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

interface ServiceRequest {
  id: string
  requestNumber: string
  clientName: string
  clientEmail: string
  status: string
  submittedAt: string | null
  createdAt: string
  preferredDate: string | null
  alternateDate: string | null
  trainingLocation: string | null
  coordinator: string | null
  programmes: RequestProgram[]
  totalParticipants: number
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "border-0 bg-slate-100 text-slate-700",
  },
  SUBMITTED: {
    label: "New Request",
    className: "border-0 bg-indigo-50 text-indigo-700",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "border-0 bg-amber-50 text-amber-700",
  },
  REQUEST_ACCEPTED: {
    label: "Request Accepted",
    className: "border-0 bg-emerald-50 text-emerald-700",
  },
  REQUEST_REJECTED: {
    label: "Request Rejected",
    className: "border-0 bg-red-50 text-red-700",
  },
  TSO_DRAFT: {
    label: "TSO Draft",
    className: "border-0 bg-blue-50 text-blue-700",
  },
  TSO_SENT: {
    label: "TSO Sent",
    className: "border-0 bg-blue-50 text-blue-700",
  },
  TSO_ACCEPTED: {
    label: "TSO Accepted",
    className: "border-0 bg-emerald-50 text-emerald-700",
  },
  TSO_REJECTED: {
    label: "TSO Rejected",
    className: "border-0 bg-red-50 text-red-700",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    className: "border-0 bg-amber-50 text-amber-700",
  },
  PAYMENT_SUBMITTED: {
    label: "Payment Submitted",
    className: "border-0 bg-blue-50 text-blue-700",
  },
  PAYMENT_VERIFICATION: {
    label: "Payment Verification",
    className: "border-0 bg-amber-50 text-amber-700",
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    className: "border-0 bg-emerald-50 text-emerald-700",
  },
  PSGA_DRAFT: {
    label: "PSGA Draft",
    className: "border-0 bg-blue-50 text-blue-700",
  },
  PSGA_SENT: {
    label: "PSGA Sent",
    className: "border-0 bg-blue-50 text-blue-700",
  },
  PSGA_ACCEPTED: {
    label: "PSGA Accepted",
    className: "border-0 bg-emerald-50 text-emerald-700",
  },
  PSGA_REJECTED: {
    label: "PSGA Rejected",
    className: "border-0 bg-red-50 text-red-700",
  },
  TAF_DRAFT: {
    label: "TAF Draft",
    className: "border-0 bg-blue-50 text-blue-700",
  },
  TAF_SENT: {
    label: "TAF Sent",
    className: "border-0 bg-blue-50 text-blue-700",
  },
  TAF_ACCEPTED: {
    label: "TAF Accepted",
    className: "border-0 bg-emerald-50 text-emerald-700",
  },
  TAF_REJECTED: {
    label: "TAF Rejected",
    className: "border-0 bg-red-50 text-red-700",
  },
  TRAINER_ASSIGNMENT: {
    label: "Trainer Assignment",
    className: "border-0 bg-cyan-50 text-cyan-700",
  },
  TRAINING: {
    label: "Training In Progress",
    className: "border-0 bg-violet-50 text-violet-700",
  },
  COMPLETED: {
    label: "Completed",
    className: "border-0 bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-0 bg-slate-100 text-slate-600",
  },
}

const filterOptions = [
  { value: "ALL", label: "All Requests" },
  { value: "SUBMITTED", label: "New Requests" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "REQUEST_ACCEPTED", label: "Request Accepted" },
  { value: "REQUEST_REJECTED", label: "Request Rejected" },
  { value: "TSO_SENT", label: "TSO Sent" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
  { value: "PAYMENT_VERIFICATION", label: "Payment Verification" },
  { value: "PSGA_SENT", label: "PSGA Sent" },
  { value: "TAF_SENT", label: "TAF Sent" },
  { value: "TRAINER_ASSIGNMENT", label: "Trainer Assignment" },
  { value: "TRAINING", label: "Training In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

function formatDate(date: string | null) {
  if (!date) return "Not specified"

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatSubmittedAt(date: string | null) {
  if (!date) return "Not submitted"

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatus(status: string) {
  return (
    statusConfig[status] ?? {
      label: status.replaceAll("_", " "),
      className: "border-0 bg-slate-100 text-slate-700",
    }
  )
}

export default function SubAdminRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    async function fetchRequests() {
      try {
        setLoading(true)
        setError("")

        const response = await fetch("/api/sub-admin/requests", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load service requests."
          )
        }

        if (isMounted) {
          setRequests(data.requests ?? [])
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchRequests()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim()

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        request.status === statusFilter

      const programmeNames = request.programmes
        .map((program) => program.title)
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        !normalizedSearch ||
        request.requestNumber.toLowerCase().includes(normalizedSearch) ||
        request.clientName.toLowerCase().includes(normalizedSearch) ||
        request.clientEmail.toLowerCase().includes(normalizedSearch) ||
        programmeNames.includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [requests, search, statusFilter])

  const verificationCount = requests.filter(
    (request) =>
      request.status === "SUBMITTED" ||
      request.status === "UNDER_REVIEW"
  ).length

  const newCount = requests.filter(
    (request) => request.status === "SUBMITTED"
  ).length

  const trainerCount = requests.filter(
    (request) => request.status === "TRAINER_ASSIGNMENT"
  ).length

  const trainingCount = requests.filter(
    (request) => request.status === "TRAINING"
  ).length

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-600">
            <ClipboardCheck className="size-4" />
            Operations
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Service Requests
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Review, verify and process client service requests through the
            operational workflow.
          </p>
        </div>

        <Link
          href="/sub-admin/dashboard"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* SUMMARY */}
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
            <p className="mt-1 text-sm text-slate-500">
              Total service requests
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Clock3 className="size-5" />
              </div>
              <span className="text-xs font-semibold text-amber-600">ACTION</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {loading ? "—" : verificationCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card className="border-cyan-100 bg-gradient-to-br from-cyan-50 to-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                <User className="size-5" />
              </div>
              <span className="text-xs font-semibold text-cyan-600">TRAINERS</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {loading ? "—" : trainerCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Ready for assignment
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <CheckCircle2 className="size-5" />
              </div>
              <span className="text-xs font-semibold text-violet-600">TRAINING</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {loading ? "—" : trainingCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Currently in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by request ID, client or programme..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400" />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 lg:w-64"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* REQUEST LIST */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Request Queue
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                {loading ? "Loading requests..." : `${filteredRequests.length} request${filteredRequests.length !== 1 ? "s" : ""} found`}
              </p>
            </div>

            <Badge className="border-0 bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
              Operational Queue
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">

          {/* ERROR */}
          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="px-6 py-16 text-center text-sm text-slate-500">
              Loading service requests...
            </div>
          )}

          {/* DESKTOP */}
          {!loading && !error && filteredRequests.length > 0 && (
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Request
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Service / Programme
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Participants
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Requested Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => {
                    const status = getStatus(request.status)

                    return (
                      <tr
                        key={request.id}
                        className="group border-b border-slate-100 transition-colors hover:bg-indigo-50/30"
                      >
                        <td className="px-6 py-5">
                          <Link
                            href={`/sub-admin/requests/${request.id}`}
                            className="block"
                          >
                            <p className="font-mono text-xs font-semibold text-indigo-600">
                              {request.requestNumber}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {formatSubmittedAt(request.submittedAt)}
                            </p>
                          </Link>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                              <Building2 className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-48 truncate text-sm font-semibold text-slate-700">
                                {request.clientName}
                              </p>
                              <p className="max-w-48 truncate text-xs text-slate-400">
                                {request.clientEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="max-w-56 space-y-1">
                            {request.programmes.slice(0, 2).map((program) => (
                              <p key={program.code} className="truncate text-sm text-slate-600">
                                {program.title}
                              </p>
                            ))}
                            {request.programmes.length > 2 && (
                              <p className="text-xs font-medium text-indigo-600">
                                +{request.programmes.length - 2} more programmes
                              </p>
                            )}
                            {request.programmes.length === 0 && (
                              <span className="text-sm text-slate-400">No programmes</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <User className="size-4 text-slate-400" />
                            {request.totalParticipants}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays className="size-4 text-slate-400" />
                            {formatDate(request.preferredDate)}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <Badge className={status.className}>
                            {status.label}
                          </Badge>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/sub-admin/requests/${request.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            Open
                            <ArrowUpRight className="size-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* MOBILE */}
          {!loading && !error && filteredRequests.length > 0 && (
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredRequests.map((request) => {
                const status = getStatus(request.status)

                return (
                  <Link
                    key={request.id}
                    href={`/sub-admin/requests/${request.id}`}
                    className="block p-5 transition-colors hover:bg-indigo-50/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FileText className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {request.clientName}
                            </p>
                            <p className="mt-1 font-mono text-xs text-indigo-500">
                              {request.requestNumber}
                            </p>
                          </div>
                          <ArrowUpRight className="size-4 shrink-0 text-slate-300" />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge className={status.className}>
                            {status.label}
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-1">
                          {request.programmes.slice(0, 2).map((program) => (
                            <p key={program.code} className="text-sm text-slate-600">
                              {program.title}
                            </p>
                          ))}
                          {request.programmes.length > 2 && (
                            <p className="text-xs text-indigo-600">
                              +{request.programmes.length - 2} more
                            </p>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Participants
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {request.totalParticipants}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Training Date
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {formatDate(request.preferredDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && filteredRequests.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search className="size-6" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                {requests.length === 0
                  ? "No service requests yet"
                  : "No requests found"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {requests.length === 0
                  ? "New client submissions will appear here."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WORKFLOW NOTE */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-blue-50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <ClipboardCheck className="size-5" />
          </div>

          <div>
            <p className="font-semibold text-slate-800">
              Processing workflow
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Request Submission → Review → TSO → Payment → PSGA → TAF
              → Trainer Assignment → Training → Completion
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
