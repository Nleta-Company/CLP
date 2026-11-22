
"use client"

import { Suspense, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  UserRound,
  GraduationCap,
  CalendarDays,
  MapPin,
  Save,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card } from "@/components/ui/card"

const serviceNames: Record<string, string> = {
  "corporate-safety": "Corporate Safety Training",
  "fire-safety": "Fire Safety Training",
  "workplace-safety": "Workplace Safety Training",
  "industrial-safety": "Industrial Safety Training",
  "chemical-handling": "Chemical Handling Training",
  "employee-awareness": "Employee Safety Awareness",
}

const initialForm = {
  organisation: "",
  address: "",
  gstin: "",
  contactName: "",
  designation: "",
  email: "",
  phone: "",
  programme: "",
  audience: "",
  participants: "",
  mode: "",
  duration: "",
  batches: "",
  location: "",
  preferredDate: "",
  timing: "",
  coordinator: "",
  requirements: "",
}

type FormData = typeof initialForm

export default function ClientServiceInformationPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading service form...</div>}>
      <ServiceInformationForm />
    </Suspense>
  )
}

function ServiceInformationForm() {
  const params = useParams<{ serviceId: string }>()
  const router = useRouter()

  const serviceId = params.serviceId
  const serviceName = serviceNames[serviceId]

  const [form, setForm] = useState<FormData>(initialForm)
  const [error, setError] = useState("")

  function updateField(field: keyof FormData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const requiredFields: (keyof FormData)[] = [
      "organisation",
      "address",
      "contactName",
      "email",
      "phone",
      "programme",
      "audience",
      "participants",
      "mode",
      "location",
    ]

    const missing = requiredFields.some(
      (field) => !form[field].trim()
    )

    if (missing) {
      setError("Please complete all required fields before continuing.")
      return
    }

    sessionStorage.setItem(
      `clp-service-request-${serviceId}`,
      JSON.stringify({
        serviceId,
        serviceName,
        ...form,
      })
    )

    router.push(`/client/services/${serviceId}/review`)
  }

  if (!serviceName) {
    return (
      <DashboardShell role="CLIENT">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold">Service not found</h2>
          <p className="mt-2 text-sm text-slate-500">
            Please select a valid service from the services page.
          </p>
          <Link
            href="/client/services"
            className="mt-5 inline-flex items-center gap-2 text-indigo-600"
          >
            <ArrowLeft className="size-4" />
            Back to Services
          </Link>
        </Card>
      </DashboardShell>
    )
  }

  const inputClass =
    "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"

  const labelClass = "text-sm font-medium text-slate-700"

  return (
    <DashboardShell role="CLIENT">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/client/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="size-4" />
          Back to Services
        </Link>

        <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-violet-700 to-blue-600 p-6 text-white md:p-8">
          <p className="text-sm font-medium text-indigo-100">
            Service Request · Step 2 of 3
          </p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            Service Information
          </h1>
          <p className="mt-2 text-indigo-100">
            Provide your organisation and training requirements.
          </p>
          <div className="mt-5 inline-flex rounded-lg border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold">
            Selected Service: {serviceName}
          </div>
        </div>

        <form onSubmit={handleReview} className="space-y-6">
          <Card className="space-y-5 border-indigo-100 p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                <Building2 className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Organisation Details
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your company information
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Organisation / Company Name *
                <input required className={inputClass} value={form.organisation}
                  onChange={(e) => updateField("organisation", e.target.value)}
                  placeholder="Enter legal company name" />
              </label>

              <label className={labelClass}>
                GSTIN
                <input className={inputClass} value={form.gstin}
                  onChange={(e) => updateField("gstin", e.target.value)}
                  placeholder="Enter GSTIN (if applicable)" />
              </label>

              <label className={`${labelClass} md:col-span-2`}>
                Registered / Billing Address *
                <textarea required rows={3}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Enter complete billing address" />
              </label>
            </div>
          </Card>

          <Card className="space-y-5 border-violet-100 p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
                <UserRound className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Authorised Contact Details
                </h2>
                <p className="text-xs text-slate-500">
                  Primary contact for this training request
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Contact Person Name *
                <input required className={inputClass} value={form.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                  placeholder="Enter full name" />
              </label>

              <label className={labelClass}>
                Designation
                <input className={inputClass} value={form.designation}
                  onChange={(e) => updateField("designation", e.target.value)}
                  placeholder="e.g. HR Manager" />
              </label>

              <label className={labelClass}>
                Email Address *
                <input required type="email" className={inputClass} value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="name@company.com" />
              </label>

              <label className={labelClass}>
                Mobile Number *
                <input required type="tel" className={inputClass} value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Enter mobile number" />
              </label>
            </div>
          </Card>

          <Card className="space-y-5 border-emerald-100 p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Training Requirements
                </h2>
                <p className="text-xs text-slate-500">
                  Tell us about your selected training programme
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Programme / Training Title *
                <input required className={inputClass} value={form.programme}
                  onChange={(e) => updateField("programme", e.target.value)}
                  placeholder="Enter programme name or code" />
              </label>

              <label className={labelClass}>
                Target Audience / Employee Level *
                <input required className={inputClass} value={form.audience}
                  onChange={(e) => updateField("audience", e.target.value)}
                  placeholder="e.g. Technicians, Supervisors" />
              </label>

              <label className={labelClass}>
                Number of Participants *
                <input required type="number" min="1" className={inputClass}
                  value={form.participants}
                  onChange={(e) => updateField("participants", e.target.value)}
                  placeholder="Enter participant count" />
              </label>

              <label className={labelClass}>
                Preferred Delivery Mode *
                <select required className={inputClass} value={form.mode}
                  onChange={(e) => updateField("mode", e.target.value)}>
                  <option value="">Select delivery mode</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </label>

              <label className={labelClass}>
                Preferred Duration
                <input className={inputClass} value={form.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                  placeholder="e.g. 2 days / 8 hours" />
              </label>

              <label className={labelClass}>
                Expected Number of Batches
                <input type="number" min="1" className={inputClass}
                  value={form.batches}
                  onChange={(e) => updateField("batches", e.target.value)}
                  placeholder="Enter number of batches" />
              </label>
            </div>
          </Card>

          <Card className="space-y-5 border-orange-100 p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-orange-100 p-3 text-orange-700">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Schedule & Training Location
                </h2>
                <p className="text-xs text-slate-500">
                  Share your preferred schedule
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Training Location / Platform *
                <input required className={inputClass} value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Enter site address or online platform" />
              </label>

              <label className={labelClass}>
                Preferred Training Date
                <input type="date" className={inputClass}
                  value={form.preferredDate}
                  onChange={(e) => updateField("preferredDate", e.target.value)} />
              </label>

              <label className={labelClass}>
                Preferred Timing / Time Zone
                <input className={inputClass} value={form.timing}
                  onChange={(e) => updateField("timing", e.target.value)}
                  placeholder="e.g. 10 AM – 5 PM IST" />
              </label>

              <label className={labelClass}>
                Client Training Coordinator
                <input className={inputClass} value={form.coordinator}
                  onChange={(e) => updateField("coordinator", e.target.value)}
                  placeholder="Coordinator name / contact" />
              </label>

              <label className={`${labelClass} md:col-span-2`}>
                Additional Requirements / Remarks
                <textarea rows={4}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  value={form.requirements}
                  onChange={(e) => updateField("requirements", e.target.value)}
                  placeholder="Mention any special requirements, language preferences or other details..." />
              </label>
            </div>
          </Card>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
            <Link
              href="/client/services"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>

            <button
              type="submit"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-violet-700"
            >
              Review Information
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}
