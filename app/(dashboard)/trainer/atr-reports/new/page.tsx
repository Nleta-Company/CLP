"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  Save,
} from "lucide-react";

type Program = {
  id: string;
  code: string;
  title: string;
  category?: string | null;
  audience?: string | null;
  duration?: string | null;
  mode?: string | null;
};

type RequestProgram = {
  id: string;
  participants: number;
  expectedBatches: number;
  program: Program;
};

type Assignment = {
  id: string;
  status: string;
  request: {
    id: string;
    requestNumber: string;
    organisation: string | null;
    trainingLocation: string;
    preferredDate: string | null;
    alternateDate: string | null;
    contactName: string | null;
    phone: string | null;
    email: string | null;
    client: { name: string; email: string };
    ptaAgreement?: { ptaNumber: string; status: string; effectiveDate?: string | null } | null;
    tafAgreement?: { tafNumber: string; status: string; clientDecisionAt?: string | null } | null;
    finalTrainingOffer?: { ftoNumber: string; issueDate?: string | null } | null;
    programs: RequestProgram[];
  };
  requestProgram: RequestProgram | null;
  assignedPrograms: RequestProgram[];
};

type FormState = {
  trainerAssignmentId: string;
  requestProgramId: string;
  clientLegalEntity: string;
  clientContactDepartment: string;
  ptaReference: string;
  ptaDate: string;
  ftfReference: string;
  ftfRevision: string;
  ftfAcceptanceDate: string;
  tafReference: string;
  tafActivationDate: string;
  tspReference: string;
  programmeSpecification: string;
  programmeRevision: string;
  deliveryMode: string;
  trainingStartDate: string;
  trainingEndDate: string;
  actualDuration: string;
  venueOrPlatform: string;
  trainerName: string;
  trainerRole: string;
  trainerQualificationRef: string;
  registeredParticipants: string;
  trainingDelivery: string;
  deliveryDeviations: string;
  tarReference: string;
  participantsAttended: string;
  participantsMeetingRequirement: string;
  attendanceNotes: string;
  attendanceRequirementSource: string;
  assessmentCriteria: string;
  participantResults: string;
  cohortSummary: string;
  trainerObservations: string;
  preparedByName: string;
  preparedByRole: string;
  linkedDeliverables: string;
  clientHandoverRef: string;
  clientHandoverDate: string;
};

const emptyForm: FormState = {
  trainerAssignmentId: "",
  requestProgramId: "",
  clientLegalEntity: "",
  clientContactDepartment: "",
  ptaReference: "",
  ptaDate: "",
  ftfReference: "",
  ftfRevision: "",
  ftfAcceptanceDate: "",
  tafReference: "",
  tafActivationDate: "",
  tspReference: "",
  programmeSpecification: "",
  programmeRevision: "",
  deliveryMode: "",
  trainingStartDate: "",
  trainingEndDate: "",
  actualDuration: "",
  venueOrPlatform: "",
  trainerName: "",
  trainerRole: "",
  trainerQualificationRef: "",
  registeredParticipants: "",
  trainingDelivery: "[]",
  deliveryDeviations: "[]",
  tarReference: "",
  participantsAttended: "",
  participantsMeetingRequirement: "",
  attendanceNotes: "",
  attendanceRequirementSource: "",
  assessmentCriteria: "[]",
  participantResults: "[]",
  cohortSummary: "{}",
  trainerObservations: "[]",
  preparedByName: "",
  preparedByRole: "",
  linkedDeliverables: "[]",
  clientHandoverRef: "",
  clientHandoverDate: "",
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

const labelClass = "block text-sm font-medium text-slate-700";

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
            {number}
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  readOnly = false,
  wide = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={`${labelClass} ${wide ? "sm:col-span-2" : ""}`}>
      {label} {required && <span className="text-red-500">*</span>}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        className={`${inputClass} ${readOnly ? "bg-slate-50 text-slate-500" : ""}`}
      />
    </label>
  );
}

function JsonField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help: string;
}) {
  return (
    <label className={`${labelClass} sm:col-span-2`}>
      {label}
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} resize-y font-mono text-xs leading-5`}
      />
      <span className="mt-1 block text-xs font-normal text-slate-500">{help}</span>
    </label>
  );
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function parseJson(value: string, label: string) {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must contain valid JSON.`);
  }
}

