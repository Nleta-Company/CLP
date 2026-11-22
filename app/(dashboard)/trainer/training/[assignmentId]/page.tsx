
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  MapPin,
  RefreshCw,
  Users,
  BookOpen,
  AlertCircle,
  Layers3,
} from "lucide-react";

type Program = {
  id: string;
  participants: number;
  expectedBatches: number;
  program: {
    code: string;
    title: string;
    category: string;
    duration: string;
  };
};

type Assignment = {
  id: string;
  status: string;
  assignmentScope: "ENTIRE_REQUEST" | "SPECIFIC_PROGRAMME";
  assignedAt: string;
  remarks: string | null;
  assignedPrograms: Program[];
  request: {
    id: string;
    requestNumber: string;
    organisation: string | null;
    trainingLocation: string | null;
    preferredDate: string | null;
    alternateDate?: string | null;
    client: {
      name: string;
      email: string;
    };
    tafAgreement: {
      tafNumber: string;
      status: string;
    } | null;
  };
};

type ApiResponse = {
  success: boolean;
  message?: string;
  assignments: Assignment[];
};

type Batch = {
  id: string;
  batchNumber: number;
  participants: number;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate: string | null;
  endDate: string | null;
  mode: string | null;
  location: string | null;
  requestProgram: {
    program: {
      code: string;
      title: string;
    };
  };
};

