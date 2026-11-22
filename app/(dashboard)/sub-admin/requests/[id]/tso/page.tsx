"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  Hash,
  MapPin,
  Send,
  Users,
  WandSparkles,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

/* ============================================================
   MOCK REQUEST DATA
============================================================ */

const requestData = {
  id: "REQ-2026-0102",
  client: "ABC Manufacturing Pvt. Ltd.",
  service: "Corporate Safety Training",
  participants: 45,
  trainingDate: "05 Nov 2026",
  trainingEndDate: "06 Nov 2026",
  location: "ABC Manufacturing Plant, Noida",
  duration: "2 Days",
  status: "VERIFIED",
  contactPerson: "Rajesh Kumar",
  email: "rajesh.kumar@abcmanufacturing.com",
  phone: "+91 98765 43210",
}

/* ============================================================
   PAGE CONTENT
============================================================ */

function TSOPageContent() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [status, setStatus] = useState<
    "DRAFT" | "GENERATED" | "SENT_TO_CLIENT"
  >("DRAFT")

  const [formData, setFormData] = useState({
    tsoNumber: "TSO-2026-0102",
    trainingTitle: "Corporate Safety Training",
    trainingDate: "05 Nov 2026",
    trainingEndDate: "06 Nov 2026",
    participants: "45",
    location: "ABC Manufacturing Plant, Noida",
    duration: "2 Days",
    trainingMode: "On-site",
    specialRequirements:
      "Training to be conducted as per agreed corporate safety training requirements.",
    remarks: "",
  })

  const handleChange = (
    field: keyof typeof formData,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleGenerate = () => {
    setStatus("GENERATED")
  }

  const handleSendToClient = () => {
    setStatus("SENT_TO_CLIENT")
  }

  return (
    <DashboardShell role="SUB_ADMIN">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Link
              href={`/sub-admin/requests/${id}`}
              className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-indigo-600">
                  TSO Generation
                </p>

                <StatusBadge status={status} />
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Training Service Order
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Prepare and send the TSO for service request{" "}
                <span className="font-semibold text-slate-700">
                  {requestData.id}
                </span>
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap gap-2">
            <Link href={`/sub-admin/requests/${id}`}>
              <Button variant="outline">
                Cancel
              </Button>
            </Link>

            {status === "DRAFT" && (
              <Button
                onClick={handleGenerate}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700"
              >
                <WandSparkles className="size-4" />
                Generate TSO
              </Button>
            )}

            {status === "GENERATED" && (
              <Button
                onClick={handleSendToClient}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
              >
                <Send className="size-4" />
                Send to Client
              </Button>
            )}

            {status === "SENT_TO_CLIENT" && (
              <Button
                disabled
                className="bg-emerald-600 text-white opacity-100"
              >
                <CheckCircle2 className="size-4" />
                Sent to Client
              </Button>
            )}
          </div>
        </div>

        {/* ====================================================
            STATUS BANNER
        ===================================================== */}

        {status === "GENERATED" && (
          <Card className="overflow-hidden border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-violet-50">
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <FileCheck2 className="size-5" />
                </div>

                <div>
                  <p className="font-semibold text-indigo-900">
                    TSO generated successfully
                  </p>

                  <p className="mt-1 text-sm text-indigo-700">
                    {formData.tsoNumber} is ready for client review.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline">
                  <Eye className="size-4" />
                  Preview TSO
                </Button>

                <Button variant="outline">
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "SENT_TO_CLIENT" && (
          <Card className="overflow-hidden border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50">
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Send className="size-5" />
                </div>

                <div>
                  <p className="font-semibold text-emerald-900">
                    TSO sent to client
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    The client has received {formData.tsoNumber} and
                    can now review and accept or reject it.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline">
                  <Eye className="size-4" />
                  View TSO
                </Button>

                <Button variant="outline">
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ====================================================
            REQUEST SUMMARY
        ===================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<Hash className="size-5" />}
            label="Request ID"
            value={requestData.id}
            tone="indigo"
          />

          <SummaryCard
            icon={<Building2 className="size-5" />}
            label="Client"
            value={requestData.client}
            tone="violet"
          />

          <SummaryCard
            icon={<Users className="size-5" />}
            label="Participants"
            value={`${requestData.participants} People`}
            tone="blue"
          />

          <SummaryCard
            icon={<CalendarDays className="size-5" />}
            label="Training Date"
            value={requestData.trainingDate}
            tone="amber"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

          {/* ==================================================
              MAIN FORM
          =================================================== */}

          <div className="space-y-6">

            <Card className="border-indigo-100 shadow-sm">
              <CardHeader className="border-b border-indigo-50 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/50">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <FileText className="size-5" />
                  </div>

                  <div>
                    <CardTitle>
                      TSO Information
                    </CardTitle>

                    <CardDescription>
                      Information that will appear on the Training
                      Service Order.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 p-6">

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="TSO Number"
                    value={formData.tsoNumber}
                    onChange={(value) =>
                      handleChange("tsoNumber", value)
                    }
                    icon={<Hash className="size-4" />}
                    disabled={status !== "DRAFT"}
                  />

                  <FormField
                    label="Training Title"
                    value={formData.trainingTitle}
                    onChange={(value) =>
                      handleChange("trainingTitle", value)
                    }
                    icon={<GraduationCap className="size-4" />}
                    disabled={status !== "DRAFT"}
                  />

                  <FormField
                    label="Training Start Date"
                    value={formData.trainingDate}
                    onChange={(value) =>
                      handleChange("trainingDate", value)
                    }
                    icon={<CalendarDays className="size-4" />}
                    disabled={status !== "DRAFT"}
                  />

                  <FormField
                    label="Training End Date"
                    value={formData.trainingEndDate}
                    onChange={(value) =>
                      handleChange("trainingEndDate", value)
                    }
                    icon={<CalendarDays className="size-4" />}
                    disabled={status !== "DRAFT"}
                  />

                  <FormField
                    label="Number of Participants"
                    value={formData.participants}
                    onChange={(value) =>
                      handleChange("participants", value)
                    }
                    icon={<Users className="size-4" />}
                    type="number"
                    disabled={status !== "DRAFT"}
                  />

                  <FormField
                    label="Duration"
                    value={formData.duration}
                    onChange={(value) =>
                      handleChange("duration", value)
                    }
                    icon={<ClipboardList className="size-4" />}
                    disabled={status !== "DRAFT"}
                  />
                </div>

                <Separator />

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Training Location"
                    value={formData.location}
                    onChange={(value) =>
                      handleChange("location", value)
                    }
                    icon={<MapPin className="size-4" />}
                    disabled={status !== "DRAFT"}
                  />

                  <FormField
                    label="Training Mode"
                    value={formData.trainingMode}
                    onChange={(value) =>
                      handleChange("trainingMode", value)
                    }
                    icon={<Building2 className="size-4" />}
                    disabled={status !== "DRAFT"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ==================================================
                REQUIREMENTS
            =================================================== */}

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>
                  Training Requirements
                </CardTitle>

                <CardDescription>
                  Add special instructions or requirements for
                  this training.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Special Requirements
                  </label>

                  <textarea
                    value={formData.specialRequirements}
                    onChange={(event) =>
                      handleChange(
                        "specialRequirements",
                        event.target.value,
                      )
                    }
                    disabled={status !== "DRAFT"}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Enter training requirements..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Internal Remarks
                  </label>

                  <textarea
                    value={formData.remarks}
                    onChange={(event) =>
                      handleChange(
                        "remarks",
                        event.target.value,
                      )
                    }
                    disabled={status !== "DRAFT"}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Optional internal remarks..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* ==================================================
                PRICING PLACEHOLDER
            =================================================== */}

            <Card className="border-amber-100 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50/80 via-white to-orange-50/50">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-amber-600" />
                  Commercial Information
                </CardTitle>

                <CardDescription>
                  Pricing structure will be connected here once
                  the final commercial format is provided.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-5">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <ClipboardList className="size-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-amber-900">
                        Pricing fields pending
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        Final pricing, taxes, discounts, payment
                        terms and other commercial fields will be
                        added according to the format you provide.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ==================================================
              RIGHT SIDEBAR
          =================================================== */}

          <div className="space-y-6">

            {/* Client */}
            <Card className="border-violet-100 shadow-sm">
              <CardHeader className="bg-gradient-to-br from-violet-50 to-indigo-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5 text-violet-600" />
                  Client Details
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 p-5">
                <DetailRow
                  label="Company"
                  value={requestData.client}
                />

                <DetailRow
                  label="Contact Person"
                  value={requestData.contactPerson}
                />

                <DetailRow
                  label="Email"
                  value={requestData.email}
                />

                <DetailRow
                  label="Phone"
                  value={requestData.phone}
                />
              </CardContent>
            </Card>

            {/* Workflow */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle>
                  Workflow Progress
                </CardTitle>

                <CardDescription>
                  Current request processing stage
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">

                <WorkflowStep
                  number="01"
                  title="Service Request"
                  status="Completed"
                />

                <WorkflowStep
                  number="02"
                  title="Sub Admin Review"
                  status="Completed"
                />

                <WorkflowStep
                  number="03"
                  title="TSO Generation"
                  status={
                    status === "DRAFT"
                      ? "Current"
                      : "Completed"
                  }
                />

                <WorkflowStep
                  number="04"
                  title="Send to Client"
                  status={
                    status === "GENERATED"
                      ? "Current"
                      : status === "SENT_TO_CLIENT"
                        ? "Completed"
                        : "Pending"
                  }
                />

                <WorkflowStep
                  number="05"
                  title="Client Review"
                  status={
                    status === "SENT_TO_CLIENT"
                      ? "Current"
                      : "Pending"
                  }
                />

                <WorkflowStep
                  number="06"
                  title="Payment"
                  status="Pending"
                />

                <WorkflowStep
                  number="07"
                  title="Payment Verification"
                  status="Pending"
                />

                <WorkflowStep
                  number="08"
                  title="PSGA"
                  status="Pending"
                />
              </CardContent>
            </Card>

            {/* Current Action */}
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50">
              <CardContent className="p-5">

                {status === "DRAFT" && (
                  <ActionMessage
                    icon={
                      <WandSparkles className="size-5" />
                    }
                    title="Generate TSO"
                    description="Review the information and generate the Training Service Order."
                  />
                )}

                {status === "GENERATED" && (
                  <ActionMessage
                    icon={<Send className="size-5" />}
                    title="Ready to Send"
                    description="TSO is generated. Send it to the client for review and acceptance."
                  />
                )}

                {status === "SENT_TO_CLIENT" && (
                  <ActionMessage
                    icon={
                      <CheckCircle2 className="size-5" />
                    }
                    title="Waiting for Client"
                    description="TSO has been sent. The next action will happen after the client accepts or rejects the TSO."
                  />
                )}
              </CardContent>
            </Card>

            {/* IMPORTANT:
                No PSGA button here.
                PSGA will only become available after:
                TSO Accepted → Payment → Payment Verification.
            */}

          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: "DRAFT" | "GENERATED" | "SENT_TO_CLIENT"
}) {
  if (status === "DRAFT") {
    return (
      <Badge className="border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100">
        DRAFT
      </Badge>
    )
  }

  if (status === "GENERATED") {
    return (
      <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
        GENERATED
      </Badge>
    )
  }

  return (
    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
      SENT TO CLIENT
    </Badge>
  )
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: "indigo" | "violet" | "blue" | "amber"
}) {
  const tones = {
    indigo:
      "border-indigo-100 bg-indigo-50/60 text-indigo-600",

    violet:
      "border-violet-100 bg-violet-50/60 text-violet-600",

    blue:
      "border-blue-100 bg-blue-50/60 text-blue-600",

    amber:
      "border-amber-100 bg-amber-50/60 text-amber-600",
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${tones[tone]}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-900">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/* ============================================================
   FORM FIELD
============================================================ */

function FormField({
  label,
  value,
  onChange,
  icon,
  type = "text",
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  icon: React.ReactNode
  type?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>
    </div>
  )
}

/* ============================================================
   DETAIL ROW
============================================================ */

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  )
}

