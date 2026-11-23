
"use client"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
  XCircle,
  Building2,
  RefreshCw,
  Eye,
} from "lucide-react"

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
import { getRateCardPrice, TtmOption } from "@/lib/clp/rate-card"

type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "REQUEST_ACCEPTED"
  | "REQUEST_REJECTED"
  | "FTO_DRAFT"
  | "FTO_SENT"
  | "FTO_ACCEPTED"
  | "FTO_REJECTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_SUBMITTED"
  | "PAYMENT_VERIFICATION"
  | "PAYMENT_VERIFIED"
  | "PTA_SENT"
  | "PTA_ACCEPTED"
  | "PTA_REJECTED"
  | "PSGA_DRAFT"
  | "PSGA_SENT"
  | "PSGA_ACCEPTED"
  | "PSGA_REJECTED"
  | "TAF_DRAFT"
  | "TAF_SENT"
  | "TAF_ACCEPTED"
  | "TAF_REJECTED"
  | "TRAINER_ASSIGNMENT"
  | "TRAINING"
  | "COMPLETED"
  | "CANCELLED"

interface ProgrammeParticipant {
  id: string
  name: string
  email: string | null
  designation: string
  phone: string | null
}

interface Programme {
  code: string
  title: string
  category: string
  duration: string
  mode: string
  participants: number
  batches: number
  participantsDetails: ProgrammeParticipant[]
}

interface TimelineItem {
  id: string
  status: RequestStatus
  remarks: string | null
  createdAt: string
  actorId: string | null
}

interface PaymentSubmission {
  id: string
  paymentMethod: string
  transactionReference: string
  proofUrl: string | null
  amountPaid: string
  status: "PENDING" | "VERIFIED" | "REJECTED"
  adminRemarks: string | null
  createdAt: string
  submittedBy?: {
    id: string
    name: string
    email: string
  } | null
}

interface PaymentInstallment {
  id: string
  installmentNumber: number
  percentage: string
  amount: string
  milestone: string
  status: string
  submissions: PaymentSubmission[]
}

interface FinalTrainingOfferPayment {
  id: string
  ftoNumber: string
  grandTotal: string
  paymentTerm: string | null
  paymentInstallments: PaymentInstallment[]
}

interface ServiceRequest {
  id: string
  requestNumber: string
  status: RequestStatus
  createdAt: string
  submittedAt: string | null

  client: {
    id: string
    name: string
    email: string
  } | null

  organisation: string
  gstin: string | null
  billingAddress: string | null
  country: string | null
  state: string | null
  city: string | null
  contactName: string | null
  designation: string | null
  email: string
  phone: string | null

  preferredDate: string | null
  alternateDate: string | null
  trainingLocation: string | null
  preferredLanguage: string | null
  coordinator: string | null
  facilities: string | null
  assessment: string | null
  refresher: string | null
  additionalRequirements: string | null

  programmes: Programme[]
  totalParticipants: number
  timeline: TimelineItem[]
  finalTrainingOffer?: FinalTrainingOfferPayment | null
}

interface ServiceRequestDetailClientProps {
  id: string
}

const statusLabels: Record<RequestStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  REQUEST_ACCEPTED: "Request Accepted",
  REQUEST_REJECTED: "Request Rejected",
  FTO_DRAFT: "FTO Draft",
  FTO_SENT: "FTO Sent",
  FTO_ACCEPTED: "FTO Accepted",
  FTO_REJECTED: "FTO Rejected",
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_SUBMITTED: "Payment Submitted",
  PAYMENT_VERIFICATION: "Payment Verification",
  PAYMENT_VERIFIED: "Payment Verified",
  PTA_SENT: "PTA Sent",
  PTA_ACCEPTED: "PTA Accepted",
  PTA_REJECTED: "PTA Rejected",
  PSGA_DRAFT: "PSGA Draft",
  PSGA_SENT: "PSGA Sent",
  PSGA_ACCEPTED: "PSGA Accepted",
  PSGA_REJECTED: "PSGA Rejected",
  TAF_DRAFT: "TAF Draft",
  TAF_SENT: "TAF Sent",
  TAF_ACCEPTED: "TAF Accepted",
  TAF_REJECTED: "TAF Rejected",
  TRAINER_ASSIGNMENT: "Trainer Assignment",
  TRAINING: "Training",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not provided"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not available"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusStyle(status: RequestStatus) {
  if (
    status === "REQUEST_ACCEPTED" ||
    status === "FTO_ACCEPTED" ||
    status === "PAYMENT_VERIFIED" ||
    status === "PSGA_ACCEPTED" ||
    status === "TAF_ACCEPTED" ||
    status === "COMPLETED"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (
    status === "REQUEST_REJECTED" ||
    status === "FTO_REJECTED" ||
    status === "PSGA_REJECTED" ||
    status === "TAF_REJECTED" ||
    status === "CANCELLED"
  ) {
    return "border-rose-200 bg-rose-50 text-rose-700"
  }

  return "border-amber-200 bg-amber-50 text-amber-700"
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string | null | undefined
  icon?: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-start gap-2">
        {icon && (
          <span className="mt-0.5 shrink-0 text-indigo-500">
            {icon}
          </span>
        )}

        <p className="break-words text-sm font-medium leading-5 text-slate-900">
          {value?.trim() || "Not provided"}
        </p>
      </div>
    </div>
  )
}

