
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  UserRound,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Send,
  FileText,
  Clock,
  Loader2,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Program {
  code: string
  title: string
  category: string
  audience: string
  mode: string
  duration: string
}

interface Requirement {
  code: string
  participants: string
  batches: string
  mode: string
}

interface RequestData {
  organisation: string
  gstin: string
  address: string
  country: string
  state: string
  city: string
  contactName: string
  designation: string
  email: string
  phone: string
  preferredDate: string
  alternateDate: string
  location: string
  language: string
  coordinator: string
  facilities: string
  assessment: string
  refresher: string
  additionalRequirements: string
  selectedPrograms: Program[]
  programRequirements: Requirement[]
}

interface SubmittedRequest {
  requestNumber: string
  status: string
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value?.trim() || "Not provided"}
      </p>
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: React.ElementType
  title: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="size-5" />
      </div>
      <h2 className="font-bold text-slate-900">{title}</h2>
    </div>
  )
}

export default function ClientRequestReviewPage() {
  const [data, setData] = useState<RequestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submittedRequest, setSubmittedRequest] =
    useState<SubmittedRequest | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(
        "clp-client-service-information"
      )

      if (saved) {
        setData(JSON.parse(saved) as RequestData)
      }

      // Only restore a submission confirmed by the backend.
      const savedSubmission = sessionStorage.getItem(
        "clp-submitted-request"
      )

      if (savedSubmission) {
        const parsed = JSON.parse(savedSubmission)

        if (
          parsed?.source === "backend" &&
          parsed?.requestNumber
        ) {
          setSubmittedRequest({
            requestNumber: parsed.requestNumber,
            status: parsed.status || "SUBMITTED",
          })
        } else {
          // Remove old demo-generated success data.
          sessionStorage.removeItem("clp-submitted-request")
        }
      }
    } catch (err) {
      console.error("Request review load error:", err)
      setData(null)
      setError("Unable to load request information. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  async function handleSubmit() {
    if (!data || submitting) return

    setError("")

    if (!data.selectedPrograms?.length) {
      setError("No training programmes found in this request.")
      return
    }

    if (!data.programRequirements?.length) {
      setError("Programme requirements are missing.")
      return
    }

    const invalidRequirement = data.programRequirements.find(
      (item) =>
        !item.participants ||
        Number(item.participants) < 1 ||
        !item.batches ||
        Number(item.batches) < 1
    )

    if (invalidRequirement) {
      setError(
        `Please enter valid participants and batches for programme ${invalidRequirement.code}.`
      )
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        organisation: data.organisation,
        gstin: data.gstin,
        address: data.address,
        country: data.country,
        state: data.state,
        city: data.city,
        contactName: data.contactName,
        designation: data.designation,
        email: data.email,
        phone: data.phone,
        preferredDate: data.preferredDate,
        alternateDate: data.alternateDate,
        location: data.location,
        language: data.language,
        coordinator: data.coordinator,
        facilities: data.facilities,
        assessment: data.assessment,
        refresher: data.refresher,
        additionalRequirements: data.additionalRequirements,

        selectedPrograms: data.selectedPrograms.map((program) => ({
          code: program.code,
        })),

        programRequirements: data.programRequirements.map((item) => ({
          code: item.code,
          participants: item.participants,
          batches: item.batches,
          mode: item.mode,
        })),
      }

      const response = await fetch("/api/client/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(payload),
      })

      const contentType = response.headers.get("content-type")

      if (!contentType?.includes("application/json")) {
        throw new Error(
          "Server did not return a valid response. Please try again."
        )
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit your service request."
        )
      }

      // Request reference must come from the backend response.
      const requestNumber =
        result.request?.requestNumber ||
        result.request?.requestNo ||
        result.requestNumber ||
        result.requestNo

      const status =
        result.request?.status ||
        result.status ||
        "SUBMITTED"

      if (!requestNumber) {
        throw new Error(
          "Request was processed, but the server did not return a request reference. Please contact the administrator before submitting again."
        )
      }

      const submission: SubmittedRequest = {
        requestNumber,
        status,
      }

      sessionStorage.setItem(
        "clp-submitted-request",
        JSON.stringify({
          ...submission,
          source: "backend",
          submittedAt: new Date().toISOString(),
        })
      )

      setSubmittedRequest(submission)
    } catch (err) {
      console.error("Service request submission error:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell role="CLIENT">
        <div className="mx-auto max-w-5xl animate-pulse space-y-5">
          <div className="h-32 rounded-2xl bg-indigo-100" />
          <div className="h-72 rounded-2xl bg-white" />
          <div className="h-72 rounded-2xl bg-white" />
        </div>
      </DashboardShell>
    )
  }

  // SUCCESS SCREEN
  if (submittedRequest) {
    return (
      <DashboardShell role="CLIENT">
        <div className="mx-auto max-w-2xl py-10">
          <Card className="overflow-hidden border-emerald-200 shadow-lg">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

            <div className="p-8 text-center md:p-12">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="size-11" />
              </div>

              <Badge className="mt-6 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Request Submitted
              </Badge>

              <h1 className="mt-4 text-2xl font-bold text-slate-900">
                Your Request Has Been Submitted!
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Your service request has been successfully submitted
                to NLETA. Our Sub Admin team will review your request
                and verify the submitted information.
              </p>

              <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-medium text-emerald-700">
                  Request Reference
                </p>

                <p className="mt-2 break-all text-2xl font-bold tracking-wide text-emerald-800">
                  {submittedRequest.requestNumber}
                </p>

                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-700">
                  <Clock className="size-4" />
                  Status: {submittedRequest.status.replaceAll("_", " ")}
                </div>
              </div>

              <div className="mt-7 rounded-xl bg-slate-50 p-4 text-left">
                <p className="text-sm font-semibold text-slate-800">
                  What happens next?
                </p>

                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>
                    1. Your request enters the Sub Admin review queue.
                  </p>
                  <p>
                    2. The team verifies your submitted information.
                  </p>
                  <p>
                    3. If accepted, the commercial offer process begins.
                  </p>
                </div>
              </div>

              <Link
                href="/client/services"
                className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white"
              >
                Explore More Programmes
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  if (!data) {
    return (
      <DashboardShell role="CLIENT">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <FileText className="mx-auto size-10 text-orange-500" />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Request Information Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please complete the information form before opening
            the review page.
          </p>

          <Link
            href="/client/services"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Select Programmes
            <ArrowRight className="size-4" />
          </Link>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="CLIENT">
      <div className="mx-auto max-w-5xl space-y-6">

        <Link
          href="/client/services/information"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="size-4" />
          Edit Information
        </Link>

        {/* HEADER */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-blue-600 p-6 text-white md:p-8">
          <Badge className="border border-white/20 bg-white/15 text-white">
            Final Step · Review
          </Badge>

          <h1 className="mt-4 text-2xl font-bold md:text-3xl">
            Review Your Service Request
          </h1>

          <p className="mt-2 text-sm leading-6 text-indigo-100">
            Please carefully verify all information before submitting
            your request to NLETA.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Badge className="bg-white/15 text-white">
              {data.selectedPrograms.length} Programmes
            </Badge>

            <Badge className="bg-white/15 text-white">
              {data.programRequirements.reduce(
                (sum, item) => sum + (Number(item.participants) || 0),
                0
              )} Participants
            </Badge>
          </div>
        </section>

        {/* ORGANISATION */}
        <Card className="space-y-5 border-indigo-100 p-5 shadow-sm md:p-7">
          <SectionHeader
            icon={Building2}
            title="Organisation Details"
            color="bg-indigo-100 text-indigo-700"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoRow label="Organisation Name" value={data.organisation} />
            <InfoRow label="GSTIN" value={data.gstin} />
            <InfoRow label="Billing Address" value={data.address} />
            <InfoRow label="Country" value={data.country} />
            <InfoRow label="State" value={data.state} />
            <InfoRow label="City" value={data.city} />
          </div>
        </Card>

        {/* CONTACT */}
        <Card className="space-y-5 border-violet-100 p-5 shadow-sm md:p-7">
          <SectionHeader
            icon={UserRound}
            title="Authorised Contact Details"
            color="bg-violet-100 text-violet-700"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoRow label="Contact Person" value={data.contactName} />
            <InfoRow label="Designation" value={data.designation} />
            <InfoRow label="Official Email" value={data.email} />
            <InfoRow label="Mobile Number" value={data.phone} />
          </div>
        </Card>

        {/* PROGRAMMES */}
        <Card className="space-y-5 border-emerald-100 p-5 shadow-sm md:p-7">
          <SectionHeader
            icon={GraduationCap}
            title="Selected Training Programmes"
            color="bg-emerald-100 text-emerald-700"
          />

          <div className="space-y-3">
            {data.selectedPrograms.map((program) => {
              const requirement = data.programRequirements.find(
                (item) => item.code === program.code
              )

              return (
                <div
                  key={program.code}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                        {program.code}
                      </Badge>

                      <h3 className="mt-2 font-semibold text-slate-900">
                        {program.title}
                      </h3>
                    </div>

                    <Badge variant="outline">
                      {program.duration}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <InfoRow
                      label="Participants"
                      value={requirement?.participants}
                    />

                    <InfoRow
                      label="Expected Batches"
                      value={requirement?.batches}
                    />

                    <InfoRow
                      label="Preferred Mode"
                      value={
                        requirement?.mode === "ON"
                          ? "Online"
                          : requirement?.mode === "HY"
                            ? "Hybrid"
                            : "Offline / Onsite"
                      }
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* SCHEDULE */}
        <Card className="space-y-5 border-orange-100 p-5 shadow-sm md:p-7">
          <SectionHeader
            icon={CalendarDays}
            title="Delivery & Schedule"
            color="bg-orange-100 text-orange-700"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoRow label="Preferred Date" value={data.preferredDate} />
            <InfoRow label="Alternate Date" value={data.alternateDate} />
            <InfoRow label="Training Location" value={data.location} />
            <InfoRow label="Preferred Language" value={data.language} />
            <InfoRow label="Training Coordinator" value={data.coordinator} />
          </div>
        </Card>

        {/* ADDITIONAL REQUIREMENTS */}
        <Card className="space-y-5 border-cyan-100 p-5 shadow-sm md:p-7">
          <SectionHeader
            icon={ClipboardList}
            title="Additional Requirements"
            color="bg-cyan-100 text-cyan-700"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoRow label="Venue Facilities" value={data.facilities} />
            <InfoRow
              label="Additional Remarks"
              value={data.additionalRequirements}
            />
            <InfoRow label="Assessment Required" value={data.assessment} />
            <InfoRow label="Refresher Training" value={data.refresher} />
          </div>
        </Card>

        {/* DECLARATION */}
        <Card className="border-amber-200 bg-amber-50/60 p-5 shadow-sm md:p-7">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-amber-700" />

            <div>
              <h3 className="font-bold text-slate-900">
                Request Submission Declaration
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                I confirm that the information provided in this service
                request is accurate and complete to the best of my knowledge.
                I understand that programme delivery, batch planning and
                commercial terms will be reviewed and confirmed by NLETA.
              </p>
            </div>
          </div>
        </Card>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
          <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">

            <Link
              href="/client/services/information"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
              Edit Information
            </Link>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Confirm & Send Request
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

          </div>
        </div>

      </div>
    </DashboardShell>
  )
}
