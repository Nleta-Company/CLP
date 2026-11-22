
"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    RefreshCw,
    Users,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"

interface Programme {
    code: string
    title: string
    category: string
    duration: string
    mode: string
    participants: number
    expectedBatches: number
}

interface RequestTimeline {
    id: string
    status: string
    remarks: string | null
    createdAt: string
}

type PaymentInstallmentStatus = "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED"

interface PaymentSubmission {
    id: string
    paymentMethod: string
    transactionReference: string
    amountPaid: string
    status: string
    adminRemarks: string | null
    reviewedAt: string | null
    createdAt: string
    hasReceipt: boolean
}

interface PaymentInstallment {
    id: string
    installmentNumber: number
    percentage: string
    amount: string
    milestone: string
    status: PaymentInstallmentStatus
    submissions: PaymentSubmission[]
}

interface FTO {
    id: string
    ftoNumber: string
    currency: string
    subtotal: string
    discountPercent: string
    discountAmount: string
    logisticsCharges: string
    otherCharges: string
    taxableAmount: string
    gstPercent: string
    gstAmount: string
    grandTotal: string
    issueDate: string
    validUntil: string
    jurisdiction: string | null
    documentUrl: string | null
    paymentTerm: "FULL" | "HALF_HALF" | "HALF_QUARTER_QUARTER" | null
    paymentInstallments: PaymentInstallment[]
    programs: {
        programCode: string
        programTitle: string
        duration: string
        deliveryMode: string
        participants: number
        batches: number
        pricePerBatch: string
        totalAmount: string
    }[]
}

interface PTA {
    id: string
    ptaNumber: string
    documentUrl: string | null
    effectiveDate: string | null
    status: "GENERATED" | "SENT" | "ACCEPTED" | "REJECTED"
    generatedAt: string
    sentAt: string | null
}

interface TAF {
    id: string
    tafNumber: string
    documentUrl: string | null
    status: "GENERATED" | "SENT" | "ACCEPTED" | "REJECTED"
    generatedAt: string
    sentAt: string | null
}

interface RequestDetails {
    id: string
    requestNumber: string
    status: string
    createdAt: string
    submittedAt: string | null
    organisation: string
    gstin: string | null
    billingAddress: string
    country: string
    state: string
    city: string
    contactName: string
    designation: string | null
    email: string
    phone: string
    preferredDate: string | null
    alternateDate: string | null
    trainingLocation: string
    preferredLanguage: string | null
    coordinator: string | null
    facilities: string | null
    assessment: string | null
    refresher: string | null
    additionalRequirements: string | null
    programmes: Programme[]
    totalParticipants: number
    timeline: RequestTimeline[]
    fto: FTO | null
    pta: PTA | null
    taf: TAF | null
}

const statusLabels: Record<string, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Request Submitted",
    UNDER_REVIEW: "Under Review",
    REQUEST_ACCEPTED: "Request Accepted",
    REQUEST_REJECTED: "Request Rejected",
    TSO_DRAFT: "TSO Being Prepared",
    TSO_SENT: "TSO Sent",
    TSO_ACCEPTED: "TSO Accepted",
    TSO_REJECTED: "TSO Rejected",
    FTO_DRAFT: "FTO Being Prepared",
    FTO_SENT: "FTO Received",
    FTO_ACCEPTED: "FTO Accepted",
    FTO_REJECTED: "FTO Rejected",
    PTA_SENT: "PTA Sent to Client",
    PTA_ACCEPTED: "PTA Accepted",
    PTA_REJECTED: "PTA Rejected",
    PAYMENT_PENDING: "Payment Pending",
    PAYMENT_SUBMITTED: "Payment Submitted",
    PAYMENT_VERIFICATION: "Payment Verification",
    PAYMENT_VERIFIED: "Payment Verified",
    PSGA_DRAFT: "PSGA Being Prepared",
    PSGA_SENT: "PSGA Sent",
    PSGA_ACCEPTED: "PSGA Accepted",
    PSGA_REJECTED: "PSGA Rejected",
    TAF_DRAFT: "TAF Being Prepared",
    TAF_SENT: "TAF Sent",
    TAF_ACCEPTED: "TAF Accepted",
    TAF_REJECTED: "TAF Rejected",
    TRAINER_ASSIGNMENT: "Trainer Assignment",
    TRAINING: "Training In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
}

function formatDate(value: string | null) {
    if (!value) return "Not specified"

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return "Not specified"

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

function formatStatus(status: string) {
    return statusLabels[status] || status.replaceAll("_", " ")
}

function formatCurrency(amount: string, currency: string) {
    const value = Number(amount)

    if (!Number.isFinite(value)) return amount

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(value)
    } catch {
        return `${currency} ${value.toLocaleString("en-IN")}`
    }
}

