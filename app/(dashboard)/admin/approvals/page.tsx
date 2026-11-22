"use client"

import Link from "next/link"

import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  IndianRupee,
  Search,
  User,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { DashboardShell } from "@/components/layout/dashboard-shell"

const approvals = [
  {
    id: "PAY-102",
    type: "Payment Verification",
    client: "ABC Manufacturing",
    submittedBy: "Sub Admin",
    amount: "₹85,000",
    service: "Corporate Safety Training",
    submittedAt: "10 min ago",
    status: "PENDING",
  },
  {
    id: "RPT-087",
    type: "Training Report Approval",
    client: "XYZ Industries",
    submittedBy: "Sub Admin",
    amount: "—",
    service: "Fire Safety Training",
    submittedAt: "32 min ago",
    status: "PENDING",
  },
  {
    id: "CERT-041",
    type: "Certificate Approval",
    client: "Global Tech Pvt. Ltd.",
    submittedBy: "Sub Admin",
    amount: "—",
    service: "Workplace Safety Training",
    submittedAt: "1 hour ago",
    status: "PENDING",
  },
  {
    id: "PAY-099",
    type: "Payment Verification",
    client: "Prime Engineering",
    submittedBy: "Sub Admin",
    amount: "₹62,500",
    service: "Industrial Safety Training",
    submittedAt: "2 hours ago",
    status: "PENDING",
  },
]

const statusConfig = {
  PENDING: {
    label: "Pending",
    className:
      "border-0 bg-amber-50 text-amber-700 hover:bg-amber-50",
    icon: Clock3,
  },
  APPROVED: {
    label: "Approved",
    className:
      "border-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className:
      "border-0 bg-red-50 text-red-700 hover:bg-red-50",
    icon: XCircle,
  },
}

export default function AdminApprovalsPage() {
  return (
    <DashboardShell role="ADMIN">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <CheckCircle2 className="size-4" />
              Admin Control Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Approvals
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Review and provide final approval for items submitted by the
              operational team.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <Clock3 className="size-5 text-amber-600" />

            <div>
              <p className="text-xs font-medium text-amber-600">
                Pending Actions
              </p>

              <p className="text-lg font-bold text-amber-800">
                {approvals.filter(
                  (approval) => approval.status === "PENDING"
                ).length}
              </p>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <FileCheck2 className="size-5" />
                </div>

                <span className="text-xs font-semibold text-indigo-600">
                  TOTAL
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                24
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Total approvals
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Clock3 className="size-5" />
                </div>

                <span className="text-xs font-semibold text-amber-600">
                  ACTION
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                4
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Awaiting your review
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>

                <span className="text-xs font-semibold text-emerald-600">
                  DONE
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                18
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Approved this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-100 bg-gradient-to-br from-red-50 to-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <XCircle className="size-5" />
                </div>

                <span className="text-xs font-semibold text-red-600">
                  RETURNED
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                2
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Rejected this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* MAIN LIST */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">

          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Approval Queue
                </CardTitle>

                <p className="mt-1 text-sm text-slate-500">
                  Items requiring Admin review and final decision.
                </p>
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search approvals..."
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    pl-9
                    pr-3
                    text-sm
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-300
                    focus:bg-white
                    focus:ring-4
                    focus:ring-indigo-50
                  "
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Approval
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Client
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Service
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Submitted
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
                  {approvals.map((approval) => {
                    const config = statusConfig[approval.status as keyof typeof statusConfig]
                    const StatusIcon = config.icon

                    return (
                      <tr
                        key={approval.id}
                        className="
                          group
                          border-b
                          border-slate-100
                          transition-colors
                          hover:bg-indigo-50/30
                        "
                      >
                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/approvals/${approval.id}`}
                            className="block"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                                {approval.type.includes("Payment") ? (
                                  <CreditCard className="size-5" />
                                ) : approval.type.includes("Report") ? (
                                  <FileText className="size-5" />
                                ) : (
                                  <FileCheck2 className="size-5" />
                                )}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800 group-hover:text-indigo-700">
                                  {approval.type}
                                </p>

                                <p className="mt-1 font-mono text-xs text-slate-400">
                                  {approval.id}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Building2 className="size-4 text-slate-400" />

                            <span className="text-sm font-medium text-slate-700">
                              {approval.client}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="max-w-48 text-sm text-slate-600">
                            {approval.service}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          {approval.amount !== "—" ? (
                            <div className="flex items-center gap-1 font-semibold text-slate-800">
                              <IndianRupee className="size-3.5" />
                              {approval.amount.replace("₹", "")}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock3 className="size-3.5" />
                            {approval.submittedAt}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <Badge className={config.className}>
                            <StatusIcon className="mr-1.5 size-3.5" />
                            {config.label}
                          </Badge>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/approvals/${approval.id}`}
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-slate-600
                              shadow-sm
                              transition-all
                              hover:border-indigo-200
                              hover:bg-indigo-50
                              hover:text-indigo-600
                            "
                          >
                            Review
                            <ArrowUpRight className="size-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="divide-y divide-slate-100 md:hidden">
              {approvals.map((approval) => {
                const config =
                  statusConfig[
                    approval.status as keyof typeof statusConfig
                  ]

                const StatusIcon = config.icon

                return (
                  <Link
                    key={approval.id}
                    href={`/admin/approvals/${approval.id}`}
                    className="block p-5 transition-colors hover:bg-indigo-50/40"
                  >
                    <div className="flex items-start gap-3">

                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        {approval.type.includes("Payment") ? (
                          <CreditCard className="size-5" />
                        ) : approval.type.includes("Report") ? (
                          <FileText className="size-5" />
                        ) : (
                          <FileCheck2 className="size-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {approval.type}
                            </p>

                            <p className="mt-1 font-mono text-xs text-slate-400">
                              {approval.id}
                            </p>
                          </div>

                          <ChevronRight className="mt-1 size-4 shrink-0 text-slate-300" />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Client
                            </p>

                            <p className="mt-1 truncate text-sm font-medium text-slate-700">
                              {approval.client}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Submitted
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {approval.submittedAt}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <Badge className={config.className}>
                            <StatusIcon className="mr-1.5 size-3.5" />
                            {config.label}
                          </Badge>

                          {approval.amount !== "—" && (
                            <span className="font-semibold text-slate-800">
                              {approval.amount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* FOOTER INFO */}
        <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
          <User className="size-4 shrink-0 text-indigo-600" />

          <p className="text-xs leading-5 text-indigo-700">
            Only Admin users can provide final approval. Rejected items are
            returned to the Sub Admin team for correction and resubmission.
          </p>
        </div>
      </div>
    </DashboardShell>
  )
}