type BatchApiResponse = {
  success: boolean;
  message?: string;
  batches: Batch[];
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getBatchStatusStyle(status: string) {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "PLANNED":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function TrainerTrainingWorkspacePage() {
  const params = useParams<{ assignmentId: string }>();
  const router = useRouter();

  const assignmentId = params.assignmentId;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);

  const [loading, setLoading] = useState(true);
  const [batchesLoading, setBatchesLoading] = useState(false);

  const [error, setError] = useState("");
  const [batchesError, setBatchesError] = useState("");

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setBatchesError("");
      setBatches([]);

      const response = await fetch("/api/trainer/assignments", {
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load training assignment."
        );
      }

      const selectedAssignment = result.assignments.find(
        (item) => item.id === assignmentId
      );

      if (!selectedAssignment) {
        throw new Error("Training assignment not found.");
      }

      if (
        selectedAssignment.status !== "ACCEPTED" &&
        selectedAssignment.status !== "COMPLETED"
      ) {
        throw new Error(
          "Training workspace is available only for accepted assignments."
        );
      }

      setAssignment(selectedAssignment);

      // Load batches belonging only to this assignment.
      setBatchesLoading(true);

      try {
        const batchResponse = await fetch(
          `/api/trainer/batches?assignmentId=${encodeURIComponent(
            assignmentId
          )}`,
          {
            cache: "no-store",
          }
        );

        const batchResult: BatchApiResponse =
          await batchResponse.json();

        if (!batchResponse.ok || !batchResult.success) {
          throw new Error(
            batchResult.message || "Unable to load assigned batches."
          );
        }

        setBatches(batchResult.batches || []);
      } catch (batchError) {
        setBatchesError(
          batchError instanceof Error
            ? batchError.message
            : "Unable to load batches."
        );
      } finally {
        setBatchesLoading(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (assignmentId) {
      void fetchAssignment();
    }
  }, [assignmentId, fetchAssignment]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-teal-700" />
          <p className="mt-3 text-sm text-slate-500">
            Loading training workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-6 text-red-600" />

            <div>
              <h2 className="font-bold text-red-800">
                Unable to open Training Workspace
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {error || "Assignment details are unavailable."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => void fetchAssignment()}
                  className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                >
                  Try Again
                </button>

                <button
                  onClick={() => router.push("/trainer")}
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalParticipants = assignment.assignedPrograms.reduce(
    (total, item) => total + (item.participants || 0),
    0
  );

  const totalBatches = assignment.assignedPrograms.reduce(
    (total, item) => total + (item.expectedBatches || 0),
    0
  );

  const workflow = [
    {
      number: "01",
      title: "Training Overview",
      description: "Review assignment, client and programme details.",
      icon: BookOpen,
      status: "AVAILABLE",
    },
    {
      number: "02",
      title: "Attendance – TAR-01",
      description: "Manage participant attendance for training sessions.",
      icon: Users,
      status: "AVAILABLE",
    },
    {
      number: "03",
      title: "Assessment & Results",
      description: "Record participant assessment and learning outcomes.",
      icon: ClipboardCheck,
      status: "UPCOMING",
    },
    {
      number: "04",
      title: "ATR-01 Report",
      description:
        "Prepare and submit the Assessment & Training Result Report.",
      icon: FileText,
      status: "UPCOMING",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/trainer"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-700"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>

          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Trainer Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Training Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your accepted assignment and complete the training workflow.
          </p>
        </div>

        <button
          onClick={() => void fetchAssignment()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {/* ASSIGNMENT SUMMARY */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white p-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                {assignment.status}
              </span>

              <span className="text-xs font-medium text-slate-500">
                {assignment.request.requestNumber}
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              {assignment.request.organisation ||
                assignment.request.client.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Client: {assignment.request.client.name}
            </p>
          </div>

          <div className="rounded-xl border border-teal-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">
              TAF Reference
            </p>

            <p className="mt-1 text-lg font-bold text-teal-800">
              {assignment.request.tafAgreement?.tafNumber || "Unavailable"}
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarDays className="size-4" />
              <span className="text-xs font-medium uppercase">
                Preferred Date
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              {formatDate(assignment.request.preferredDate)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="size-4" />
              <span className="text-xs font-medium uppercase">
                Training Location
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              {assignment.request.trainingLocation || "Not specified"}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="size-4" />
              <span className="text-xs font-medium uppercase">
                Participants
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              {totalParticipants}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <GraduationCap className="size-4" />
              <span className="text-xs font-medium uppercase">
                Expected Batches
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              {totalBatches}
            </p>
          </div>
        </div>
      </section>

      {/* TRAINING WORKFLOW */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Training Workflow
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Complete the training activities and reporting steps in sequence.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {workflow.map((step) => {
            const Icon = step.icon;
            const isAvailable = step.status === "AVAILABLE";

            return (
              <div
                key={step.number}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                  isAvailable
                    ? "border-teal-200 hover:shadow-md"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon className="size-6" />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isAvailable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isAvailable ? "Available" : "Upcoming"}
                  </span>
                </div>

                <p className="mt-5 text-xs font-bold tracking-wider text-teal-700">
                  STEP {step.number}
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-2 min-h-10 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>

                {step.number === "01" && (
                  <div className="mt-5">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="size-4" />
                      Assignment details loaded
                    </span>
                  </div>
                )}

                {step.number === "02" && (
                  <div className="mt-5">
                    <Link
                      href={`/trainer/batches?assignmentId=${encodeURIComponent(
                        assignmentId
                      )}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                    >
                      Open Attendance
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                )}

                {(step.number === "03" || step.number === "04") && (
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400">
                    <Clock3 className="size-4" />
                    Will be enabled in the next workflow step
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ASSIGNMENT BATCHES */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Layers3 className="size-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Training Batches
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Batches created for this specific trainer assignment.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">
            {batches.length} Batches
          </span>
        </div>

        {batchesError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {batchesError}
          </div>
        )}

        {batchesLoading ? (
          <div className="py-10 text-center">
            <RefreshCw className="mx-auto size-6 animate-spin text-teal-700" />
            <p className="mt-3 text-sm text-slate-500">
              Loading assigned batches...
            </p>
          </div>
        ) : batches.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Users className="mx-auto size-8 text-slate-400" />

            <h3 className="mt-3 font-semibold text-slate-800">
              No batches created yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Contact Sub Admin to create batches for this assignment.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-200"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-bold text-slate-900">
                      Batch {batch.batchNumber}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {batch.requestProgram.program.code} —{" "}
                      {batch.requestProgram.program.title}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getBatchStatusStyle(
                      batch.status
                    )}`}
                  >
                    {batch.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Participants
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {batch.participants}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Start Date
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(batch.startDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      End Date
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(batch.endDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Mode
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {batch.mode || "Not specified"}
                    </p>
                  </div>
                </div>

                {batch.location && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="size-4" />
                    {batch.location}
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/trainer/batches?assignmentId=${encodeURIComponent(
                      assignmentId
                    )}&batchId=${encodeURIComponent(batch.id)}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    Open Attendance
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ASSIGNED PROGRAMMES */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <GraduationCap className="size-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Assigned Training Programmes
            </h2>

            <p className="text-sm text-slate-500">
              Programmes included in this trainer assignment.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {assignment.assignedPrograms.length > 0 ? (
            assignment.assignedPrograms.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.program.code} — {item.program.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Category: {item.program.category} · Duration:{" "}
                    {item.program.duration}
                  </p>
                </div>

                <div className="flex gap-5 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">
                      Participants
                    </p>
                    <p className="mt-1 font-bold text-slate-800">
                      {item.participants}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Expected Batches
                    </p>
                    <p className="mt-1 font-bold text-slate-800">
                      {item.expectedBatches}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No programme details are available for this assignment.
            </p>
          )}
        </div>
      </section>

      {/* ASSIGNMENT REMARKS */}
      {assignment.remarks && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-900">
            Assignment Remarks
          </h3>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            {assignment.remarks}
          </p>
        </section>
      )}
    </div>
  );
}