export default function ClientRequestDetailsPage() {
    const params = useParams<{ id: string }>()
    const id = params.id

    const [request, setRequest] = useState<RequestDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [decisionLoading, setDecisionLoading] = useState(false)
    const [decisionMessage, setDecisionMessage] = useState("")
    const [decisionError, setDecisionError] = useState("")
    const [showRejectForm, setShowRejectForm] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")
    const [paymentSubmittingId, setPaymentSubmittingId] = useState<string | null>(null)
    const [paymentError, setPaymentError] = useState("")
    const [paymentMessage, setPaymentMessage] = useState("")
    const [ptaDecisionLoading, setPtaDecisionLoading] = useState(false)
    const [ptaDecisionMessage, setPtaDecisionMessage] = useState("")
    const [ptaDecisionError, setPtaDecisionError] = useState("")
    const [showPtaRejectForm, setShowPtaRejectForm] = useState(false)
    const [ptaRejectionReason, setPtaRejectionReason] = useState("")
    const [tafDecisionLoading, setTafDecisionLoading] = useState(false)
    const [tafDecisionMessage, setTafDecisionMessage] = useState("")
    const [tafDecisionError, setTafDecisionError] = useState("")
    const [showTafRejectForm, setShowTafRejectForm] = useState(false)
    const [tafRejectionReason, setTafRejectionReason] = useState("")

    const loadRequest = useCallback(async () => {
        try {
            setLoading(true)
            setError("")

            const response = await fetch(`/api/client/requests/${id}`, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to load request.")
            }

            setRequest(result.request)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong."
            )
        } finally {
            setLoading(false)
        }
    }, [id])

    const submitFtoDecision = async (decision: "ACCEPT" | "REJECT") => {
        if (decision === "REJECT" && rejectionReason.trim().length < 10) {
            setDecisionError("Please provide a rejection reason (at least 10 characters).")
            return
        }

        const confirmed = window.confirm(
            decision === "ACCEPT"
                ? "Are you sure you want to accept this Final Training Offer?"
                : "Are you sure you want to reject this Final Training Offer?"
        )
        if (!confirmed) return

        try {
            setDecisionLoading(true)
            setDecisionError("")
            setDecisionMessage("")

            const response = await fetch(`/api/client/requests/${id}/fto/decision`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    decision,
                    rejectionReason: decision === "REJECT" ? rejectionReason.trim() : undefined,
                }),
            })

            const result = await response.json()
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to submit your FTO decision.")
            }

            setDecisionMessage(
                decision === "ACCEPT"
                    ? "FTO accepted successfully."
                    : "FTO rejected. Your reason has been shared with NLETA."
            )
            setShowRejectForm(false)
            setRejectionReason("")
            await loadRequest()
        } catch (err) {
            setDecisionError(
                err instanceof Error ? err.message : "Something went wrong."
            )
        } finally {
            setDecisionLoading(false)
        }
    }

    const submitPtaDecision = async (decision: "ACCEPT" | "REJECT") => {
        if (decision === "REJECT" && ptaRejectionReason.trim().length < 10) {
            setPtaDecisionError("Please provide a rejection reason (at least 10 characters).")
            return
        }

        const confirmed = window.confirm(
            decision === "ACCEPT"
                ? "Are you sure you want to accept this Professional Training Agreement?"
                : "Are you sure you want to reject this Professional Training Agreement?"
        )
        if (!confirmed) return

        try {
            setPtaDecisionLoading(true)
            setPtaDecisionError("")
            setPtaDecisionMessage("")

            const response = await fetch(`/api/client/requests/${id}/pta/decision`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    decision,
                    rejectionReason: decision === "REJECT" ? ptaRejectionReason.trim() : undefined,
                }),
            })

            const result = await response.json()
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to submit your PTA decision.")
            }

            setPtaDecisionMessage(
                decision === "ACCEPT"
                    ? "PTA accepted successfully. NLETA can now proceed with TAF generation."
                    : "PTA rejected. Your reason has been shared with NLETA."
            )
            setShowPtaRejectForm(false)
            setPtaRejectionReason("")
            await loadRequest()
        } catch (err) {
            setPtaDecisionError(
                err instanceof Error ? err.message : "Unable to submit PTA decision."
            )
        } finally {
            setPtaDecisionLoading(false)
        }
    }

    const submitTafDecision = async (decision: "ACCEPT" | "REJECT") => {
        if (decision === "REJECT" && tafRejectionReason.trim().length < 10) {
            setTafDecisionError("Please provide a rejection reason (at least 10 characters).")
            return
        }

        const confirmed = window.confirm(
            decision === "ACCEPT"
                ? "Are you sure you want to accept this Training Activation Form?"
                : "Are you sure you want to reject this Training Activation Form?"
        )
        if (!confirmed) return

        try {
            setTafDecisionLoading(true)
            setTafDecisionError("")
            setTafDecisionMessage("")

            const response = await fetch(`/api/client/requests/${id}/taf/decision`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    decision,
                    rejectionReason: decision === "REJECT" ? tafRejectionReason.trim() : undefined,
                }),
            })

            const result = await response.json()
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to submit your TAF decision.")
            }

            setTafDecisionMessage(
                decision === "ACCEPT"
                    ? "TAF accepted successfully. NLETA can now proceed with trainer assignment."
                    : "TAF rejected. Your reason has been shared with NLETA."
            )
            setShowTafRejectForm(false)
            setTafRejectionReason("")
            await loadRequest()
        } catch (err) {
            setTafDecisionError(
                err instanceof Error ? err.message : "Unable to submit TAF decision."
            )
        } finally {
            setTafDecisionLoading(false)
        }
    }

    const submitInstallmentPayment = async (
        event: React.FormEvent<HTMLFormElement>,
        installmentId: string
    ) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)

        try {
            setPaymentSubmittingId(installmentId)
            setPaymentError("")
            setPaymentMessage("")

            const response = await fetch(
                `/api/client/requests/${id}/payments/${installmentId}/submit`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                }
            )

            // Read the response as text first so HTML/plain-text server errors
            // do not cause an "Unexpected token" JSON parsing exception.
            const responseText = await response.text()

            let result: {
                success?: boolean
                message?: string
            }

            try {
                result = JSON.parse(responseText)
            } catch {
                console.error("Payment API returned a non-JSON response:", {
                    status: response.status,
                    statusText: response.statusText,
                    response: responseText,
                })

                throw new Error(
                    `The server returned an invalid response (${response.status}). Please try again or contact support.`
                )
            }

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to submit payment.")
            }

            setPaymentMessage(result.message || "Payment submitted successfully.")
            form.reset()
            await loadRequest()
        } catch (err) {
            setPaymentError(
                err instanceof Error ? err.message : "Unable to submit payment."
            )
        } finally {
            setPaymentSubmittingId(null)
        }
    }

    useEffect(() => {
        if (id) {
            void loadRequest()
        }
    }, [id, loadRequest])

    if (loading) {
        return (
            <DashboardShell role="CLIENT">
                <div className="flex min-h-[55vh] items-center justify-center">
                    <div className="text-center">
                        <RefreshCw className="mx-auto size-8 animate-spin text-indigo-600" />
                        <p className="mt-3 text-sm text-slate-500">
                            Loading request details...
                        </p>
                    </div>
                </div>
            </DashboardShell>
        )
    }

    if (error || !request) {
        return (
            <DashboardShell role="CLIENT">
                <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                    <p className="font-semibold text-red-700">
                        {error || "Request not found."}
                    </p>

                    <Link
                        href="/client/requests"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
                    >
                        <ArrowLeft className="size-4" />
                        Back to My Requests
                    </Link>
                </div>
            </DashboardShell>
        )
    }

    const statusColor =
        request.status === "COMPLETED" ||
            request.status === "FTO_ACCEPTED" ||
            request.status === "PAYMENT_VERIFIED"
            ? "bg-emerald-50 text-emerald-700"
            : request.status.includes("REJECTED") ||
                request.status === "CANCELLED"
                ? "bg-red-50 text-red-700"
                : "bg-indigo-50 text-indigo-700"

    return (
        <DashboardShell role="CLIENT">
            <div className="mx-auto max-w-7xl space-y-7">

                {/* PAGE HEADER */}
                <div>
                    <Link
                        href="/client/requests"
                        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
                    >
                        <ArrowLeft className="size-4" />
                        Back to My Requests
                    </Link>

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-semibold text-indigo-600">
                                Client Portal / Request Details
                            </p>

                            <h1 className="mt-2 text-3xl font-bold text-slate-900">
                                Request Details
                            </h1>

                            <p className="mt-2 font-mono text-sm text-slate-500">
                                {request.requestNumber}
                            </p>
                        </div>

                        <div
                            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${statusColor}`}
                        >
                            {formatStatus(request.status)}
                        </div>
                    </div>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryCard
                        icon={<GraduationCap className="size-5" />}
                        label="Programmes"
                        value={String(request.programmes.length)}
                    />

                    <SummaryCard
                        icon={<Users className="size-5" />}
                        label="Participants"
                        value={String(request.totalParticipants)}
                    />

                    <SummaryCard
                        icon={<CalendarDays className="size-5" />}
                        label="Submitted On"
                        value={formatDate(request.submittedAt)}
                    />
                </div>

                {/* SELECTED PROGRAMMES */}
                <Section title="Selected Training Programmes">
                    <div className="space-y-3">
                        {request.programmes.map((program) => (
                            <div
                                key={program.code}
                                className="rounded-xl border border-slate-200 p-4"
                            >
                                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {program.title}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {program.code} · {program.category} · {program.duration}
                                        </p>
                                    </div>

                                    <span className="w-fit rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                        {program.mode} Mode
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <Info
                                        label="Participants"
                                        value={String(program.participants)}
                                    />

                                    <Info
                                        label="Expected Batches"
                                        value={String(program.expectedBatches)}
                                    />

                                    <Info label="Duration" value={program.duration} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* TRAINING DETAILS */}
                <Section title="Training Details">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <Info
                            label="Preferred Date"
                            value={formatDate(request.preferredDate)}
                        />

                        <Info
                            label="Alternate Date"
                            value={formatDate(request.alternateDate)}
                        />

                        <Info
                            label="Training Location"
                            value={request.trainingLocation}
                        />

                        <Info
                            label="Preferred Language"
                            value={request.preferredLanguage || "Not specified"}
                        />

                        <Info
                            label="Coordinator"
                            value={request.coordinator || "Not specified"}
                        />

                        <Info
                            label="Facilities"
                            value={request.facilities || "Not specified"}
                        />

                        <Info
                            label="Assessment"
                            value={request.assessment || "Not specified"}
                        />

                        <Info
                            label="Refresher"
                            value={request.refresher || "Not specified"}
                        />
                    </div>

                    {request.additionalRequirements && (
                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <Info
                                label="Additional Requirements"
                                value={request.additionalRequirements}
                            />
                        </div>
                    )}
                </Section>

                {/* CLIENT DETAILS */}
                <Section title="Client & Organisation Details">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <Info label="Organisation" value={request.organisation} />
                        <Info label="Contact Person" value={request.contactName} />
                        <Info
                            label="Designation"
                            value={request.designation || "Not specified"}
                        />
                        <Info label="Email" value={request.email} />
                        <Info label="Phone" value={request.phone} />
                        <Info label="GSTIN" value={request.gstin || "Not provided"} />
                        <Info label="Country" value={request.country} />
                        <Info label="State" value={request.state} />
                        <Info label="City" value={request.city} />
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                        <Info
                            label="Billing Address"
                            value={request.billingAddress}
                        />
                    </div>
                </Section>

                {/* REQUEST TIMELINE */}
                <Section title="Request Progress">
                    {request.timeline.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            No progress updates available yet.
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {request.timeline.map((item, index) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                            {index === request.timeline.length - 1 ? (
                                                <Clock className="size-4" />
                                            ) : (
                                                <CheckCircle2 className="size-4" />
                                            )}
                                        </div>

                                        {index !== request.timeline.length - 1 && (
                                            <div className="mt-2 h-full min-h-6 w-px bg-slate-200" />
                                        )}
                                    </div>

                                    <div className="pb-3">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {formatStatus(item.status)}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {formatDate(item.createdAt)}
                                        </p>

                                        {item.remarks && (
                                            <p className="mt-2 text-sm text-slate-600">
                                                {item.remarks}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* FINAL TRAINING OFFER */}
                <Section title="Final Training Offer">
                    {!request.fto ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
                            <FileText className="mx-auto size-8 text-slate-400" />

                            <h3 className="mt-3 font-semibold text-slate-800">
                                FTO Not Available Yet
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Your Final Training Offer will appear here once it is prepared.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* FTO HEADER */}
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                    <div>
                                        <p className="text-xs text-slate-500">FTO Number</p>

                                        <p className="mt-1 font-mono font-bold text-slate-900">
                                            {request.fto.ftoNumber}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Offer Valid Until
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-900">
                                            {formatDate(request.fto?.validUntil ?? null)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 border-t border-indigo-100 pt-4">
                                    <p className="text-xs text-slate-500">Grand Total</p>

                                    <p className="mt-1 text-3xl font-bold text-indigo-700">
                                        {formatCurrency(
                                            request.fto.grandTotal,
                                            request.fto.currency
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* FTO PROGRAMMES */}
                            <div className="mt-5 space-y-3">
                                {request.fto.programs.map((program) => (
                                    <div
                                        key={program.programCode}
                                        className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {program.programTitle}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {program.programCode} · {program.participants} Participants · {program.batches} Batches
                                            </p>
                                        </div>

                                        <p className="text-sm font-semibold text-slate-800">
                                            {formatCurrency(
                                                program.totalAmount,
                                                request.fto?.currency ?? "INR"
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* FTO AMOUNT BREAKDOWN */}
                            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                                <AmountRow
                                    label="Subtotal"
                                    value={formatCurrency(
                                        request.fto.subtotal,
                                        request.fto.currency
                                    )}
                                />

                                <AmountRow
                                    label={`Discount (${request.fto.discountPercent}%)`}
                                    value={`- ${formatCurrency(
                                        request.fto.discountAmount,
                                        request.fto.currency
                                    )}`}
                                />

                                <AmountRow
                                    label="Logistics Charges"
                                    value={formatCurrency(
                                        request.fto.logisticsCharges,
                                        request.fto.currency
                                    )}
                                />

                                <AmountRow
                                    label="Other Charges"
                                    value={formatCurrency(
                                        request.fto.otherCharges,
                                        request.fto.currency
                                    )}
                                />

                                <AmountRow
                                    label="Taxable Amount"
                                    value={formatCurrency(
                                        request.fto.taxableAmount,
                                        request.fto.currency
                                    )}
                                />

                                <AmountRow
                                    label={`GST (${request.fto.gstPercent}%)`}
                                    value={formatCurrency(
                                        request.fto.gstAmount,
                                        request.fto.currency
                                    )}
                                />

                                <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                                    <span>Grand Total</span>

                                    <span>
                                        {formatCurrency(
                                            request.fto.grandTotal,
                                            request.fto.currency
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* PDF BUTTONS - NULL SAFE */}
                            {request.fto && (
                                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                                    <a
                                        href={`/api/client/requests/${request.id}/fto/pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                    >
                                        <FileText className="size-4" />
                                        View FTO PDF
                                    </a>

                                    <a
                                        href={`/api/client/requests/${request.id}/fto/pdf`}
                                        download={`${request.fto?.ftoNumber ?? "FTO"}.pdf`}
                                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <FileText className="size-4" />
                                        Download PDF
                                    </a>
                                </div>
                            )}

                            {/* CLIENT FTO DECISION */}
                            {request.status === "FTO_SENT" && (
                                <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50/60 p-5">
                                    <h3 className="font-semibold text-slate-900">
                                        Review and Respond to FTO
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Please review the FTO details and PDF carefully. You can accept or reject this offer.
                                    </p>

                                    {decisionMessage && (
                                        <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                                            {decisionMessage}
                                        </p>
                                    )}
                                    {decisionError && (
                                        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                                            {decisionError}
                                        </p>
                                    )}

                                    {showRejectForm ? (
                                        <div className="mt-4 space-y-3">
                                            <label className="block text-sm font-semibold text-slate-700" htmlFor="fto-rejection-reason">
                                                Reason for rejection
                                            </label>
                                            <textarea
                                                id="fto-rejection-reason"
                                                value={rejectionReason}
                                                onChange={(event) => setRejectionReason(event.target.value)}
                                                rows={4}
                                                maxLength={2000}
                                                placeholder="Please explain why you are rejecting this FTO (minimum 10 characters)."
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            />
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => void submitFtoDecision("REJECT")}
                                                    disabled={decisionLoading || rejectionReason.trim().length < 10}
                                                    className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {decisionLoading ? "Submitting..." : "Confirm Rejection"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowRejectForm(false)
                                                        setDecisionError("")
                                                    }}
                                                    disabled={decisionLoading}
                                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => void submitFtoDecision("ACCEPT")}
                                                disabled={decisionLoading}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="size-4" />
                                                {decisionLoading ? "Submitting..." : "Accept FTO"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowRejectForm(true)
                                                    setDecisionError("")
                                                }}
                                                disabled={decisionLoading}
                                                className="inline-flex h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                Reject FTO
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FTO STATUS MESSAGES */}
                            {request.status === "FTO_DRAFT" && (
                                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                    Your FTO is being prepared by NLETA. It is not available for approval yet.
                                </div>
                            )}

                            {request.status === "FTO_SENT" && (
                                <div className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-800">
                                    Your Final Training Offer has been sent. Please review the PDF and submit your decision above.
                                </div>
                            )}

                            {request.status === "FTO_ACCEPTED" && (
                                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                    Your Final Training Offer has been accepted.
                                </div>
                            )}

                            {request.status === "FTO_REJECTED" && (
                                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                                    Your Final Training Offer has been rejected.
                                </div>
                            )}

                            {/* CLIENT PAYMENT SCHEDULE AND SUBMISSION */}
                            {["FTO_ACCEPTED", "PAYMENT_PENDING", "PAYMENT_SUBMITTED", "PAYMENT_VERIFICATION", "PAYMENT_VERIFIED"].includes(request.status) && (
                                <div className="mt-7 border-t border-slate-200 pt-6">
                                    <div className="mb-5">
                                        <h3 className="text-lg font-bold text-slate-900">Payment Schedule</h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Review each installment and upload the transaction receipt after making the payment.
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-indigo-700">
                                            Payment Terms: {
                                                request.fto.paymentTerm === "FULL"
                                                    ? "100% after FTO acceptance"
                                                    : request.fto.paymentTerm === "HALF_QUARTER_QUARTER"
                                                        ? "50% after FTO acceptance, 25% at training commencement, 25% before final batch"
                                                        : "50% after FTO acceptance, 50% before final scheduled batch"
                                            }
                                        </p>
                                    </div>

                                    {paymentMessage && (
                                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                                            {paymentMessage}
                                        </div>
                                    )}
                                    {paymentError && (
                                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                            {paymentError}
                                        </div>
                                    )}

                                    {request.fto?.paymentInstallments?.length ? (
                                        <div className="space-y-4">
                                            {request.fto?.paymentInstallments.map((installment) => {
                                                const latestSubmission = installment.submissions?.[0]
                                                const canSubmit = installment.status === "PENDING" || installment.status === "REJECTED"

                                                return (
                                                    <div key={installment.id} className="rounded-xl border border-slate-200 p-5">
                                                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                                            <div>
                                                                <p className="font-semibold text-slate-900">
                                                                    Installment {installment.installmentNumber}
                                                                </p>
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {installment.percentage}% · {installment.milestone.replaceAll("_", " ")}
                                                                </p>
                                                            </div>
                                                            <div className="sm:text-right">
                                                                <p className="text-xl font-bold text-slate-900">
                                                                    {formatCurrency(installment.amount, request.fto?.currency ?? "INR")}
                                                                </p>
                                                                <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    installment.status === "VERIFIED"
                                                                        ? "bg-emerald-50 text-emerald-700"
                                                                        : installment.status === "REJECTED"
                                                                            ? "bg-red-50 text-red-700"
                                                                            : installment.status === "SUBMITTED"
                                                                                ? "bg-amber-50 text-amber-700"
                                                                                : "bg-slate-100 text-slate-700"
                                                                }`}>
                                                                    {formatStatus(installment.status)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {latestSubmission && (
                                                            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
                                                                <p className="font-medium text-slate-700">
                                                                    Latest submission: {latestSubmission.paymentMethod} · Ref: {latestSubmission.transactionReference}
                                                                </p>
                                                                {latestSubmission.adminRemarks && (
                                                                    <p className="mt-1 text-red-700">
                                                                        Admin remarks: {latestSubmission.adminRemarks}
                                                                    </p>
                                                                )}
                                                                {latestSubmission.status === "PENDING" && (
                                                                    <p className="mt-1 text-amber-700">Receipt submitted and awaiting verification.</p>
                                                                )}
                                                                {latestSubmission.status === "VERIFIED" && (
                                                                    <p className="mt-1 text-emerald-700">This installment has been verified.</p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {canSubmit ? (
                                                            <form
                                                                className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2"
                                                                onSubmit={(event) => void submitInstallmentPayment(event, installment.id)}
                                                            >
                                                                <div>
                                                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label>
                                                                    <select
                                                                        name="paymentMethod"
                                                                        required
                                                                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500"
                                                                        defaultValue=""
                                                                    >
                                                                        <option value="" disabled>Select payment method</option>
                                                                        <option value="Bank Transfer">Bank Transfer</option>
                                                                        <option value="NEFT">NEFT</option>
                                                                        <option value="RTGS">RTGS</option>
                                                                        <option value="IMPS">IMPS</option>
                                                                        <option value="UPI">UPI</option>
                                                                        <option value="Other">Other</option>
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Transaction Reference / UTR</label>
                                                                    <input
                                                                        name="transactionReference"
                                                                        required
                                                                        maxLength={150}
                                                                        placeholder="Enter UTR / transaction ID"
                                                                        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount Paid ({request.fto?.currency ?? "INR"})</label>
                                                                    <input
                                                                        name="amountPaid"
                                                                        type="number"
                                                                        required
                                                                        min="0.01"
                                                                        step="0.01"
                                                                        defaultValue={installment.amount}
                                                                        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Receipt</label>
                                                                    <input
                                                                        name="receipt"
                                                                        type="file"
                                                                        required
                                                                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                                                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                                                    />
                                                                    <p className="mt-1 text-xs text-slate-500">PDF, JPG or PNG · Maximum 5 MB</p>
                                                                </div>

                                                                <div className="md:col-span-2">
                                                                    <button
                                                                        type="submit"
                                                                        disabled={paymentSubmittingId !== null}
                                                                        className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        {paymentSubmittingId === installment.id ? "Submitting..." : "Submit Payment"}
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <p className="mt-4 text-sm text-slate-500">
                                                                {installment.status === "VERIFIED"
                                                                    ? "Payment verified. No further action is required for this installment."
                                                                    : "Payment has been submitted and is awaiting verification."}
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                            Payment schedule is not available yet. Please contact NLETA if this message continues.
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </Section>


                {/* PROFESSIONAL TRAINING AGREEMENT */}
                <Section title="Professional Training Agreement (PTA)">
                    {!request.pta ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
                            <FileText className="mx-auto size-8 text-slate-400" />
                            <h3 className="mt-3 font-semibold text-slate-800">PTA Not Available Yet</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Your Professional Training Agreement will appear here once NLETA sends it.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                    <div>
                                        <p className="text-xs text-slate-500">PTA Number</p>
                                        <p className="mt-1 font-mono font-bold text-slate-900">{request.pta.ptaNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Effective Date</p>
                                        <p className="mt-1 font-semibold text-slate-900">{formatDate(request.pta.effectiveDate)}</p>
                                    </div>
                                    <span className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                        request.pta.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" :
                                        request.pta.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                        "bg-cyan-100 text-cyan-700"
                                    }`}>
                                        {formatStatus(`PTA_${request.pta.status}` === "PTA_GENERATED" ? "PTA_SENT" : `PTA_${request.pta.status}`)}
                                    </span>
                                </div>
                                <div className="mt-4 grid gap-3 border-t border-indigo-100 pt-4 sm:grid-cols-2">
                                    <Info label="Generated On" value={formatDate(request.pta.generatedAt)} />
                                    <Info label="Sent On" value={formatDate(request.pta.sentAt)} />
                                </div>
                            </div>

                            {["SENT", "ACCEPTED", "REJECTED"].includes(request.pta.status) && (
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href={`/api/client/requests/${request.id}/pta/pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                    >
                                        <FileText className="size-4" />
                                        View PTA PDF
                                    </a>

                                    <a
                                        href={`/api/client/requests/${request.id}/pta/pdf?download=1`}
                                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <FileText className="size-4" />
                                        Download PTA PDF
                                    </a>
                                </div>
                            )}

                            {request.pta.status === "SENT" && (
                                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-5">
                                    <h3 className="font-semibold text-slate-900">Review and Respond to PTA</h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Please review and download the agreement before accepting or rejecting it.
                                    </p>
                                    {ptaDecisionError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{ptaDecisionError}</p>}
                                    {ptaDecisionMessage && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{ptaDecisionMessage}</p>}

                                    {showPtaRejectForm ? (
                                        <div className="mt-4 space-y-3">
                                            <label htmlFor="pta-rejection-reason" className="block text-sm font-semibold text-slate-700">Reason for rejection</label>
                                            <textarea id="pta-rejection-reason" value={ptaRejectionReason}
                                                onChange={(event) => setPtaRejectionReason(event.target.value)} rows={4} maxLength={2000}
                                                placeholder="Please explain why you are rejecting this PTA (minimum 10 characters)."
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                                            <div className="flex flex-wrap gap-3">
                                                <button type="button" onClick={() => void submitPtaDecision("REJECT")}
                                                    disabled={ptaDecisionLoading || ptaRejectionReason.trim().length < 10}
                                                    className="inline-flex h-11 items-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                                                    {ptaDecisionLoading ? "Submitting..." : "Confirm Rejection"}
                                                </button>
                                                <button type="button" onClick={() => { setShowPtaRejectForm(false); setPtaDecisionError("") }} disabled={ptaDecisionLoading}
                                                    className="inline-flex h-11 items-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button type="button" onClick={() => void submitPtaDecision("ACCEPT")} disabled={ptaDecisionLoading}
                                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                                                <CheckCircle2 className="size-4" /> {ptaDecisionLoading ? "Submitting..." : "Accept PTA"}
                                            </button>
                                            <button type="button" onClick={() => { setShowPtaRejectForm(true); setPtaDecisionError("") }} disabled={ptaDecisionLoading}
                                                className="inline-flex h-11 items-center rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 hover:bg-red-50">Reject PTA</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {request.pta.status === "ACCEPTED" && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                    You have accepted the PTA. NLETA can now proceed with TAF generation.
                                </div>
                            )}
                            {request.pta.status === "REJECTED" && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                                    You have rejected the PTA. NLETA will review your feedback.
                                    {request.pta.status === "REJECTED" && <p className="mt-1">Please contact NLETA if you need to discuss the agreement.</p>}
                                </div>
                            )}
                        </div>
                    )}
                </Section>

                {/* TRAINING ACTIVATION FORM */}
                <Section title="Training Activation Form (TAF)">
                    {!request.taf ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
                            <FileText className="mx-auto size-8 text-slate-400" />
                            <h3 className="mt-3 font-semibold text-slate-800">TAF Not Available Yet</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Your Training Activation Form will appear here once NLETA generates and sends it.
                            </p>
                            {request.pta?.status === "ACCEPTED" && (
                                <p className="mt-3 text-sm font-medium text-indigo-700">
                                    Your PTA is accepted. NLETA can now prepare your TAF.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                    <div>
                                        <p className="text-xs text-slate-500">TAF Number</p>
                                        <p className="mt-1 font-mono font-bold text-slate-900">{request.taf.tafNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Generated On</p>
                                        <p className="mt-1 font-semibold text-slate-900">{formatDate(request.taf.generatedAt)}</p>
                                    </div>
                                    <span className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                        request.taf.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" :
                                        request.taf.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                        request.taf.status === "SENT" ? "bg-cyan-100 text-cyan-700" :
                                        "bg-amber-100 text-amber-700"
                                    }`}>
                                        {formatStatus(`TAF_${request.taf.status}`)}
                                    </span>
                                </div>
                                <div className="mt-4 grid gap-3 border-t border-indigo-100 pt-4 sm:grid-cols-2">
                                    <Info label="Generated On" value={formatDate(request.taf.generatedAt)} />
                                    <Info label="Sent On" value={formatDate(request.taf.sentAt)} />
                                </div>
                            </div>

                            {request.taf.status !== "GENERATED" && (
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href={`/api/client/requests/${request.id}/taf/pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                    >
                                        <FileText className="size-4" /> View TAF PDF
                                    </a>
                                    <a
                                        href={`/api/client/requests/${request.id}/taf/pdf?download=1`}
                                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <FileText className="size-4" /> Download TAF PDF
                                    </a>
                                </div>
                            )}

                            {request.taf.status === "SENT" && (
                                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-5">
                                    <h3 className="font-semibold text-slate-900">Review and Respond to TAF</h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Please review the Training Activation Form and PDF carefully before accepting or rejecting it.
                                    </p>
                                    {tafDecisionError && (
                                        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{tafDecisionError}</p>
                                    )}
                                    {tafDecisionMessage && (
                                        <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{tafDecisionMessage}</p>
                                    )}

                                    {showTafRejectForm ? (
                                        <div className="mt-4 space-y-3">
                                            <label htmlFor="taf-rejection-reason" className="block text-sm font-semibold text-slate-700">
                                                Reason for rejection
                                            </label>
                                            <textarea
                                                id="taf-rejection-reason"
                                                value={tafRejectionReason}
                                                onChange={(event) => setTafRejectionReason(event.target.value)}
                                                rows={4}
                                                maxLength={2000}
                                                placeholder="Please explain why you are rejecting this TAF (minimum 10 characters)."
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            />
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => void submitTafDecision("REJECT")}
                                                    disabled={tafDecisionLoading || tafRejectionReason.trim().length < 10}
                                                    className="inline-flex h-11 items-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {tafDecisionLoading ? "Submitting..." : "Confirm Rejection"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowTafRejectForm(false); setTafDecisionError("") }}
                                                    disabled={tafDecisionLoading}
                                                    className="inline-flex h-11 items-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => void submitTafDecision("ACCEPT")}
                                                disabled={tafDecisionLoading}
                                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="size-4" />
                                                {tafDecisionLoading ? "Submitting..." : "Accept TAF"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setShowTafRejectForm(true); setTafDecisionError("") }}
                                                disabled={tafDecisionLoading}
                                                className="inline-flex h-11 items-center rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 hover:bg-red-50"
                                            >
                                                Reject TAF
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {request.taf.status === "GENERATED" && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                    Your TAF has been generated and is awaiting dispatch by NLETA. You will be able to review and respond once it is sent.
                                </div>
                            )}
                            {request.taf.status === "ACCEPTED" && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                    You have accepted the TAF. NLETA can now proceed with trainer assignment.
                                </div>
                            )}
                            {request.taf.status === "REJECTED" && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                                    You have rejected the TAF. NLETA will review your feedback and contact you.
                                </div>
                            )}
                        </div>
                    )}
                </Section>

            </div>
        </DashboardShell>
    )
}

function SummaryCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
                <span className="text-sm">{label}</span>
                <span className="text-indigo-600">{icon}</span>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-900">
                {value}
            </p>
        </div>
    )
}

function Section({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                <h2 className="font-bold text-slate-900">{title}</h2>
            </div>

            <div className="p-5 md:p-6">{children}</div>
        </section>
    )
}

function Info({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
                {label}
            </p>

            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                {value}
            </p>
        </div>
    )
}

function AmountRow({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="flex justify-between gap-4 text-slate-600">
            <span>{label}</span>
            <span className="text-right font-medium text-slate-800">
                {value}
            </span>
        </div>
    )
}