export default function AtrReportFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedAssignmentId = searchParams.get("assignmentId") ?? "";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reportId, setReportId] = useState("");

  const selectedAssignment = useMemo(
    () => assignments.find((item) => item.id === form.trainerAssignmentId) ?? null,
    [assignments, form.trainerAssignmentId]
  );

  const availablePrograms = selectedAssignment?.assignedPrograms ?? [];

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/trainer/assignments", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load trainer assignments.");
      }

      const eligible = (result.assignments ?? []).filter(
        (item: Assignment) => ["ACCEPTED", "COMPLETED"].includes(item.status)
      );

      setAssignments(eligible);

      const initial = eligible.find(
        (item: Assignment) => item.id === requestedAssignmentId
      ) ?? eligible[0];

      if (initial) {
        const program = initial.assignedPrograms?.[0];
        setForm((current) => ({
          ...current,
          trainerAssignmentId: initial.id,
          requestProgramId: initial.requestProgram?.id ?? program?.id ?? "",
          clientLegalEntity: initial.request.organisation ?? "",
          clientContactDepartment: initial.request.contactName ?? "",
          ptaReference: initial.request.ptaAgreement?.ptaNumber ?? "",
          ptaDate: toDateInput(initial.request.ptaAgreement?.effectiveDate),
          ftfReference: initial.request.finalTrainingOffer?.ftoNumber ?? "",
          ftfAcceptanceDate: toDateInput(initial.request.finalTrainingOffer?.issueDate),
          tafReference: initial.request.tafAgreement?.tafNumber ?? "",
          tafActivationDate: toDateInput(initial.request.tafAgreement?.clientDecisionAt),
          venueOrPlatform: initial.request.trainingLocation ?? "",
          trainerName: current.trainerName || "",
          preparedByName: current.preparedByName || "",
          registeredParticipants: String(program?.participants ?? ""),
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  }, [requestedAssignmentId]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  function selectAssignment(assignmentId: string) {
    const assignment = assignments.find((item) => item.id === assignmentId);
    const program = assignment?.assignedPrograms?.[0];

    setForm((current) => ({
      ...emptyForm,
      trainerAssignmentId: assignmentId,
      requestProgramId: assignment?.requestProgram?.id ?? program?.id ?? "",
      clientLegalEntity: assignment?.request.organisation ?? "",
      clientContactDepartment: assignment?.request.contactName ?? "",
      ptaReference: assignment?.request.ptaAgreement?.ptaNumber ?? "",
      ptaDate: toDateInput(assignment?.request.ptaAgreement?.effectiveDate),
      ftfReference: assignment?.request.finalTrainingOffer?.ftoNumber ?? "",
      ftfAcceptanceDate: toDateInput(assignment?.request.finalTrainingOffer?.issueDate),
      tafReference: assignment?.request.tafAgreement?.tafNumber ?? "",
      tafActivationDate: toDateInput(assignment?.request.tafAgreement?.clientDecisionAt),
      venueOrPlatform: assignment?.request.trainingLocation ?? "",
      registeredParticipants: String(program?.participants ?? ""),
    }));
    setReportId("");
    setError("");
    setSuccess("");
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!form.trainerAssignmentId) {
        throw new Error("Please select an accepted trainer assignment.");
      }

      const payload = {
        ...(reportId ? { reportId } : { trainerAssignmentId: form.trainerAssignmentId }),
        requestProgramId: form.requestProgramId || null,
        clientLegalEntity: form.clientLegalEntity || null,
        clientContactDepartment: form.clientContactDepartment || null,
        ptaReference: form.ptaReference || null,
        ptaDate: form.ptaDate || null,
        ftfReference: form.ftfReference || null,
        ftfRevision: form.ftfRevision || null,
        ftfAcceptanceDate: form.ftfAcceptanceDate || null,
        tafReference: form.tafReference || null,
        tafActivationDate: form.tafActivationDate || null,
        tspReference: form.tspReference || null,
        programmeSpecification: form.programmeSpecification || null,
        programmeRevision: form.programmeRevision || null,
        deliveryMode: form.deliveryMode || null,
        trainingStartDate: form.trainingStartDate || null,
        trainingEndDate: form.trainingEndDate || null,
        actualDuration: form.actualDuration || null,
        venueOrPlatform: form.venueOrPlatform || null,
        trainerName: form.trainerName || null,
        trainerRole: form.trainerRole || null,
        trainerQualificationRef: form.trainerQualificationRef || null,
        registeredParticipants: form.registeredParticipants === "" ? null : Number(form.registeredParticipants),
        trainingDelivery: parseJson(form.trainingDelivery, "Training delivery"),
        deliveryDeviations: parseJson(form.deliveryDeviations, "Delivery deviations"),
        tarReference: form.tarReference || null,
        participantsAttended: form.participantsAttended === "" ? null : Number(form.participantsAttended),
        participantsMeetingRequirement: form.participantsMeetingRequirement === "" ? null : Number(form.participantsMeetingRequirement),
        attendanceNotes: form.attendanceNotes || null,
        attendanceRequirementSource: form.attendanceRequirementSource || null,
        assessmentCriteria: parseJson(form.assessmentCriteria, "Assessment criteria"),
        participantResults: parseJson(form.participantResults, "Participant results"),
        cohortSummary: parseJson(form.cohortSummary, "Cohort summary"),
        trainerObservations: parseJson(form.trainerObservations, "Trainer observations"),
        preparedByName: form.preparedByName || null,
        preparedByRole: form.preparedByRole || null,
        linkedDeliverables: parseJson(form.linkedDeliverables, "Linked deliverables"),
        clientHandoverRef: form.clientHandoverRef || null,
        clientHandoverDate: form.clientHandoverDate || null,
      };

      const response = await fetch("/api/trainer/atr-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save ATR-01 draft.");
      }

      if (result.report?.id) setReportId(result.report.id);
      setSuccess(result.message || "ATR-01 draft saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        Loading trainer assignments...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <p className="text-xs font-bold tracking-[0.18em] text-teal-700">TRAINER WORKSPACE</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            ATR-01 Report
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Assessment & Training Result Report · Controlled Template · Revision 2
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          <FileText className="size-5" />
          {reportId ? "Draft saved" : "New report draft"}
        </div>
      </div>

      {error && (
        <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="size-5 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="size-5 shrink-0" /> {success}
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <ClipboardList className="mx-auto size-10 text-slate-300" />
          <h2 className="mt-4 font-semibold text-slate-900">No eligible assignments</h2>
          <p className="mt-2 text-sm text-slate-500">
            ATR-01 can be created after a trainer assignment is accepted.
          </p>
        </div>
      ) : (
        <form onSubmit={saveDraft} className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Report assignment</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Select accepted assignment <span className="text-red-500">*</span>
                <select
                  required
                  value={form.trainerAssignmentId}
                  onChange={(event) => selectAssignment(event.target.value)}
                  className={inputClass}
                >
                  {assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.request.requestNumber} — {assignment.request.organisation || assignment.request.client.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Programme
                <select
                  value={form.requestProgramId}
                  onChange={(event) => update("requestProgramId", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select programme</option>
                  {availablePrograms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.program.code} — {item.program.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {selectedAssignment && (
              <p className="mt-3 text-xs text-slate-500">
                Request: {selectedAssignment.request.requestNumber} · Client: {selectedAssignment.request.client.name}
              </p>
            )}
          </section>

          <Section number="1" title="Purpose and Reporting Boundary" description="Fixed controlled-template statement. This report records actual training and assessment evidence only.">
            <div className="sm:col-span-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              ATR-01 records the training delivered, attendance summary, assessment method and criteria, individual or cohort results, trainer observations, and recommended follow-up. Do not invent pass marks, assessment thresholds, competencies, attendance percentages, or results. This report is not a statutory lift/escalator inspection report or government-issued qualification.
            </div>
          </Section>

          <Section number="2" title="Client, Engagement and Batch References">
            <Field label="Client legal entity" value={form.clientLegalEntity} onChange={(v) => update("clientLegalEntity", v)} />
            <Field label="Client contact / department" value={form.clientContactDepartment} onChange={(v) => update("clientContactDepartment", v)} />
            <Field label="PTA-01 reference" value={form.ptaReference} onChange={(v) => update("ptaReference", v)} />
            <Field label="PTA date" type="date" value={form.ptaDate} onChange={(v) => update("ptaDate", v)} />
            <Field label="FTF reference" value={form.ftfReference} onChange={(v) => update("ftfReference", v)} />
            <Field label="FTF revision" value={form.ftfRevision} onChange={(v) => update("ftfRevision", v)} />
            <Field label="FTF acceptance date" type="date" value={form.ftfAcceptanceDate} onChange={(v) => update("ftfAcceptanceDate", v)} />
            <Field label="TAF-01 reference" value={form.tafReference} onChange={(v) => update("tafReference", v)} />
            <Field label="TAF activation date" type="date" value={form.tafActivationDate} onChange={(v) => update("tafActivationDate", v)} />
            <Field label="TSP-01 reference" value={form.tspReference} onChange={(v) => update("tspReference", v)} />
            <Field label="Programme specification / revision" value={form.programmeSpecification} onChange={(v) => update("programmeSpecification", v)} />
            <Field label="Programme revision" value={form.programmeRevision} onChange={(v) => update("programmeRevision", v)} />
            <label className={labelClass}>
              Delivery mode
              <select value={form.deliveryMode} onChange={(e) => update("deliveryMode", e.target.value)} className={inputClass}>
                <option value="">Select mode</option>
                <option value="ON">ON — On-site</option>
                <option value="OF">OF — Online</option>
                <option value="HY">HY — Hybrid</option>
              </select>
            </label>
            <Field label="Training start date" type="date" value={form.trainingStartDate} onChange={(v) => update("trainingStartDate", v)} />
            <Field label="Training end date" type="date" value={form.trainingEndDate} onChange={(v) => update("trainingEndDate", v)} />
            <Field label="Actual duration" value={form.actualDuration} onChange={(v) => update("actualDuration", v)} placeholder="e.g. 2 days / 8 hours" />
            <Field label="Venue / platform" value={form.venueOrPlatform} onChange={(v) => update("venueOrPlatform", v)} />
            <Field label="Trainer / assessor name" value={form.trainerName} onChange={(v) => update("trainerName", v)} />
            <Field label="Trainer role" value={form.trainerRole} onChange={(v) => update("trainerRole", v)} />
            <Field label="Qualification reference (if applicable)" value={form.trainerQualificationRef} onChange={(v) => update("trainerQualificationRef", v)} />
            <Field label="Registered participants" type="number" value={form.registeredParticipants} onChange={(v) => update("registeredParticipants", v)} />
          </Section>

          <Section number="3" title="Training Delivery Summary" description="Add JSON rows with topic, plannedCoverage, deliveredEvidence, status and comments. Status should be COMPLETE, PARTIAL or NOT_DELIVERED.">
            <JsonField label="Topic / learning outcome delivery rows" value={form.trainingDelivery} onChange={(v) => update("trainingDelivery", v)} help={'Example: [{"topic":"Approved topic","plannedCoverage":"As specified","deliveredEvidence":"Actual evidence","status":"COMPLETE","comments":""}]'} />
            <JsonField label="Delivery deviations / issues" value={form.deliveryDeviations} onChange={(v) => update("deliveryDeviations", v)} help={'Example: [{"deviation":"None","impact":"N/A","approvalReference":"N/A","actionOwner":"N/A"}]'} />
          </Section>

          <Section number="4" title="Attendance Summary" description="TAR-01 remains the participant-level attendance record. ATR-01 summarises it.">
            <Field label="TAR-01 attendance register reference" value={form.tarReference} onChange={(v) => update("tarReference", v)} />
            <Field label="Participants attended" type="number" value={form.participantsAttended} onChange={(v) => update("participantsAttended", v)} />
            <Field label="Meeting attendance requirement (if specified)" type="number" value={form.participantsMeetingRequirement} onChange={(v) => update("participantsMeetingRequirement", v)} />
            <Field label="Attendance requirement source" value={form.attendanceRequirementSource} onChange={(v) => update("attendanceRequirementSource", v)} placeholder="Approved programme spec. / accepted FTF / Not specified" />
            <Field label="Absence, late arrival or early departure notes" value={form.attendanceNotes} onChange={(v) => update("attendanceNotes", v)} wide />
          </Section>

          <Section number="5" title="Assessment Method and Approved Criteria" description="Do not create or assume a pass mark. If criteria are missing or unauthorised, record that approval is required.">
            <JsonField label="Assessment elements and approved criteria" value={form.assessmentCriteria} onChange={(v) => update("assessmentCriteria", v)} help={'Example: [{"element":"Knowledge assessment","method":"Approved quiz","criterion":"As per approved specification","source":"Programme spec. Rev.1","applied":true,"evidenceReference":"E-01"}]'} />
          </Section>

          <Section number="6" title="Participant-Level Result Register" description="Use participant IDs where names are not necessary. Do not add unnecessary personal data.">
            <JsonField label="Participant results" value={form.participantResults} onChange={(v) => update("participantResults", v)} help={'Example: [{"participantId":"P-001","attendanceStatus":"PRESENT","assessmentResult":"As per approved rubric","outcomeStatus":"NOT_ASSESSED","evidenceRemarks":"Evidence reference"}]'} />
          </Section>

          <Section number="7" title="Cohort Result Summary" description="Enter counts supported by the participant result register and approved criteria.">
            <JsonField label="Cohort result counts and basis" value={form.cohortSummary} onChange={(v) => update("cohortSummary", v)} help={'Example: {"registered":25,"attended":23,"assessed":0,"pass":0,"notYetCompetent":0,"incomplete":23,"certificatesRecommended":0,"basis":"Pending approved criteria"}'} />
          </Section>

          <Section number="8" title="Trainer / Assessor Observations and Follow-up">
            <JsonField label="Observations, evidence, recommended actions and owner" value={form.trainerObservations} onChange={(v) => update("trainerObservations", v)} help={'Example: [{"observation":"Evidence-based observation","evidence":"Evidence reference","recommendedAction":"Refresher / coaching / reassessment","owner":"Owner","dueDate":"YYYY-MM-DD"}]'} />
          </Section>

          <Section number="9" title="Result Review and Approval" description="This section is completed by the authorised reviewer. Trainer cannot approve their own report.">
            <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Review status: Pending reviewer action. Sub Admin / authorised programme reviewer will record the decision, review notes and approval evidence after the report is submitted.
            </div>
            <Field label="Prepared by — trainer / assessor" value={form.preparedByName} onChange={(v) => update("preparedByName", v)} />
            <Field label="Prepared by role" value={form.preparedByRole} onChange={(v) => update("preparedByRole", v)} />
          </Section>

          <Section number="10" title="Linked Deliverables and Closure Handover">
            <JsonField label="Linked deliverables" value={form.linkedDeliverables} onChange={(v) => update("linkedDeliverables", v)} help={'Example: [{"record":"TAR-01","reference":"TAR-001","status":"Complete","notes":"Attendance evidence"}]'} />
            <Field label="Client handover / transmittal reference" value={form.clientHandoverRef} onChange={(v) => update("clientHandoverRef", v)} />
            <Field label="Client handover date" type="date" value={form.clientHandoverDate} onChange={(v) => update("clientHandoverDate", v)} />
          </Section>

          <Section number="11" title="Record Handling and Document Control">
            <div className="sm:col-span-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Store ATR-01 with the accepted PTA-01, FTF, TAF-01, approved programme specification and assessment criteria, trainer delivery evidence, TAR-01, result evidence, approved changes, and related CTR-01 / TCR-01 records. Apply NLETA access, retention, secure-transfer and disposal controls. Commercial scope remains governed by the executed PTA-01, accepted FTF and valid written change orders.
              <p className="mt-2 font-semibold text-slate-700">
                NLETA | ATR-01 | Rev.2 | Uncontrolled when printed unless verified against the current controlled master.
              </p>
            </div>
          </Section>

          <div className="sticky bottom-3 z-10 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Draft only.</span> Saving does not submit the report for approval.
            </p>
            <button
              type="submit"
              disabled={saving || !form.trainerAssignmentId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Saving..." : reportId ? "Update Draft" : "Save Draft"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
