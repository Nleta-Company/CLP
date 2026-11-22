
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";

type Trainer = {
  id: string;
  name: string;
  email: string;
};

type ParticipantForm = {
  name: string;
  email: string;
  phone: string;
  employeeId: string;
};

type Batch = {
  id: string;
  batchNumber: number;
  participants: number;
  startDate: string | null;
  endDate: string | null;
  mode: string;
  location: string | null;
  status: string;
  participantsList?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    employeeId: string | null;
  }[];
  requestProgram: {
    id: string;
    participants: number;
    expectedBatches: number;
    program: {
      code: string;
      title: string;
      category: string;
    };
    request: {
      requestNumber: string;
      organisation: string | null;
      client: {
        name: string;
        email: string;
      };
    };
  };
  trainerAssignment: {
    trainer: Trainer;
  } | null;
};

type EligibleProgram = {
  id: string;
  participants: number;
  expectedBatches: number;
  preferredMode: string;
  remainingParticipants: number;
  remainingBatches: number;
  canCreateBatch: boolean;
  batches: Batch[];
  program: {
    code: string;
    title: string;
    category: string;
  };
  request: {
    id: string;
    requestNumber: string;
    organisation: string | null;
    trainingLocation: string;
    trainerAssignmentMode: string | null;
    tafAgreement: {
      tafNumber: string;
      status: string;
    } | null;
  };
  acceptedAssignments: {
    id: string;
    batchNumber: number | null;
    trainer: Trainer;
  }[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  stats: {
    total: number;
    planned: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  batches: Batch[];
  eligiblePrograms: EligibleProgram[];
};

type FormData = {
  requestProgramId: string;
  batchNumber: string;
  participants: string;
  startDate: string;
  endDate: string;
  mode: string;
  location: string;
};

const initialForm: FormData = {
  requestProgramId: "",
  batchNumber: "1",
  participants: "",
  startDate: "",
  endDate: "",
  mode: "ON",
  location: "",
};

function createEmptyParticipant(): ParticipantForm {
  return { name: "", email: "", phone: "", employeeId: "" };
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClasses(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function SubAdminBatchesPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);
  const [participantDetails, setParticipantDetails] = useState<ParticipantForm[]>([]);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/sub-admin/batches", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to fetch batches.");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const selectedProgram = useMemo(
    () =>
      data?.eligiblePrograms.find(
        (item) => item.id === form.requestProgramId
      ) || null,
    [data, form.requestProgramId]
  );

  const filteredBatches = useMemo(() => {
    return (data?.batches || []).filter((batch) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        batch.requestProgram.program.title
          .toLowerCase()
          .includes(searchText) ||
        batch.requestProgram.program.code
          .toLowerCase()
          .includes(searchText) ||
        batch.requestProgram.request.requestNumber
          .toLowerCase()
          .includes(searchText) ||
        (batch.requestProgram.request.organisation || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        batch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  function openCreateForm() {
    setForm(initialForm);
    setParticipantDetails([]);
    setFormError("");
    setSuccess("");
    setShowForm(true);
  }

  function handleProgramChange(programId: string) {
    const item = data?.eligiblePrograms.find(
      (program) => program.id === programId
    );

    if (!item) {
      setForm({
        ...initialForm,
        requestProgramId: programId,
      });
      setParticipantDetails([]);
      return;
    }

    const usedNumbers = item.batches.map(
      (batch) => batch.batchNumber
    );

    let nextBatchNumber = 1;

    while (
      usedNumbers.includes(nextBatchNumber) &&
      nextBatchNumber <= item.expectedBatches
    ) {
      nextBatchNumber++;
    }

    setForm({
      requestProgramId: item.id,
      batchNumber: String(nextBatchNumber),
      participants: "",
      startDate: "",
      endDate: "",
      mode: item.preferredMode,
      location: item.request.trainingLocation || "",
    });
    setParticipantDetails([]);

    setFormError("");
  }

  function handleParticipantCountChange(value: string) {
    setForm((current) => ({ ...current, participants: value }));
    const count = Number(value);

    if (!Number.isInteger(count) || count < 0 || count > 500) {
      setParticipantDetails([]);
      return;
    }

    setParticipantDetails((current) =>
      Array.from({ length: count }, (_, index) => current[index] || createEmptyParticipant())
    );
  }

  function updateParticipant(
    index: number,
    field: keyof ParticipantForm,
    value: string
  ) {
    setParticipantDetails((current) =>
      current.map((participant, participantIndex) =>
        participantIndex === index
          ? { ...participant, [field]: value }
          : participant
      )
    );
  }

  async function createBatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProgram) {
      setFormError("Please select a training programme.");
      return;
    }

    const batchNumber = Number(form.batchNumber);
    const participants = participantDetails.length;

    if (
      !Number.isInteger(batchNumber) ||
      batchNumber < 1 ||
      batchNumber > selectedProgram.expectedBatches
    ) {
      setFormError("Please enter a valid batch number.");
      return;
    }

    if (
      !Number.isInteger(participants) ||
      participants < 1 ||
      participants > selectedProgram.remainingParticipants
    ) {
      setFormError(
        `Participants must be between 1 and ${selectedProgram.remainingParticipants}.`
      );
      return;
    }

    if (participantDetails.some((participant) => !participant.name.trim())) {
      setFormError("Please enter the name of every participant.");
      return;
    }

    const invalidEmail = participantDetails.find(
      (participant) =>
        participant.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email.trim())
    );
    if (invalidEmail) {
      setFormError("Please enter valid email addresses.");
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      setFormError("End date cannot be earlier than start date.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const response = await fetch("/api/sub-admin/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestProgramId: form.requestProgramId,
          batchNumber,
          participants,
          participantDetails: participantDetails.map((participant) => ({
            name: participant.name.trim(),
            email: participant.email.trim() || null,
            phone: participant.phone.trim() || null,
            employeeId: participant.employeeId.trim() || null,
          })),
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          mode: form.mode,
          location: form.location.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create batch.");
      }

      setShowForm(false);
      setForm(initialForm);
      setParticipantDetails([]);
      setSuccess("Batch created successfully.");

      await fetchBatches();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to create batch."
      );
    } finally {
      setSaving(false);
    }
  }

  const stats = [
    {
      label: "Total Batches",
      value: data?.stats.total ?? 0,
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Planned",
      value: data?.stats.planned ?? 0,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "In Progress",
      value: data?.stats.inProgress ?? 0,
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Completed",
      value: data?.stats.completed ?? 0,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-teal-700">
            TRAINING OPERATIONS
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Batch Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create, allocate and monitor training batches.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchBatches}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            <Plus className="size-4" />
            Create Batch
          </button>
        </div>
      </div>

      {/* FEEDBACK */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <div className={`flex size-11 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="size-5" />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? "—" : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* AVAILABLE PROGRAMMES */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Programmes Available for Batch Creation
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Only TAF-accepted requests with an accepted trainer assignment are eligible.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          {loading ? (
            <p className="py-6 text-sm text-slate-500">
              Loading eligible programmes...
            </p>
          ) : !data?.eligiblePrograms.length ? (
            <p className="py-6 text-sm text-slate-500">
              No eligible programmes found.
            </p>
          ) : (
            data.eligiblePrograms.map((item) => {
              const trainer = item.acceptedAssignments[0]?.trainer;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {item.program.code} – {item.program.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.request.requestNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.request.organisation || "Client"}
                      </p>
                    </div>

                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.canCreateBatch
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {item.canCreateBatch ? "Eligible" : "Unavailable"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Remaining Participants
                      </p>
                      <p className="mt-1 font-bold text-slate-800">
                        {item.remainingParticipants}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Remaining Batches
                      </p>
                      <p className="mt-1 font-bold text-slate-800">
                        {item.remainingBatches}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    <p>
                      Trainer:{" "}
                      <span className="font-semibold text-slate-700">
                        {trainer?.name || "No accepted trainer"}
                      </span>
                    </p>

                    <p className="mt-1">
                      Assignment: {item.request.trainerAssignmentMode || "Not set"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      handleProgramChange(item.id);
                      setShowForm(true);
                      setSuccess("");
                    }}
                    disabled={!item.canCreateBatch}
                    className="mt-4 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    Create Batch
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* CREATED BATCHES */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              All Training Batches
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and monitor batches created by Sub Admin.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search request or programme..."
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-600"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-600"
            >
              <option value="ALL">All Status</option>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Loading batches...
            </p>
          ) : !filteredBatches.length ? (
            <div className="py-12 text-center">
              <GraduationCap className="mx-auto size-10 text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-800">
                No batches found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Create a batch from an eligible programme.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBatches.map((batch) => (
                <article
                  key={batch.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {batch.requestProgram.program.code} – {batch.requestProgram.program.title}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Request: {batch.requestProgram.request.requestNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {batch.requestProgram.request.organisation ||
                          batch.requestProgram.request.client.name}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                        Batch {batch.batchNumber}
                      </span>

                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses(batch.status)}`}>
                        {batch.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 border-y border-slate-100 py-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Participants</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {batch.participants}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Start Date</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatDate(batch.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Location</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {batch.location || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Training Mode</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {batch.mode === "ON"
                          ? "Online"
                          : batch.mode === "OF"
                            ? "Offline"
                            : "Hybrid"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Assigned Trainer</p>
                      <p className="font-semibold text-slate-700">
                        {batch.trainerAssignment?.trainer.name || "Not assigned"}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-400">End Date</p>
                      <p className="font-semibold text-slate-700">
                        {formatDate(batch.endDate)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CREATE BATCH MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create Training Batch
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter batch details below.
                </p>
              </div>

              <button
                onClick={() => {
                  if (!saving) {
                    setShowForm(false);
                    setFormError("");
                  }
                }}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={createBatch} className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Programme *
                </label>

                <select
                  required
                  value={form.requestProgramId}
                  onChange={(event) =>
                    handleProgramChange(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                >
                  <option value="">Choose a programme</option>

                  {data?.eligiblePrograms
                    .filter((item) => item.canCreateBatch)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.program.code} - {item.program.title} ({item.request.requestNumber})
                      </option>
                    ))}
                </select>
              </div>

              {selectedProgram && (
                <div className="rounded-xl bg-teal-50 p-4">
                  <p className="font-semibold text-teal-900">
                    {selectedProgram.program.title}
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-teal-800">
                    <p>
                      Remaining Participants:{" "}
                      <strong>{selectedProgram.remainingParticipants}</strong>
                    </p>
                    <p>
                      Remaining Batches:{" "}
                      <strong>{selectedProgram.remainingBatches}</strong>
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-teal-700">
                    Trainer: {selectedProgram.acceptedAssignments[0]?.trainer.name || "Not available"}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Batch Number *
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={selectedProgram?.expectedBatches}
                    required
                    value={form.batchNumber}
                    onChange={(event) =>
                      setForm({ ...form, batchNumber: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Participants *
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={selectedProgram?.remainingParticipants}
                    required
                    value={form.participants}
                    onChange={(event) =>
                      handleParticipantCountChange(event.target.value)
                    }
                    placeholder="Enter participants"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Training Start Date
                  </label>

                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm({ ...form, startDate: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Training End Date
                  </label>

                  <input
                    type="date"
                    min={form.startDate || undefined}
                    value={form.endDate}
                    onChange={(event) =>
                      setForm({ ...form, endDate: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Training Mode *
                  </label>

                  <select
                    required
                    value={form.mode}
                    onChange={(event) =>
                      setForm({ ...form, mode: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                  >
                    <option value="ON">Online</option>
                    <option value="OF">Offline</option>
                    <option value="HY">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Training Location
                  </label>

                  <input
                    value={form.location}
                    onChange={(event) =>
                      setForm({ ...form, location: event.target.value })
                    }
                    placeholder="Enter location"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {selectedProgram && Number(form.participants) > 0 && (
                <section className="space-y-4 rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-bold text-slate-900">Participant Details</h3>
                      <p className="text-xs text-slate-500">
                        Add details for all {participantDetails.length} participants. Name is required.
                      </p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      {participantDetails.length} Participants
                    </span>
                  </div>

                  {participantDetails.map((participant, index) => (
                    <div key={index} className="rounded-xl bg-slate-50 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-700">
                        Participant {index + 1}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Full Name *
                          </label>
                          <input
                            required
                            value={participant.name}
                            onChange={(event) => updateParticipant(index, "name", event.target.value)}
                            placeholder="Enter full name"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Email
                          </label>
                          <input
                            type="email"
                            value={participant.email}
                            onChange={(event) => updateParticipant(index, "email", event.target.value)}
                            placeholder="name@example.com"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={participant.phone}
                            onChange={(event) => updateParticipant(index, "phone", event.target.value)}
                            placeholder="Enter phone number"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Employee ID
                          </label>
                          <input
                            value={participant.employeeId}
                            onChange={(event) => updateParticipant(index, "employeeId", event.target.value)}
                            placeholder="Enter employee ID"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !selectedProgram}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  <Plus className="size-4" />
                  {saving ? "Creating Batch..." : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