export default function ServiceRequestDetailClient({
  id,
}: ServiceRequestDetailClientProps) {
  const [requestData, setRequestData] =
    useState<ServiceRequest | null>(null)

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [remarks, setRemarks] = useState("")
  const [showRejectBox, setShowRejectBox] = useState(false)
  const [showFtoForm, setShowFtoForm] = useState(false)
  const [ftoLoading, setFtoLoading] = useState(false)
  const [ftoSaving, setFtoSaving] = useState(false)
  const [pdfDownloading, setPdfDownloading] = useState(false)
  const [ftoSending, setFtoSending] = useState(false)
  const [existingFto, setExistingFto] = useState<any>(null)
  const [ttmOptions, setTtmOptions] = useState<Record<string, TtmOption>>({})
  const [pricingPreview, setPricingPreview] = useState<any[]>([])
  const [logisticsCharges, setLogisticsCharges] = useState("0")
  const [otherCharges, setOtherCharges] = useState("0")
  const [gstPercent, setGstPercent] = useState("18")
  const [validUntil, setValidUntil] = useState("")
  const [jurisdiction, setJurisdiction] = useState("India")
  const [terms, setTerms] = useState("")
  const [specialRemarks, setSpecialRemarks] = useState("")
  const [clientPoNumber, setClientPoNumber] = useState("")
  const [confirmedTrainingSchedule, setConfirmedTrainingSchedule] = useState("")
  const [dailyTrainingTiming, setDailyTrainingTiming] = useState("")
  const [paymentTerm, setPaymentTerm] = useState<"FULL" | "HALF_HALF" | "HALF_QUARTER_QUARTER" | "">("")
  const [paymentMilestones, setPaymentMilestones] = useState("")
  const [logisticsTreatment, setLogisticsTreatment] = useState("")
  const [pdfViewing, setPdfViewing] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [ptaData, setPtaData] = useState<any>(null)
  const [ptaLoading, setPtaLoading] = useState(false)
  const [ptaGenerating, setPtaGenerating] = useState(false)
  const [ptaError, setPtaError] = useState("")
  const [ptaEffectiveDate, setPtaEffectiveDate] = useState("")
  const [ptaPdfLoading, setPtaPdfLoading] = useState(false)
  const [ptaSending, setPtaSending] = useState(false)

  // TAF agreement state
  const [tafData, setTafData] = useState<any>(null)
  const [tafLoading, setTafLoading] = useState(false)
  const [tafGenerating, setTafGenerating] = useState(false)
  const [tafSending, setTafSending] = useState(false)
  const [tafError, setTafError] = useState("")
  const [tafPdfBlob, setTafPdfBlob] = useState<Blob | null>(null)
  const [tafPdfLoading, setTafPdfLoading] = useState(false)
  const [tafPdfViewing, setTafPdfViewing] = useState(false)

  const [paymentReviewLoading, setPaymentReviewLoading] = useState(false)
  const [paymentReviewRemarks, setPaymentReviewRemarks] = useState<Record<string, string>>({})

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(
        `/api/sub-admin/requests/${id}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load request details."
        )
      }

      setRequestData(result.request)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading the request."
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  const loadFTO = useCallback(async () => {
    try {
      setFtoLoading(true)
      const response = await fetch(`/api/sub-admin/requests/${id}/fto`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load FTO.")
      }
      setExistingFto(result.fto || null)
      setPricingPreview(result.pricingPreview || [])
    } catch (err) {
      console.error("FTO load error:", err)
    } finally {
      setFtoLoading(false)
    }
  }, [id])

  const loadPTA = useCallback(async () => {
    try {
      setPtaLoading(true)
      setPtaError("")

      const response = await fetch(`/api/sub-admin/requests/${id}/pta`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load PTA status.")
      }

      setPtaData(result)
    } catch (err) {
      setPtaError(
        err instanceof Error ? err.message : "Unable to load PTA status."
      )
    } finally {
      setPtaLoading(false)
    }
  }, [id])

  const loadTAF = useCallback(async () => {
    try {
      setTafLoading(true)
      setTafError("")

      const response = await fetch(`/api/sub-admin/requests/${id}/taf`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load TAF status.")
      }

      setTafData(result)
    } catch (err) {
      setTafError(
        err instanceof Error ? err.message : "Unable to load TAF status."
      )
    } finally {
      setTafLoading(false)
    }
  }, [id])

  async function generateTAF() {
    if (tafGenerating) return

    try {
      setTafGenerating(true)
      setTafError("")
      setActionMessage("")

      const response = await fetch(`/api/sub-admin/requests/${id}/taf`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to generate TAF.")
      }

      setActionMessage(result.message || "TAF generated successfully.")
      setTafPdfBlob(null)
      await loadTAF()
      await loadRequest()
    } catch (err) {
      setTafError(
        err instanceof Error ? err.message : "Unable to generate TAF."
      )
    } finally {
      setTafGenerating(false)
    }
  }

  async function sendTAFToClient() {
    if (tafSending) return

    if (!tafData?.taf) {
      setTafError("Please generate the TAF first.")
      return
    }

    if (tafData.taf.status !== "GENERATED") {
      setTafError("Only a generated TAF can be marked as sent.")
      return
    }

    const confirmed = window.confirm(
      "Are you sure you want to mark this TAF as sent to the client? This updates the document status only; no email will be sent."
    )
    if (!confirmed) return

    try {
      setTafSending(true)
      setTafError("")
      setActionMessage("")

      const response = await fetch(`/api/sub-admin/requests/${id}/taf`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to send TAF to client.")
      }

      setActionMessage(result.message || "TAF marked as sent to client.")
      setTafPdfBlob(null)
      await loadTAF()
      await loadRequest()
    } catch (err) {
      setTafError(
        err instanceof Error ? err.message : "Unable to send TAF to client."
      )
    } finally {
      setTafSending(false)
    }
  }

  async function generatePTA() {
    if (ptaGenerating) return

    try {
      setPtaGenerating(true)
      setActionMessage("")
      setPtaError("")

      const response = await fetch(`/api/sub-admin/requests/${id}/pta`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to generate PTA.")
      }

      setActionMessage(result.message || "PTA record generated successfully.")
      await loadPTA()
    } catch (err) {
      setPtaError(
        err instanceof Error ? err.message : "Unable to generate PTA."
      )
    } finally {
      setPtaGenerating(false)
    }
  }

  async function handlePTAPdf(action: "preview" | "download") {
    if (!ptaData?.pta || !ptaEffectiveDate || ptaPdfLoading) return

    // Open the preview tab immediately so the browser does not block it.
    const previewWindow = action === "preview" ? window.open("about:blank", "_blank") : null

    if (action === "preview" && !previewWindow) {
      setPtaError("Please allow pop-ups for this website to preview the PTA.")
      return
    }

    try {
      setPtaPdfLoading(true)
      setPtaError("")

      const endpoint = `/api/sub-admin/requests/${id}/pta/pdf${action === "download" ? "?download=1" : ""}`
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ effectiveDate: ptaEffectiveDate }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.message || "Unable to generate PTA PDF.")
      }

      const pdfBlob = await response.blob()
      const pdfUrl = URL.createObjectURL(pdfBlob)

      if (action === "preview") {
        if (previewWindow) previewWindow.location.href = pdfUrl
      } else {
        const link = document.createElement("a")
        link.href = pdfUrl
        link.download = `${ptaData.pta.ptaNumber.replace(/\//g, "-")}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
      }

      // Keep the blob URL alive while the browser tab/download consumes it.
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000)
    } catch (err) {
      if (previewWindow && !previewWindow.closed) previewWindow.close()
      setPtaError(
        err instanceof Error ? err.message : "Unable to generate PTA PDF."
      )
    } finally {
      setPtaPdfLoading(false)
    }
  }

  async function sendPTAToClient() {
    if (ptaSending) return

    if (!ptaData?.pta) {
      setPtaError("Please generate the PTA first.")
      return
    }

    if (ptaData.pta.status !== "GENERATED") {
      setPtaError("Only a generated PTA can be marked as sent.")
      return
    }

    if (!ptaEffectiveDate && !ptaData.pta.effectiveDate) {
      setPtaError("Please select the agreement effective date first.")
      return
    }

    const confirmed = window.confirm(
      "Are you sure you want to mark this PTA as sent to the client? This will update the document status only; no email will be sent."
    )
    if (!confirmed) return

    try {
      setPtaSending(true)
      setPtaError("")
      setActionMessage("")

      const response = await fetch(`/api/sub-admin/requests/${id}/pta`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update PTA status.")
      }

      setActionMessage(result.message || "PTA status updated to Sent successfully.")
      await loadPTA()
      await loadRequest()
    } catch (err) {
      setPtaError(
        err instanceof Error ? err.message : "Unable to update PTA status."
      )
    } finally {
      setPtaSending(false)
    }
  }

  useEffect(() => {
    loadRequest()
    loadFTO()
    loadPTA()
    loadTAF()
  }, [loadRequest, loadFTO, loadPTA, loadTAF])

  async function createFTO() {
    if (ftoSaving) return
    if (!paymentTerm) {
      setActionMessage("Please select a payment term before creating the FTO.")
      return
    }
    const missingTtmOption = (requestData?.programmes || []).some(
      (programme) => programme.code.startsWith("TTM-") && !ttmOptions[programme.code]
    )
    if (missingTtmOption) {
      setActionMessage("Please select Option 1 or Option 2 for every TTM programme.")
      return
    }

    try {
      setFtoSaving(true)
      setActionMessage("")
      const response = await fetch(`/api/sub-admin/requests/${id}/fto`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ttmOptions,
          logisticsCharges: Number(logisticsCharges),
          otherCharges: Number(otherCharges),
          gstPercent: Number(gstPercent),
          validUntil: validUntil || null,
          jurisdiction,
          terms,
          specialRemarks,
          clientPoNumber,
          confirmedTrainingSchedule,
          dailyTrainingTiming,
          paymentTerm,
          paymentMilestones,
          logisticsTreatment,
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create FTO.")
      }
      setExistingFto(result.fto)
      setShowFtoForm(false)
      setActionMessage(result.message || "FTO draft created successfully.")
      await loadRequest()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Unable to create FTO.")
    } finally {
      setFtoSaving(false)
    }
  }


  async function sendFTOToClient() {
    if (ftoSending) return

    if (!existingFto) {
      setActionMessage("Please create the FTO draft first.")
      return
    }
    if (requestData?.status !== "FTO_DRAFT") {
      setActionMessage("Only an FTO draft can be sent to the client.")
      return
    }
    if (!jurisdiction.trim()) {
      setActionMessage("Please enter the jurisdiction before sending the FTO.")
      return
    }
    if (!existingFto.validUntil) {
      setActionMessage("Please set the FTO validity date before sending.")
      return
    }

    const validityDate = new Date(existingFto.validUntil)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    validityDate.setHours(0, 0, 0, 0)
    if (validityDate < today) {
      setActionMessage("The FTO validity date has expired. Please update the draft before sending.")
      return
    }

    try {
      setFtoSending(true)
      setActionMessage("")
      const response = await fetch(`/api/sub-admin/requests/${id}/fto`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to send FTO to client.")
      }
      setActionMessage(result.message || "FTO successfully sent to the client.")
      setPdfBlob(null)
      await loadRequest()
      await loadFTO()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Unable to send FTO to client.")
    } finally {
      setFtoSending(false)
    }
  }

  // Reuse the same PDF in this page session so View and Download do not
  // trigger repeated server-side PDF rendering.
  async function getFtoPdfBlob(): Promise<Blob> {
    if (pdfBlob) return pdfBlob

    const response = await fetch(`/api/sub-admin/requests/${id}/fto/pdf`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let message = "Unable to generate FTO PDF."

      if (contentType?.includes("application/json")) {
        const result = await response.json()
        message = result.message || message
      }

      throw new Error(message)
    }

    const blob = await response.blob()
    if (blob.type !== "application/pdf") {
      throw new Error("Server did not return a valid PDF.")
    }

    setPdfBlob(blob)
    return blob
  }

  async function downloadFtoPdf() {
    if (pdfDownloading) return

    try {
      setPdfDownloading(true)
      setActionMessage("")

      const blob = await getFtoPdfBlob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${existingFto?.ftoNumber || "NLETA-FTO"}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60000)

      setActionMessage("FTO PDF downloaded successfully.")
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to download FTO PDF."
      )
    } finally {
      setPdfDownloading(false)
    }
  }

  async function viewFtoPdf() {
    if (pdfViewing) return

    // Open immediately on click; show progress instead of a blank about:blank tab.
    const previewWindow = window.open("about:blank", "_blank")
    if (!previewWindow) {
      setActionMessage("Please allow pop-ups to view the FTO PDF.")
      return
    }

    previewWindow.document.title = "Preparing NLETA FTO PDF"
    previewWindow.document.body.innerHTML = `
      <div style="font-family:Arial,sans-serif;display:flex;min-height:90vh;align-items:center;justify-content:center;color:#173f68;text-align:center">
        <div><h2 style="margin-bottom:8px">Preparing your FTO PDF...</h2>
        <p style="color:#64748b">Please wait. The document will open automatically.</p></div>
      </div>`

    try {
      setPdfViewing(true)
      setActionMessage("")

      const blob = await getFtoPdfBlob()
      const url = window.URL.createObjectURL(blob)
      previewWindow.location.replace(url)

      // Keep the object URL alive while the browser PDF viewer is using it.
      window.setTimeout(() => window.URL.revokeObjectURL(url), 5 * 60 * 1000)
      setActionMessage("FTO PDF opened successfully.")
    } catch (err) {
      previewWindow.close()
      setActionMessage(
        err instanceof Error ? err.message : "Unable to open FTO PDF."
      )
    } finally {
      setPdfViewing(false)
    }
  }


  // Generate once per page session and reuse for preview/download.
  async function getTafPdfBlob(): Promise<Blob> {
    if (tafPdfBlob) return tafPdfBlob

    const response = await fetch(`/api/sub-admin/requests/${id}/taf/pdf`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let message = "Unable to generate TAF PDF."
      if (contentType?.includes("application/json")) {
        const result = await response.json()
        message = result.message || message
      }
      throw new Error(message)
    }

    const blob = await response.blob()
    if (blob.type !== "application/pdf") {
      throw new Error("Server did not return a valid PDF.")
    }

    setTafPdfBlob(blob)
    return blob
  }

  async function downloadTafPdf() {
    if (tafPdfLoading) return
    try {
      setTafPdfLoading(true)
      setActionMessage("")
      const blob = await getTafPdfBlob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${tafData?.taf?.tafNumber || "NLETA-TAF"}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60000)
      setActionMessage("TAF PDF downloaded successfully.")
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Unable to download TAF PDF.")
    } finally {
      setTafPdfLoading(false)
    }
  }

  async function viewTafPdf() {
    if (tafPdfViewing) return
    const previewWindow = window.open("about:blank", "_blank")
    if (!previewWindow) {
      setActionMessage("Please allow pop-ups to view the TAF PDF.")
      return
    }
    previewWindow.document.title = "Preparing NLETA TAF PDF"
    previewWindow.document.body.innerHTML = `<div style="font-family:Arial,sans-serif;display:flex;min-height:90vh;align-items:center;justify-content:center;color:#173f68;text-align:center"><div><h2>Preparing your TAF PDF...</h2><p style="color:#64748b">Please wait. The document will open automatically.</p></div></div>`
    try {
      setTafPdfViewing(true)
      setActionMessage("")
      const blob = await getTafPdfBlob()
      const url = window.URL.createObjectURL(blob)
      previewWindow.location.replace(url)
      window.setTimeout(() => window.URL.revokeObjectURL(url), 5 * 60 * 1000)
      setActionMessage("TAF PDF opened successfully.")
    } catch (err) {
      previewWindow.close()
      setActionMessage(err instanceof Error ? err.message : "Unable to open TAF PDF.")
    } finally {
      setTafPdfViewing(false)
    }
  }

  async function viewPaymentReceipt(
    installmentId: string,
    submissionId: string
  ) {
    // Open the tab immediately during the click so the browser does not block it
    // after the asynchronous API request completes.
    const receiptWindow = window.open("about:blank", "_blank")

    if (!receiptWindow) {
      setActionMessage("Please allow pop-ups to view the payment receipt.")
      return
    }

    try {
      setActionMessage("Opening payment receipt...")

      receiptWindow.document.title = "Opening Payment Receipt"
      receiptWindow.document.body.textContent = "Loading payment receipt..."

      const response = await fetch(
        `/api/sub-admin/requests/${id}/payments/${installmentId}/receipt?submissionId=${encodeURIComponent(submissionId)}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      )

      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.success || !result?.signedUrl) {
        throw new Error(
          result?.message || "Unable to open payment receipt."
        )
      }

      receiptWindow.location.replace(result.signedUrl)
      setActionMessage("Payment receipt opened successfully.")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to open payment receipt."

      if (!receiptWindow.closed) {
        receiptWindow.document.title = "Unable to Open Payment Receipt"
        receiptWindow.document.body.textContent = message
      }

      setActionMessage(message)
    }
  }

  async function reviewPayment(
    installmentId: string,
    submissionId: string,
    action: "VERIFY" | "REJECT"
  ) {
    if (paymentReviewLoading) return

    const reviewRemarks = paymentReviewRemarks[submissionId]?.trim() || ""

    if (action === "REJECT" && reviewRemarks.length < 10) {
      setActionMessage("Please enter a rejection reason of at least 10 characters.")
      return
    }

    const confirmed = window.confirm(
      action === "VERIFY"
        ? "Confirm that you checked the bank/UPI transaction and want to verify this payment?"
        : "Are you sure you want to reject this payment?"
    )
    if (!confirmed) return

    try {
      setPaymentReviewLoading(true)
      setActionMessage("")

      const response = await fetch(
        `/api/sub-admin/requests/${id}/payments/${installmentId}/review`,
        {
          method: "PATCH",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId,
            action,
            remarks: reviewRemarks,
          }),
        }
      )

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to review payment.")
      }

      setActionMessage(result.message || "Payment review completed.")
      setPaymentReviewRemarks((previous) => ({
        ...previous,
        [submissionId]: "",
      }))
      await loadRequest()
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to review payment."
      )
    } finally {
      setPaymentReviewLoading(false)
    }
  }

  async function updateRequestStatus(
    status: "UNDER_REVIEW" | "REQUEST_ACCEPTED" | "REQUEST_REJECTED"
  ) {
    if (actionLoading) return

    if (status === "REQUEST_REJECTED" && !remarks.trim()) {
      setActionMessage("Please enter remarks before rejecting the request.")
      return
    }

    try {
      setActionLoading(true)
      setActionMessage("")

      const response = await fetch(
        `/api/sub-admin/requests/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status,
            remarks: remarks.trim(),
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update request status."
        )
      }

      setActionMessage(result.message)
      setRemarks("")
      setShowRejectBox(false)

      await loadRequest()
    } catch (err) {
      setActionMessage(
        err instanceof Error
          ? err.message
          : "Unable to update request."
      )
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
        <div className="space-y-5">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
        </div>
    )
  }

  if (error || !requestData) {
    return (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <XCircle className="size-10 text-rose-500" />
            <p className="font-medium text-slate-800">
              {error || "Request not found."}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadRequest}>
                <RefreshCw className="mr-2 size-4" />
                Try Again
              </Button>
              <Link
                href="/sub-admin/requests"
                className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Back to Requests
              </Link>
            </div>
          </CardContent>
        </Card>
    )
  }

  const status = requestData.status

  const canStartReview = status === "SUBMITTED"
  const canDecide =
    status === "UNDER_REVIEW"

  const requestAccepted =
    status === "REQUEST_ACCEPTED" ||
    status.startsWith("FTO_") ||
    status.startsWith("PAYMENT_") ||
    status.startsWith("PSGA_") ||
    status.startsWith("TAF_") ||
    status === "TRAINER_ASSIGNMENT" ||
    status === "TRAINING" ||
    status === "COMPLETED"

  const programmes = requestData.programmes || []
  const timeline = requestData.timeline || []

  const location = [
    requestData.trainingLocation,
    requestData.city,
    requestData.state,
    requestData.country,
  ]
    .filter(Boolean)
    .join(", ")

  const address = [
    requestData.billingAddress,
    requestData.city,
    requestData.state,
    requestData.country,
  ]
    .filter(Boolean)
    .join(", ")

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <Link
              href="/sub-admin/requests"
              className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to service requests</span>
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-indigo-600">
                  Service Request
                </p>

                <Badge className={getStatusStyle(status)}>
                  {statusLabels[status] || status}
                </Badge>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {requestData.requestNumber}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Review and process the client service request.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadRequest}>
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>

          </div>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${actionMessage.toLowerCase().includes("successfully")
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
          >
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <p>{actionMessage}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Building2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Client
                  </p>
                  <p className="mt-1 truncate font-semibold text-slate-900">
                    {requestData.organisation || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <GraduationCap className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Programmes
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {programmes.length} Selected
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Users className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Participants
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {requestData.totalParticipants} Employees
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CalendarDays className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Preferred Date
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(requestData.preferredDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <User className="size-5" />
                  </div>
                  <div>
                    <CardTitle>Client Information</CardTitle>
                    <CardDescription>
                      Primary client and coordination details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-5 md:grid-cols-2">
                  <InfoItem
                    label="Organisation"
                    value={requestData.organisation}
                  />
                  <InfoItem
                    label="Registered Client"
                    value={requestData.client?.name}
                  />
                  <InfoItem
                    label="Contact Person"
                    value={requestData.contactName}
                  />
                  <InfoItem
                    label="Designation"
                    value={requestData.designation}
                  />
                  <InfoItem
                    label="Email"
                    value={requestData.email}
                    icon={<Mail className="size-4" />}
                  />
                  <InfoItem
                    label="Phone"
                    value={requestData.phone}
                    icon={<Phone className="size-4" />}
                  />
                  <InfoItem
                    label="GSTIN"
                    value={requestData.gstin}
                  />
                  <InfoItem
                    label="Billing Address"
                    value={address}
                    icon={<MapPin className="size-4" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Training Requirements */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <GraduationCap className="size-5" />
                  </div>
                  <div>
                    <CardTitle>Training Requirements</CardTitle>
                    <CardDescription>
                      Programmes and requested training coverage
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Selected Programmes
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {programmes.length} programme(s) selected by the client.
                  </p>
                </div>

                {programmes.length > 0 ? (
                  <div className="space-y-3">
                    {programmes.map((programme) => (
                      <div
                        key={programme.code}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-medium text-indigo-600">
                              {programme.code}
                            </p>
                            <h3 className="mt-1 font-semibold text-slate-900">
                              {programme.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {programme.category}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {programme.mode || "Mode not specified"}
                          </Badge>
                        </div>

                        <Separator className="my-3" />

                        <div className="grid gap-3 sm:grid-cols-3">
                          <InfoItem
                            label="Duration"
                            value={programme.duration}
                          />
                          <InfoItem
                            label="Participants"
                            value={String(programme.participants)}
                          />
                          <InfoItem
                            label="Expected Batches"
                            value={String(programme.batches)}
                          />
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">
                                Participant Details
                              </h4>
                              <p className="mt-1 text-xs text-slate-500">
                                Individual participant information submitted by the client
                              </p>
                            </div>
                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                              {programme.participantsDetails?.length ?? 0} / {programme.participants} saved
                            </Badge>
                          </div>

                          {programme.participantsDetails?.length ? (
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                              <table className="w-full min-w-[650px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                  <tr>
                                    <th className="px-4 py-3 font-semibold">#</th>
                                    <th className="px-4 py-3 font-semibold">Full Name</th>
                                    <th className="px-4 py-3 font-semibold">Email ID</th>
                                    <th className="px-4 py-3 font-semibold">Designation</th>
                                    <th className="px-4 py-3 font-semibold">Mobile Number</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {programme.participantsDetails.map((participant, index) => (
                                    <tr key={participant.id} className="bg-white">
                                      <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                                      <td className="px-4 py-3 font-medium text-slate-900">{participant.name}</td>
                                      <td className="px-4 py-3 text-slate-600">{participant.email || "Not provided"}</td>
                                      <td className="px-4 py-3 text-slate-600">{participant.designation}</td>
                                      <td className="px-4 py-3 text-slate-600">{participant.phone || "Not provided"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/60 px-4 py-5 text-center">
                              <Users className="mx-auto size-5 text-amber-600" />
                              <p className="mt-2 text-sm font-medium text-slate-700">
                                No individual participant details saved
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Expected participant count: {programme.participants}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No programme information available.
                  </p>
                )}

                <div className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                  <InfoItem
                    label="Preferred Training Date"
                    value={formatDate(requestData.preferredDate)}
                  />
                  <InfoItem
                    label="Alternate Training Date"
                    value={formatDate(requestData.alternateDate)}
                  />
                  <InfoItem
                    label="Training Location"
                    value={location}
                  />
                  <InfoItem
                    label="Preferred Language"
                    value={requestData.preferredLanguage}
                  />
                  <InfoItem
                    label="Coordinator"
                    value={requestData.coordinator}
                  />
                  <InfoItem
                    label="Facilities"
                    value={requestData.facilities}
                  />
                  <InfoItem
                    label="Assessment Required"
                    value={requestData.assessment}
                  />
                  <InfoItem
                    label="Refresher Training"
                    value={requestData.refresher}
                  />
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Additional Requirements
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-amber-800">
                    {requestData.additionalRequirements?.trim() ||
                      "No additional requirements provided."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            {requestData.finalTrainingOffer?.paymentInstallments &&
              requestData.finalTrainingOffer.paymentInstallments.length > 0 && (
                <Card className="border-blue-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <FileCheck2 className="size-5" />
                      </div>
                      <div>
                        <CardTitle>Payment Details</CardTitle>
                        <CardDescription>
                          Client payment submissions and receipt verification
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <InfoItem
                          label="FTO Number"
                          value={requestData.finalTrainingOffer.ftoNumber}
                        />
                        <InfoItem
                          label="Payment Term"
                          value={requestData.finalTrainingOffer.paymentTerm?.replaceAll("_", " ")}
                        />
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">FTO Grand Total</p>
                        <p className="mt-1 text-xl font-bold text-blue-700">
                          ₹{Number(requestData.finalTrainingOffer.grandTotal).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {requestData.finalTrainingOffer.paymentInstallments.map((installment) => (
                      <div key={installment.id} className="space-y-3 rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Installment {installment.installmentNumber}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {installment.percentage}% · {installment.milestone.replaceAll("_", " ")}
                            </p>
                          </div>
                          <Badge className={
                            installment.status === "VERIFIED"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : installment.status === "SUBMITTED"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                          }>
                            {installment.status.replaceAll("_", " ")}
                          </Badge>
                        </div>

                        <p className="text-lg font-bold text-slate-900">
                          ₹{Number(installment.amount).toLocaleString("en-IN")}
                        </p>

                        {installment.submissions.length === 0 ? (
                          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                            Client has not submitted payment for this installment.
                          </p>
                        ) : (
                          installment.submissions.map((submission) => (
                            <div key={submission.id} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-semibold text-slate-800">Payment Submission</p>
                                <Badge className={
                                  submission.status === "VERIFIED"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : submission.status === "REJECTED"
                                      ? "border-rose-200 bg-rose-50 text-rose-700"
                                      : "border-amber-200 bg-amber-50 text-amber-700"
                                }>
                                  {submission.status}
                                </Badge>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <InfoItem label="Submitted By" value={submission.submittedBy?.name} />
                                <InfoItem label="Client Email" value={submission.submittedBy?.email} />
                                <InfoItem label="Payment Method" value={submission.paymentMethod} />
                                <InfoItem label="Transaction Reference" value={submission.transactionReference} />
                                <InfoItem label="Amount Paid" value={`₹${Number(submission.amountPaid).toLocaleString("en-IN")}`} />
                                <InfoItem label="Submitted On" value={formatDateTime(submission.createdAt)} />
                              </div>

                              {submission.adminRemarks && (
                                <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                                  <strong>Review Remarks:</strong> {submission.adminRemarks}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {submission.proofUrl && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => viewPaymentReceipt(installment.id, submission.id)}
                                    className="w-full sm:w-auto"
                                  >
                                    <Eye className="mr-2 size-4" />
                                    View Payment Receipt
                                  </Button>
                                )}
                              </div>

                              {submission.status === "PENDING" && (
                                <div className="space-y-3 border-t border-slate-200 pt-4">
                                  <div>
                                    <label
                                      htmlFor={`payment-review-${submission.id}`}
                                      className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                      Review Remarks
                                      <span className="ml-1 font-normal text-slate-400">
                                        (optional for verification, required for rejection)
                                      </span>
                                    </label>
                                    <textarea
                                      id={`payment-review-${submission.id}`}
                                      value={paymentReviewRemarks[submission.id] || ""}
                                      onChange={(event) =>
                                        setPaymentReviewRemarks((previous) => ({
                                          ...previous,
                                          [submission.id]: event.target.value,
                                        }))
                                      }
                                      maxLength={1000}
                                      rows={3}
                                      placeholder="Enter verification notes or reason for rejection..."
                                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      type="button"
                                      disabled={paymentReviewLoading}
                                      onClick={() =>
                                        reviewPayment(installment.id, submission.id, "VERIFY")
                                      }
                                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                      <CheckCircle2 className="mr-2 size-4" />
                                      {paymentReviewLoading ? "Processing..." : "Verify Payment"}
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="outline"
                                      disabled={paymentReviewLoading}
                                      onClick={() =>
                                        reviewPayment(installment.id, submission.id, "REJECT")
                                      }
                                      className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                    >
                                      <XCircle className="mr-2 size-4" />
                                      Reject Payment
                                    </Button>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    Verify only after confirming the transaction in the bank or UPI account. A receipt upload alone is not proof of cleared funds.
                                  </p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            {/* PTA Agreement */}
            <Card className="border-violet-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                      <FileCheck2 className="size-5" />
                    </div>
                    <div>
                      <CardTitle>PTA-01 Professional Training Agreement</CardTitle>
                      <CardDescription>
                        Generate the agreement after verification of the first payment installment.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {ptaLoading ? (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                      <RefreshCw className="size-4 animate-spin" />
                      Checking PTA eligibility...
                    </div>
                  ) : ptaError ? (
                    <div className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
                      <p className="text-sm text-rose-700">{ptaError}</p>
                      <Button type="button" variant="outline" onClick={loadPTA}>
                        <RefreshCw className="mr-2 size-4" />
                        Retry
                      </Button>
                    </div>
                  ) : ptaData?.pta ? (
                    <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            PTA Number
                          </p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {ptaData.pta.ptaNumber}
                          </p>
                        </div>
                        <Badge className={
                          ptaData.pta.status === "SENT"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }>
                          {ptaData.pta.status || "GENERATED"}
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <InfoItem
                          label="Generated On"
                          value={formatDateTime(ptaData.pta.generatedAt)}
                        />
                        <InfoItem
                          label="Document Status"
                          value={ptaData.pta.status === "SENT" ? "Sent to Client" : "Generated - Not Sent"}
                        />
                      </div>
                      <div className="space-y-3 rounded-lg border border-violet-200 bg-white p-4">
                        <div>
                          <label htmlFor="pta-effective-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                            Agreement Effective Date
                          </label>
                          <input
                            id="pta-effective-date"
                            type="date"
                            value={ptaEffectiveDate || (ptaData.pta.effectiveDate ? new Date(ptaData.pta.effectiveDate).toISOString().slice(0, 10) : "")}
                            onChange={(event) => setPtaEffectiveDate(event.target.value)}
                            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                          />
                          <p className="mt-1 text-xs text-slate-500">
                            Select the date on which this agreement becomes effective.
                          </p>
                          <p className="mt-1 text-xs text-amber-700">
                            Mark as Sent updates the PTA status only. It does not send an email to the client.
                          </p>
                        </div>
                        <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          <span className="font-medium text-slate-800">Court Jurisdiction:</span> Ghaziabad, Uttar Pradesh, India
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            onClick={() => handlePTAPdf("preview")}
                            disabled={!ptaEffectiveDate && !ptaData.pta.effectiveDate || ptaPdfLoading}
                            className="bg-violet-600 text-white hover:bg-violet-700"
                          >
                            {ptaPdfLoading ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Eye className="mr-2 size-4" />}
                            Preview PTA
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handlePTAPdf("download")}
                            disabled={!ptaEffectiveDate && !ptaData.pta.effectiveDate || ptaPdfLoading}
                          >
                            <FileText className="mr-2 size-4" />
                            Download PDF
                          </Button>
                          {ptaData.pta.status === "GENERATED" && (
                            <Button
                              type="button"
                              onClick={sendPTAToClient}
                              disabled={
                                ptaSending ||
                                ptaPdfLoading ||
                                (!ptaEffectiveDate && !ptaData.pta.effectiveDate)
                              }
                              className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              {ptaSending ? (
                                <RefreshCw className="mr-2 size-4 animate-spin" />
                              ) : (
                                <Mail className="mr-2 size-4" />
                              )}
                              {ptaSending ? "Updating Status..." : "Sent to client"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className={`rounded-lg border p-4 ${
                        ptaData?.firstPaymentVerified
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-amber-200 bg-amber-50"
                      }`}>
                        <div className="flex items-center gap-2">
                          {ptaData?.firstPaymentVerified ? (
                            <CheckCircle2 className="size-5 text-emerald-600" />
                          ) : (
                            <Clock3 className="size-5 text-amber-600" />
                          )}
                          <p className={`text-sm font-semibold ${
                            ptaData?.firstPaymentVerified ? "text-emerald-800" : "text-amber-800"
                          }`}>
                            {ptaData?.firstPaymentVerified
                              ? "First installment payment verified"
                              : "First installment payment verification pending"}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {ptaData?.firstPaymentVerified
                            ? "You can now generate the PTA-01 agreement."
                            : "Verify the first installment payment before generating the PTA-01 agreement."}
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={generatePTA}
                        disabled={!ptaData?.canGenerate || ptaGenerating}
                        className="bg-violet-600 text-white hover:bg-violet-700"
                      >
                        {ptaGenerating ? (
                          <RefreshCw className="mr-2 size-4 animate-spin" />
                        ) : (
                          <FileText className="mr-2 size-4" />
                        )}
                        {ptaGenerating ? "Generating PTA..." : "Generate PTA"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

            {/* TAF Agreement */}
            <Card className="border-cyan-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                    <FileCheck2 className="size-5" />
                  </div>
                  <div>
                    <CardTitle>TAF - Training Agreement Form</CardTitle>
                    <CardDescription>
                      Generate the TAF after the client has accepted the PTA.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {tafLoading ? (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    <RefreshCw className="size-4 animate-spin" />
                    Checking TAF eligibility...
                  </div>
                ) : tafError ? (
                  <div className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm text-rose-700">{tafError}</p>
                    <Button type="button" variant="outline" onClick={loadTAF}>
                      <RefreshCw className="mr-2 size-4" />
                      Retry
                    </Button>
                  </div>
                ) : tafData?.taf ? (
                  <div className="space-y-4 rounded-xl border border-cyan-200 bg-cyan-50/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          TAF Number
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {tafData.taf.tafNumber}
                        </p>
                      </div>
                      <Badge className={
                        tafData.taf.status === "SENT"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : tafData.taf.status === "ACCEPTED"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : tafData.taf.status === "REJECTED"
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                      }>
                        {tafData.taf.status}
                      </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoItem
                        label="Generated On"
                        value={formatDateTime(tafData.taf.generatedAt)}
                      />
                      <InfoItem
                        label="Sent On"
                        value={formatDateTime(tafData.taf.sentAt)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 rounded-lg border border-cyan-200 bg-white p-4">
                      <Button type="button" variant="outline" onClick={viewTafPdf} disabled={tafPdfViewing || tafPdfLoading}>
                        {tafPdfViewing ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Eye className="mr-2 size-4" />}
                        {tafPdfViewing ? "Opening PDF..." : "Preview TAF PDF"}
                      </Button>
                      <Button type="button" variant="outline" onClick={downloadTafPdf} disabled={tafPdfLoading || tafPdfViewing}>
                        {tafPdfLoading ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <FileText className="mr-2 size-4" />}
                        {tafPdfLoading ? "Generating PDF..." : "Download TAF PDF"}
                      </Button>
                    </div>

                    {tafData.taf.status === "GENERATED" && (
                      <div className="space-y-3 rounded-lg border border-cyan-200 bg-white p-4">
                        <p className="text-sm text-slate-600">
                          Review the generated TAF PDF before marking the document as sent to the client.
                        </p>
                        <Button
                          type="button"
                          onClick={sendTAFToClient}
                          disabled={tafSending}
                          className="bg-cyan-700 text-white hover:bg-cyan-800"
                        >
                          {tafSending ? (
                            <RefreshCw className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Mail className="mr-2 size-4" />
                          )}
                          {tafSending ? "Updating Status..." : "Send TAF to Client"}
                        </Button>
                        <p className="text-xs text-amber-700">
                          Sending currently updates the workflow status. Actual email delivery is not implemented yet.
                        </p>
                      </div>
                    )}

                    {tafData.taf.status === "SENT" && (
                      <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                        TAF has been marked as sent. Waiting for the client to accept or reject it.
                      </p>
                    )}

                    {tafData.taf.status === "ACCEPTED" && (
                      <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                        Client has accepted the TAF. Trainer assignment is the next step.
                      </p>
                    )}

                    {tafData.taf.status === "REJECTED" && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                        <p className="font-semibold">Client rejected the TAF.</p>
                        {tafData.taf.clientRejectionReason && (
                          <p className="mt-1 whitespace-pre-wrap">
                            Reason: {tafData.taf.clientRejectionReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={`rounded-lg border p-4 ${
                      tafData?.canGenerate
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                    }`}>
                      <div className="flex items-center gap-2">
                        {tafData?.canGenerate ? (
                          <CheckCircle2 className="size-5 text-emerald-600" />
                        ) : (
                          <Clock3 className="size-5 text-amber-600" />
                        )}
                        <p className={`text-sm font-semibold ${
                          tafData?.canGenerate ? "text-emerald-800" : "text-amber-800"
                        }`}>
                          {tafData?.canGenerate
                            ? "PTA accepted - TAF generation available"
                            : "Waiting for client PTA acceptance"}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {tafData?.canGenerate
                          ? "The client has accepted the PTA. You can now generate the TAF."
                          : "TAF can only be generated after the client accepts the PTA."}
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={generateTAF}
                      disabled={!tafData?.canGenerate || tafGenerating}
                      className="bg-cyan-700 text-white hover:bg-cyan-800"
                    >
                      {tafGenerating ? (
                        <RefreshCw className="mr-2 size-4 animate-spin" />
                      ) : (
                        <FileText className="mr-2 size-4" />
                      )}
                      {tafGenerating ? "Generating TAF..." : "Generate TAF"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* FTO Generation */}

            {requestAccepted && !existingFto && (
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle>Final Training Offer (FTO)</CardTitle>
                  <CardDescription>
                    Programme rates are fetched automatically from Annexure-A Rate Card. Only logistics, other charges and GST are editable.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {!showFtoForm ? (
                    <Button onClick={() => setShowFtoForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                      <FileText className="mr-2 size-4" /> Generate FTO
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {programmes.map((programme) => {
                          const preview = pricingPreview.find((item) => item.programCode === programme.code)
                          const rate = getRateCardPrice(
                            programme.code,
                            programme.participants,
                            programme.code.startsWith("TTM-") ? ttmOptions[programme.code] : undefined
                          )
                          return (
                            <div key={programme.code} className="rounded-xl border border-slate-200 p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-xs font-semibold text-indigo-600">{programme.code}</p>
                                  <p className="font-semibold text-slate-900">{programme.title}</p>
                                  <p className="text-xs text-slate-500">
                                    {programme.participants} participants · {programme.batches} batch(es) · Category {preview?.batchCategory || "—"}
                                  </p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="text-xs text-slate-500">Rate per batch</p>
                                  <p className="text-lg font-bold text-slate-900">
                                    {rate ? `₹${rate.pricePerBatch.toLocaleString("en-IN")}` : "Select TTM option"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Line total: {rate ? `₹${(rate.pricePerBatch * programme.batches).toLocaleString("en-IN")}` : "—"}
                                  </p>
                                </div>
                              </div>
                              {programme.code.startsWith("TTM-") && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Button type="button" size="sm" variant={ttmOptions[programme.code] === "OPTION_1" ? "default" : "outline"}
                                    onClick={() => setTtmOptions((current) => ({ ...current, [programme.code]: "OPTION_1" }))}>
                                    Option 1 {preview?.option1 ? `(₹${Number(preview.option1).toLocaleString("en-IN")})` : ""}
                                  </Button>
                                  <Button type="button" size="sm" variant={ttmOptions[programme.code] === "OPTION_2" ? "default" : "outline"}
                                    onClick={() => setTtmOptions((current) => ({ ...current, [programme.code]: "OPTION_2" }))}>
                                    Option 2 {preview?.option2 ? `(₹${Number(preview.option2).toLocaleString("en-IN")})` : ""}
                                  </Button>
                                </div>
                              )}
                              {preview?.rateStatus === "PROPOSED_PENDING_APPROVAL" && (
                                <p className="mt-2 text-xs font-medium text-amber-700">Proposed rate — internal approval required before FTO issue.</p>
                              )}
                              {preview?.isTtm && (
                                <p className="mt-2 text-xs text-amber-700">TTM reference rate — Option 1/2 basis requires internal confirmation.</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                          { label: "Logistics Charges (₹)", value: logisticsCharges, set: setLogisticsCharges },
                          { label: "Other Charges (₹)", value: otherCharges, set: setOtherCharges },
                          { label: "GST (%)", value: gstPercent, set: setGstPercent },
                        ].map((field) => (
                          <label key={field.label} className="text-sm">
                            <span className="mb-1 block font-medium text-slate-600">{field.label}</span>
                            <input type="number" min="0" step="0.01" value={field.value}
                              onChange={(event) => field.set(event.target.value)}
                              className="h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-500" />
                          </label>
                        ))}
                        <label className="text-sm">
                          <span className="mb-1 block font-medium text-slate-600">Offer Valid Until</span>
                          <input type="date" min={new Date().toISOString().slice(0, 10)} value={validUntil}
                            onChange={(event) => setValidUntil(event.target.value)}
                            className="h-10 w-full rounded-md border border-slate-300 px-3" />
                        </label>
                        <label className="text-sm">
                          <span className="mb-1 block font-medium text-slate-600">Jurisdiction</span>
                          <input value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)}
                            className="h-10 w-full rounded-md border border-slate-300 px-3" />
                        </label>
                      </div>
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-900">Additional Official FTO Details</h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Enter only details that are not already available in the client service request.
                          </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block text-sm">
                            <span className="mb-1 block font-medium text-slate-600">Client PO / Reference Number</span>
                            <input value={clientPoNumber} onChange={(event) => setClientPoNumber(event.target.value)}
                              maxLength={120}
                              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3"
                              placeholder="Enter client PO / reference number (if available)" />
                          </label>
                          <label className="block text-sm">
                            <span className="mb-1 block font-medium text-slate-600">Daily Training Timing</span>
                            <input value={dailyTrainingTiming} onChange={(event) => setDailyTrainingTiming(event.target.value)}
                              maxLength={120}
                              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3"
                              placeholder="e.g. 10:00 AM – 05:00 PM" />
                          </label>
                        </div>
                        <label className="mt-4 block text-sm">
                          <span className="mb-1 block font-medium text-slate-600">Confirmed Training Schedule</span>
                          <textarea value={confirmedTrainingSchedule} onChange={(event) => setConfirmedTrainingSchedule(event.target.value)}
                            maxLength={5000}
                            className="min-h-24 w-full rounded-md border border-slate-300 bg-white p-3"
                            placeholder="Enter confirmed dates, session-wise schedule or batch-wise schedule. Leave blank if not confirmed yet." />
                        </label>
                        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/60 p-4">
                          <label htmlFor="fto-payment-term" className="mb-2 block text-sm font-semibold text-slate-800">
                            Payment Term <span className="text-rose-600">*</span>
                          </label>
                          <select
                            id="fto-payment-term"
                            value={paymentTerm}
                            onChange={(event) =>
                              setPaymentTerm(
                                event.target.value as "FULL" | "HALF_HALF" | "HALF_QUARTER_QUARTER" | ""
                              )
                            }
                            required
                            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="">Select payment term</option>
                            <option value="FULL">Full Advance – 100% before training</option>
                            <option value="HALF_HALF">50% Advance + 50% before completion</option>
                            <option value="HALF_QUARTER_QUARTER">50% Advance + 25% during training + 25% on completion</option>
                          </select>
                          <p className="mt-2 text-xs text-slate-600">
                            Installments will be generated automatically in the FTO according to the selected payment term.
                          </p>
                          {paymentTerm && (
                            <div className="mt-3 rounded-md border border-blue-100 bg-white p-3 text-xs text-slate-700">
                              <p className="font-semibold text-slate-800">Selected payment schedule</p>
                              {paymentTerm === "FULL" && <p className="mt-1">100% – Full advance before training starts.</p>}
                              {paymentTerm === "HALF_HALF" && (
                                <ul className="mt-1 list-inside list-disc space-y-1">
                                  <li>50% – Advance payment</li>
                                  <li>50% – Before training completion</li>
                                </ul>
                              )}
                              {paymentTerm === "HALF_QUARTER_QUARTER" && (
                                <ul className="mt-1 list-inside list-disc space-y-1">
                                  <li>50% – Advance payment</li>
                                  <li>25% – During training</li>
                                  <li>25% – On completion</li>
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                        <label className="mt-4 block text-sm">
                          <span className="mb-1 block font-medium text-slate-600">Payment Milestones (Additional Notes)</span>
                          <textarea value={paymentMilestones} onChange={(event) => setPaymentMilestones(event.target.value)}
                            maxLength={3000}
                            className="min-h-20 w-full rounded-md border border-slate-300 bg-white p-3"
                            placeholder="Enter approved payment stages / milestones, if applicable." />
                        </label>
                        <label className="mt-4 block text-sm">
                          <span className="mb-1 block font-medium text-slate-600">Logistics Treatment</span>
                          <textarea value={logisticsTreatment} onChange={(event) => setLogisticsTreatment(event.target.value)}
                            maxLength={3000}
                            className="min-h-20 w-full rounded-md border border-slate-300 bg-white p-3"
                            placeholder="Clarify whether logistics are included, charged separately, or arranged by the client." />
                        </label>
                      </div>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-slate-600">Terms & Conditions</span>
                        <textarea value={terms} onChange={(event) => setTerms(event.target.value)}
                          className="min-h-24 w-full rounded-md border border-slate-300 p-3" placeholder="Enter offer terms..." />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-slate-600">Special Remarks</span>
                        <textarea value={specialRemarks} onChange={(event) => setSpecialRemarks(event.target.value)}
                          className="min-h-20 w-full rounded-md border border-slate-300 p-3" placeholder="Optional remarks..." />
                      </label>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowFtoForm(false)} disabled={ftoSaving}>Cancel</Button>
                        <Button onClick={createFTO} disabled={ftoSaving || programmes.length === 0}
                          className="bg-emerald-600 hover:bg-emerald-700">
                          {ftoSaving ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <FileCheck2 className="mr-2 size-4" />}
                          Create FTO Draft
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {existingFto && (
              <Card className="border-emerald-200">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle>Final Training Offer</CardTitle>
                      <CardDescription>{existingFto.ftoNumber} · {requestData.status === "FTO_SENT" ? "Sent to client" : "Draft created"} · Payment Term: {String(existingFto.paymentTerm || "Not available").replaceAll("_", " ")}</CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={
                        requestData.status === "FTO_SENT"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : requestData.status === "FTO_DRAFT"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                      }>
                        {requestData.status === "FTO_SENT"
                          ? "Sent to Client"
                          : requestData.status === "FTO_DRAFT"
                            ? "FTO Draft"
                            : statusLabels[requestData.status] || requestData.status}
                      </Badge>

                      <Button
                        variant="outline"
                        onClick={viewFtoPdf}
                        disabled={pdfViewing}
                      >
                        {pdfViewing ? (
                          <RefreshCw className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Eye className="mr-2 size-4" />
                        )}
                        {pdfViewing ? "Opening PDF..." : "View PDF"}
                      </Button>

                      <Button
                        onClick={downloadFtoPdf}
                        disabled={pdfDownloading}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {pdfDownloading ? (
                          <RefreshCw className="mr-2 size-4 animate-spin" />
                        ) : (
                          <FileText className="mr-2 size-4" />
                        )}
                        {pdfDownloading ? "Generating PDF..." : "Download PDF"}
                      </Button>
                    </div>

                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-left text-slate-600">
                        <tr><th className="p-3">Programme</th><th className="p-3">Batches</th><th className="p-3">Price / Batch</th><th className="p-3">Total</th></tr>
                      </thead>
                      <tbody>
                        {(existingFto.programs || []).map((item: any) => (
                          <tr key={item.id} className="border-t">
                            <td className="p-3 font-medium">{item.programTitle}</td>
                            <td className="p-3">{item.batches}</td>
                            <td className="p-3">₹{Number(item.pricePerBatch).toLocaleString("en-IN")}</td>
                            <td className="p-3">₹{Number(item.totalAmount).toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="ml-auto grid max-w-sm gap-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><strong>₹{Number(existingFto.subtotal).toLocaleString("en-IN")}</strong></div>
                    <div className="flex justify-between"><span>Logistics</span><strong>₹{Number(existingFto.logisticsCharges).toLocaleString("en-IN")}</strong></div>
                    <div className="flex justify-between"><span>Other Charges</span><strong>₹{Number(existingFto.otherCharges).toLocaleString("en-IN")}</strong></div>
                    <div className="flex justify-between"><span>Taxable Amount</span><strong>₹{Number(existingFto.taxableAmount).toLocaleString("en-IN")}</strong></div>
                    <div className="flex justify-between"><span>GST ({existingFto.gstPercent}%)</span><strong>₹{Number(existingFto.gstAmount).toLocaleString("en-IN")}</strong></div>
                    <Separator />
                    <div className="flex justify-between text-base"><span className="font-semibold">Grand Total</span><strong className="text-emerald-700">₹{Number(existingFto.grandTotal).toLocaleString("en-IN")}</strong></div>
                  </div>
                  <div className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {requestData.status === "FTO_SENT"
                          ? "FTO has been marked as sent to the client."
                          : requestData.status === "FTO_DRAFT"
                            ? "FTO draft is ready. Review the PDF and send it to the client when approved."
                            : `Current request status: ${statusLabels[requestData.status] || requestData.status}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Valid until: {formatDate(existingFto.validUntil)}
                      </p>
                    </div>
                    {requestData.status === "FTO_DRAFT" && (
                      <Button
                        type="button"
                        onClick={sendFTOToClient}
                        disabled={ftoSending || pdfDownloading || pdfViewing}
                        className="w-full shrink-0 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                      >
                        {ftoSending ? (
                          <RefreshCw className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Mail className="mr-2 size-4" />
                        )}
                        {ftoSending ? "Sending..." : "Send FTO to Client"}
                      </Button>
                    )}
                  </div>
                  {(existingFto.clientPoNumber || existingFto.confirmedTrainingSchedule || existingFto.dailyTrainingTiming || existingFto.paymentMilestones || existingFto.logisticsTreatment) && (
                    <div className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4 text-sm">
                      <p className="font-semibold text-slate-900">Additional FTO Details</p>
                      {existingFto.clientPoNumber && <p><strong>Client PO / Reference:</strong> {existingFto.clientPoNumber}</p>}
                      {existingFto.dailyTrainingTiming && <p><strong>Daily Training Timing:</strong> {existingFto.dailyTrainingTiming}</p>}
                      {existingFto.confirmedTrainingSchedule && <p className="whitespace-pre-wrap"><strong>Confirmed Training Schedule:</strong>{" "}{existingFto.confirmedTrainingSchedule}</p>}
                      {existingFto.paymentMilestones && <p className="whitespace-pre-wrap"><strong>Payment Milestones:</strong>{" "}{existingFto.paymentMilestones}</p>}
                      {existingFto.logisticsTreatment && <p className="whitespace-pre-wrap"><strong>Logistics Treatment:</strong>{" "}{existingFto.logisticsTreatment}</p>}
                    </div>
                  )}
                  {existingFto.terms && <div className="rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-wrap"><strong>Terms:</strong>{" "}{existingFto.terms}</div>}
                  {existingFto.specialRemarks && <div className="rounded-lg bg-amber-50 p-3 text-sm whitespace-pre-wrap"><strong>Remarks:</strong>{" "}{existingFto.specialRemarks}</div>}
                </CardContent>
              </Card>
            )}

            {/* Participant Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <CardTitle>Participant Summary</CardTitle>
                    <CardDescription>
                      Participant counts submitted for each programme
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-hidden rounded-xl border">
                  <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Programme</span>
                    <span>Participants</span>
                    <span>Batches</span>
                  </div>

                  {programmes.map((programme, index) => (
                    <div
                      key={programme.code}
                      className={`grid grid-cols-[1.5fr_1fr_1fr] gap-2 px-4 py-3 text-sm ${index !== programmes.length - 1 ? "border-b" : ""
                        }`}
                    >
                      <span className="font-medium text-slate-900">
                        {programme.title}
                      </span>
                      <span className="text-slate-600">
                        {programme.participants}
                      </span>
                      <span className="text-slate-600">
                        {programme.batches}
                      </span>
                    </div>
                  ))}

                  {programmes.length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">
                      No participant information available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            {(canStartReview || canDecide) && (
              <Card className="overflow-hidden border-indigo-200 shadow-sm">
                <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-6 py-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-white/15">
                      <ShieldCheck className="size-6" />
                    </div>
                    <div>
                      <h2 className="font-semibold">
                        Request Review & Decision
                      </h2>
                      <p className="mt-1 text-sm text-indigo-100">
                        {canStartReview
                          ? "Start reviewing this submitted service request."
                          : "Review the request and accept or reject it."}
                      </p>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-4 p-6">
                  {canStartReview && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm font-medium text-blue-900">
                        This request is waiting for review.
                      </p>
                      <p className="mt-1 text-sm text-blue-700">
                        Start Review to move the request into the Under Review stage.
                      </p>
                      <Button
                        onClick={() =>
                          updateRequestStatus("UNDER_REVIEW")
                        }
                        disabled={actionLoading}
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                      >
                        {actionLoading ? (
                          <RefreshCw className="mr-2 size-4 animate-spin" />
                        ) : (
                          <ClipboardCheck className="mr-2 size-4" />
                        )}
                        Start Review
                      </Button>
                    </div>
                  )}

                  {canDecide && (
                    <>
                      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-sm font-medium text-amber-900">
                          Request is under review.
                        </p>
                        <p className="mt-1 text-sm text-amber-800">
                          Verify the submitted details before making a decision.
                        </p>
                      </div>

                      <Separator />

                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setShowRejectBox(true)}
                          disabled={actionLoading}
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <XCircle className="mr-2 size-4" />
                          Reject Request
                        </Button>

                        <Button
                          onClick={() =>
                            updateRequestStatus("REQUEST_ACCEPTED")
                          }
                          disabled={actionLoading}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-500/20"
                        >
                          {actionLoading ? (
                            <RefreshCw className="mr-2 size-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="mr-2 size-4" />
                          )}
                          Accept Request
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reject Request */}
            {showRejectBox && canDecide && (
              <Card className="border-rose-200 bg-rose-50/40">
                <CardHeader>
                  <CardTitle className="text-rose-900">
                    Reject Service Request
                  </CardTitle>
                  <CardDescription className="text-rose-700">
                    Provide a reason for rejecting this request. This remark will be saved in the request timeline.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    placeholder="Enter rejection remarks..."
                    className="min-h-32 w-full rounded-xl border border-rose-200 bg-white p-3 text-sm outline-none placeholder:text-slate-400 focus:border-rose-400"
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectBox(false)
                        setRemarks("")
                      }}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={() =>
                        updateRequestStatus("REQUEST_REJECTED")
                      }
                      disabled={actionLoading || !remarks.trim()}
                      className="bg-rose-600 text-white hover:bg-rose-700"
                    >
                      {actionLoading && (
                        <RefreshCw className="mr-2 size-4 animate-spin" />
                      )}
                      <XCircle className="mr-2 size-4" />
                      Confirm Rejection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Final Status */}
            {(status === "REQUEST_ACCEPTED" ||
              status === "REQUEST_REJECTED") && (
                <Card
                  className={
                    status === "REQUEST_ACCEPTED"
                      ? "border-emerald-200"
                      : "border-rose-200"
                  }
                >
                  <CardContent className="flex items-start gap-3 p-5">
                    {status === "REQUEST_ACCEPTED" ? (
                      <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 size-6 shrink-0 text-rose-600" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">
                        {status === "REQUEST_ACCEPTED"
                          ? "Request Accepted"
                          : "Request Rejected"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {status === "REQUEST_ACCEPTED"
                          ? "The request has been accepted. FTO is the next processing stage."
                          : "This request has been rejected. The decision and remarks are recorded in the timeline."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            {/* Request Workflow */}
            <Card className="border-indigo-100">
              <CardHeader>
                <CardTitle>Request Workflow</CardTitle>
                <CardDescription>
                  Actual request activity from the database
                </CardDescription>
              </CardHeader>

              <CardContent>
                {timeline.length > 0 ? (
                  <div className="space-y-0">
                    {timeline.map((item, index) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="size-4" />
                          </div>

                          {index !== timeline.length - 1 && (
                            <div className="h-10 w-px bg-slate-200" />
                          )}
                        </div>

                        <div className="min-w-0 pb-5">
                          <p className="text-sm font-semibold text-slate-900">
                            {statusLabels[item.status] || item.status}
                          </p>

                          {item.remarks && (
                            <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">
                              {item.remarks}
                            </p>
                          )}

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {formatDateTime(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No timeline activity available.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Submission Details */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <InfoItem
                  label="Submitted By"
                  value={requestData.client?.name}
                />
                <InfoItem
                  label="Client Email"
                  value={requestData.client?.email}
                />
                <InfoItem
                  label="Submitted On"
                  value={formatDateTime(requestData.submittedAt)}
                />
                <InfoItem
                  label="Created On"
                  value={formatDateTime(requestData.createdAt)}
                />
                <InfoItem
                  label="Request Number"
                  value={requestData.requestNumber}
                />
              </CardContent>
            </Card>

            {/* Next Processing Step */}
            <Card className="overflow-hidden border-emerald-200">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
                  <FileCheck2 className="size-5" />
                </div>

                <h3 className="mt-4 font-semibold">
                  Next Processing Step
                </h3>

                <p className="mt-1 text-sm text-emerald-50">
                  {requestAccepted
                    ? "Request accepted. FTO generation is the next step."
                    : status === "REQUEST_REJECTED"
                      ? "Request rejected. Review the recorded remarks."
                      : "Complete the request review to proceed to the FTO stage."}
                </p>

                {requestAccepted && !existingFto && (
                  <Button
                    onClick={() => setShowFtoForm(true)}
                    className="mt-4 w-full bg-white text-emerald-700 hover:bg-emerald-50"
                  >
                    <FileText className="mr-2 size-4" />
                    {showFtoForm ? "FTO Form Open" : "Generate FTO"}
                  </Button>
                )}
                {ftoLoading && <p className="mt-3 text-xs text-emerald-50">Checking FTO status...</p>}
              </div>
            </Card>

            {/* Training Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Training Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem
                  label="Preferred Date"
                  value={formatDate(requestData.preferredDate)}
                  icon={<CalendarDays className="size-4" />}
                />
                <InfoItem
                  label="Alternate Date"
                  value={formatDate(requestData.alternateDate)}
                  icon={<CalendarDays className="size-4" />}
                />
                <InfoItem
                  label="Training Location"
                  value={location}
                  icon={<MapPin className="size-4" />}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
  )
}