/* ============================================================
   WORKFLOW STEP
============================================================ */

function WorkflowStep({
  number,
  title,
  status,
}: {
  number: string
  title: string
  status: "Completed" | "Current" | "Pending"
}) {
  const statusClasses = {
    Completed:
      "bg-emerald-100 text-emerald-700",

    Current:
      "bg-indigo-100 text-indigo-700",

    Pending:
      "bg-slate-100 text-slate-500",
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
        {number}
      </div>

      <p className="min-w-0 flex-1 text-sm font-medium text-slate-700">
        {title}
      </p>

      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[status]}`}
      >
        {status}
      </span>
    </div>
  )
}

/* ============================================================
   ACTION MESSAGE
============================================================ */

function ActionMessage({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
        {icon}
      </div>

      <div>
        <p className="font-semibold text-indigo-900">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-indigo-800">
          {description}
        </p>
      </div>
    </div>
  )
}

/* ============================================================
   FALLBACK
============================================================ */

function TSOPagesFallback() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="flex items-center gap-4">
          <div className="size-9 animate-pulse rounded-lg bg-slate-200" />

          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="h-[520px] animate-pulse rounded-xl border border-slate-200 bg-white" />
            <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
          </div>

          <div className="space-y-6">
            <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
            <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   PAGE
============================================================ */

export default function TSOPage() {
  return (
    <Suspense fallback={<TSOPagesFallback />}>
      <TSOPageContent />
    </Suspense>
  )
}