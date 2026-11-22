"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  IndianRupee,
  MessageSquare,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { DashboardShell } from "@/components/layout/dashboard-shell"

const approvalData = {
  id: "PAY-102",
  type: "Payment Verification",
  client: "ABC Manufacturing",
  submittedBy: "Sub Admin",
  submittedAt: "27 October 2026, 09:42 AM",
  amount: "₹85,000",
  paymentMethod: "Bank Transfer",
  reference: "UTR982736451",
  service: "Corporate Safety Training",
  requestId: "REQ-2026-0102",
  dueDate: "30 October 2026",
  remarks:
    "Payment received from the client. Bank transaction details and supporting documents have been verified by the Sub Admin team.",
}

const documents = [
  {
    name: "Payment Receipt",
    type: "PDF",
    size: "248 KB",
  },
  {
    name: "Bank Transaction Proof",
    type: "PDF",
    size: "512 KB",
  },
  {
    name: "Client Invoice",
    type: "PDF",
    size: "184 KB",
  },
]

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export default function ApprovalDetailPage() {
  const params = useParams()

  const approvalId =
    typeof params.id === "string"
      ? params.id
      : approvalData.id

  const [status, setStatus] =
    useState<ApprovalStatus>("PENDING")

  const [showApproveDialog, setShowApproveDialog] =
    useState(false)

  const [showRejectDialog, setShowRejectDialog] =
    useState(false)

  const [rejectRemarks, setRejectRemarks] =
    useState("")

  const [error, setError] = useState("")

  const handleApprove = () => {
    setStatus("APPROVED")
    setShowApproveDialog(false)
  }

  const handleReject = () => {
    if (!rejectRemarks.trim()) {
      setError("Please enter rejection remarks.")
      return
    }

    setStatus("REJECTED")
    setShowRejectDialog(false)
    setError("")
  }

  const openRejectDialog = () => {
    setRejectRemarks("")
    setError("")
    setShowRejectDialog(true)
  }

  const statusConfig = {
    PENDING: {
      label: "Pending Approval",
      description: "Waiting for Admin decision",
      icon: Clock3,
      badgeClass:
        "border-0 bg-amber-50 text-amber-700 hover:bg-amber-50",
      boxClass:
        "border-amber-100 bg-amber-50",
      iconClass:
        "bg-amber-100 text-amber-600",
    },
    APPROVED: {
      label: "Approved",
      description: "Approval completed successfully",
      icon: CheckCircle2,
      badgeClass:
        "border-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
      boxClass:
        "border-emerald-100 bg-emerald-50",
      iconClass:
        "bg-emerald-100 text-emerald-600",
    },
    REJECTED: {
      label: "Rejected",
      description: "Returned for correction",
      icon: XCircle,
      badgeClass:
        "border-0 bg-red-50 text-red-700 hover:bg-red-50",
      boxClass:
        "border-red-100 bg-red-50",
      iconClass:
        "bg-red-100 text-red-600",
    },
  }

  const currentStatus = statusConfig[status]
  const StatusIcon = currentStatus.icon

  return (
    <DashboardShell role="ADMIN">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/admin/approvals"
            className="flex items-center gap-2 font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="size-4" />
            Approvals
          </Link>

          <ChevronRight className="size-4 text-slate-300" />

          <span className="font-medium text-slate-800">
            {approvalId}
          </span>
        </div>

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className={currentStatus.badgeClass}>
                <StatusIcon className="mr-1.5 size-3.5" />
                {currentStatus.label}
              </Badge>

              <Badge
                variant="outline"
                className="border-slate-200 bg-white text-slate-600"
              >
                {approvalId}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {approvalData.type}
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Review the submitted information before providing final approval.
            </p>
          </div>

          {status === "PENDING" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={openRejectDialog}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-red-200
                  bg-white
                  px-5
                  text-sm
                  font-semibold
                  text-red-600
                  shadow-sm
                  transition-all
                  hover:bg-red-50
                  hover:shadow-md
                "
              >
                <XCircle className="size-4" />
                Reject
              </button>

              <button
                type="button"
                onClick={() => setShowApproveDialog(true)}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-emerald-600
                  to-green-600
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-md
                  shadow-emerald-500/20
                  transition-all
                  hover:-translate-y-0.5
                  hover:shadow-lg
                "
              >
                <CheckCircle2 className="size-4" />
                Approve
              </button>
            </div>
          )}
        </div>

        {/* STATUS BANNER */}
        {status !== "PENDING" && (
          <div
            className={`
              flex
              items-center
              gap-4
              rounded-2xl
              border
              p-5
              ${currentStatus.boxClass}
            `}
          >
            <div
              className={`
                flex
                size-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                ${currentStatus.iconClass}
              `}
            >
              <StatusIcon className="size-6" />
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                {currentStatus.label}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {currentStatus.description}.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">

            {/* PAYMENT */}
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50/80 to-orange-50/30">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <CreditCard className="size-5" />
                  </div>

                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Payment Details
                    </CardTitle>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Payment information submitted for verification.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Payment Amount
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <IndianRupee className="size-5 text-emerald-600" />

                      <p className="text-2xl font-bold text-slate-900">
                        {approvalData.amount}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Payment Method
                    </p>

                    <p className="mt-2 font-semibold text-slate-800">
                      {approvalData.paymentMethod}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Transaction Reference
                    </p>

                    <p className="mt-2 font-mono text-sm font-semibold text-slate-800">
                      {approvalData.reference}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Payment Status
                    </p>

                    <Badge className={currentStatus.badgeClass}>
                      {currentStatus.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CLIENT / REQUEST */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Building2 className="size-5" />
                  </div>

                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Client & Request
                    </CardTitle>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Information associated with this approval.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Building2 className="size-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        Client
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-slate-800">
                      {approvalData.client}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileText className="size-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        Request ID
                      </span>
                    </div>

                    <p className="mt-2 font-mono text-sm font-semibold text-slate-800">
                      {approvalData.requestId}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileCheck2 className="size-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        Service
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-slate-800">
                      {approvalData.service}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarDays className="size-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        Due Date
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-slate-800">
                      {approvalData.dueDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DOCUMENTS */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <FileText className="size-5" />
                  </div>

                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Supporting Documents
                    </CardTitle>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Documents submitted for verification.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {documents.map((document) => (
                    <div
                      key={document.name}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50/50
                        p-4
                        transition-colors
                        hover:border-indigo-200
                        hover:bg-indigo-50/40
                      "
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
                          <FileText className="size-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {document.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {document.type} · {document.size}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="
                          flex
                          size-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-slate-200
                          bg-white
                          text-slate-500
                          transition-colors
                          hover:border-indigo-200
                          hover:bg-indigo-50
                          hover:text-indigo-600
                        "
                      >
                        <Download className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* REMARKS */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <MessageSquare className="size-5" />
                  </div>

                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Sub Admin Remarks
                    </CardTitle>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Additional information provided during processing.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <p className="text-sm leading-6 text-slate-600">
                    {approvalData.remarks}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">

            {/* STATUS */}
            <Card className="overflow-hidden border-indigo-100 bg-white shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-500" />

              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Approval Status
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    p-4
                    ${currentStatus.boxClass}
                  `}
                >
                  <div
                    className={`
                      flex
                      size-10
                      items-center
                      justify-center
                      rounded-full
                      ${currentStatus.iconClass}
                    `}
                  >
                    <StatusIcon className="size-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {currentStatus.label}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-600">
                      {currentStatus.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Submitted by
                    </span>

                    <span className="font-medium text-slate-800">
                      {approvalData.submittedBy}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Submitted
                    </span>

                    <span className="text-right font-medium text-slate-800">
                      10 min ago
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Approval ID
                    </span>

                    <span className="font-mono text-xs font-semibold text-slate-800">
                      {approvalData.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SUBMITTED BY */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Submitted By
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                    <User className="size-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      Sub Admin
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Operations Team
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AUTHORITY */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 p-5 text-white shadow-lg shadow-indigo-500/20">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
                <ShieldCheck className="size-5" />
              </div>

              <p className="mt-4 font-semibold">
                Final Approval Authority
              </p>

              <p className="mt-2 text-sm leading-5 text-indigo-100">
                This action will be recorded in the approval history and
                audit trail.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-100">
                <CheckCircle2 className="size-4" />
                Secure approval workflow
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        {status === "PENDING" && (
          <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Ready to make a decision?
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your decision will be recorded in the approval history.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={openRejectDialog}
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-red-200
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-red-600
                    hover:bg-red-50
                  "
                >
                  <XCircle className="size-4" />
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() => setShowApproveDialog(true)}
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-emerald-600
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    hover:bg-emerald-700
                  "
                >
                  <CheckCircle2 className="size-4" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APPROVE DIALOG */}
        {showApproveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">

              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-6" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Approve Payment?
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    You are about to approve payment verification for{" "}
                    <span className="font-semibold text-slate-700">
                      {approvalData.client}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700">
                    Payment Amount
                  </span>

                  <span className="font-bold text-emerald-800">
                    {approvalData.amount}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-emerald-700">
                    Approval ID
                  </span>

                  <span className="font-mono text-xs font-semibold text-emerald-800">
                    {approvalData.id}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                This action represents the Admin's final approval for this
                step of the workflow.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApproveDialog(false)}
                  className="
                    h-10
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-lg
                    bg-emerald-600
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    hover:bg-emerald-700
                  "
                >
                  <CheckCircle2 className="size-4" />
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECT DIALOG */}
        {showRejectDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">

              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <XCircle className="size-6" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Reject Approval
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Please provide a reason. The Sub Admin will need this
                    information to correct and resubmit the request.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="reject-remarks"
                  className="text-sm font-semibold text-slate-800"
                >
                  Rejection Remarks
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <textarea
                  id="reject-remarks"
                  value={rejectRemarks}
                  onChange={(event) => {
                    setRejectRemarks(event.target.value)
                    if (error) {
                      setError("")
                    }
                  }}
                  placeholder="Explain why this approval is being rejected..."
                  rows={5}
                  className="
                    mt-2
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-red-300
                    focus:ring-4
                    focus:ring-red-100
                  "
                />

                {error && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                <div className="flex gap-2">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />

                  <p className="text-xs leading-5 text-red-700">
                    Rejection will return this item to the operational team
                    for correction and resubmission.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectDialog(false)
                    setError("")
                  }}
                  className="
                    h-10
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-lg
                    bg-red-600
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    hover:bg-red-700
                  "
                >
                  <XCircle className="size-4" />
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}