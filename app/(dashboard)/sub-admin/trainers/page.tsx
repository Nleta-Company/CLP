
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  Clock,
  BriefcaseBusiness,
  Plus,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  MapPin,
  ClipboardList,
} from "lucide-react";

type Trainer = {
  id: string;
  name: string;
  email: string;
};

type Program = {
  requestProgramId: string;
  code: string;
  title: string;
  expectedBatches: number;
  participants: number;
};

type AssignmentRow = {
  trainerId: string;
  requestProgramId: string;
  batchNumber: string;
  remarks: string;
};

type RequestItem = {
  id: string;
  requestNumber: string;
  status: string;
  organisation: string | null;
  trainingLocation: string;
  preferredDate: string | null;
  client: {
    name: string;
    email: string;
  };
  tafAgreement: {
    tafNumber: string;
    status: string;
    clientDecisionAt: string | null;
  } | null;
  programs: {
    id: string;
    participants: number;
    expectedBatches: number;
    program: {
      code: string;
      title: string;
    };
  }[];
  trainerAssignments: {
    id: string;
    trainer: Trainer;
    batchNumber: number | null;
    requestProgram: {
      program: {
        code: string;
        title: string;
      };
    } | null;
    status: string;
    remarks: string | null;
  }[];
};

type DetailResponse = {
  success: boolean;
  canAssign: boolean;
  canReassign?: boolean;
  tafAccepted: boolean;
  assignmentMode?: "SINGLE" | "MULTIPLE" | null;
  programs: Program[];
  trainers: Trainer[];
  assignments: unknown[];
};

type ListResponse = {
  success: boolean;
  stats: {
    totalRequests: number;
    pendingCount: number;
    assignedCount: number;
    totalTrainers: number;
  };
  requests: RequestItem[];
};

const emptyRow = (): AssignmentRow => ({
  trainerId: "",
  requestProgramId: "",
  batchNumber: "",
  remarks: "",
});

export default function TrainerAssignmentPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "ASSIGNED" | "REJECTED"
  >("ALL");

  const [selectedRequest, setSelectedRequest] =
    useState<RequestItem | null>(null);

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [assignmentMode, setAssignmentMode] =
    useState<"SINGLE" | "MULTIPLE">("SINGLE");

  const [rows, setRows] = useState<AssignmentRow[]>([emptyRow()]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/sub-admin/trainers", {
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load requests.");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    if (!data) return [];

    return data.requests.filter((item) => {
      const assigned = item.trainerAssignments.length > 0;
      const allRejected =
        assigned &&
        item.trainerAssignments.every(
          (assignment) => assignment.status === "REJECTED"
        );

      const matchesFilter =
        filter === "ALL" ||
        (filter === "PENDING" && !assigned) ||
        (filter === "ASSIGNED" && assigned && !allRejected) ||
        (filter === "REJECTED" && allRejected);

      const searchText = [
        item.requestNumber,
        item.organisation,
        item.client.name,
        item.client.email,
        item.tafAgreement?.tafNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesFilter &&
        searchText.includes(search.toLowerCase())
      );
    });
  }, [data, filter, search]);

  async function openAssignment(item: RequestItem) {
    const hasAssignments = item.trainerAssignments.length > 0;
    const allRejected =
      hasAssignments &&
      item.trainerAssignments.every(
        (assignment) => assignment.status === "REJECTED"
      );

    // Reassignment is available only when every previous
    // assignment for this request has been rejected.
    if (hasAssignments && !allRejected) return;

    setSelectedRequest(item);
    setMessage("");
    setError("");
    setRows([emptyRow()]);
    setAssignmentMode("SINGLE");

    try {
      setDetailLoading(true);

      const response = await fetch(
        `/api/sub-admin/requests/${item.id}/trainer-assignment`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const result: DetailResponse & { message?: string } =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load assignment details.");
      }

      if (!result.canAssign) {
        throw new Error(
          "This request is not currently eligible for trainer assignment."
        );
      }

      setTrainers(result.trainers);
      setPrograms(result.programs);

      if (result.assignmentMode === "MULTIPLE") {
        setAssignmentMode("MULTIPLE");
        setRows([emptyRow(), emptyRow()]);
      } else {
        setAssignmentMode("SINGLE");
        setRows([emptyRow()]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load request."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function closeModal() {
    setSelectedRequest(null);
    setRows([emptyRow()]);
    setError("");
    setMessage("");
  }

  function changeMode(mode: "SINGLE" | "MULTIPLE") {
    setAssignmentMode(mode);

    if (mode === "SINGLE") {
      const firstRow = rows[0] || emptyRow();

      // A single trainer is responsible for the complete request:
      // all programmes and all batches are included automatically.
      setRows([
        {
          ...firstRow,
          requestProgramId: "",
          batchNumber: "",
        },
      ]);
      return;
    }

    setRows((current) =>
      current.length >= 2 ? current : [...current, emptyRow()]
    );
  }

  function updateRow(
    index: number,
    field: keyof AssignmentRow,
    value: string
  ) {
    setRows((current) =>
      current.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  }

  function addRow() {
    setRows((current) => [...current, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  async function saveAssignments() {
    if (!selectedRequest) return;

    setError("");
    setMessage("");

    if (rows.some((row) => !row.trainerId)) {
      setError("Please select a trainer for every assignment.");
      return;
    }

    if (
      rows.some(
        (row) =>
          row.requestProgramId &&
          row.batchNumber &&
          (
            !Number.isInteger(Number(row.batchNumber)) ||
            Number(row.batchNumber) < 1
          )
      )
    ) {
      setError("Please enter a valid batch number.");
      return;
    }

    if (
      assignmentMode === "MULTIPLE" &&
      rows.length < 2
    ) {
      setError("Multiple mode requires at least two assignments.");
      return;
    }

    const payload = {
      assignmentMode,
      assignments: rows.map((row) => ({
        trainerId: row.trainerId,
        requestProgramId: row.requestProgramId || null,
        batchNumber: row.batchNumber
          ? Number(row.batchNumber)
          : null,
        remarks: row.remarks.trim() || null,
      })),
    };

    try {
      setSaving(true);

      const response = await fetch(
        `/api/sub-admin/requests/${selectedRequest.id}/trainer-assignment`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Assignment failed.");
      }

      setMessage(result.message || "Trainer assigned successfully.");

      await loadRequests();

      setTimeout(() => {
        closeModal();
      }, 900);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save assignment."
      );
    } finally {
      setSaving(false);
    }
  }

  const stats = data?.stats;

  return (
    <div className="min-h-full space-y-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page heading */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-teal-700">
              <Users size={16} />
              Sub Admin / Trainer Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Trainer Assignment
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage trainers, programmes and batch allocations.
            </p>
          </div>

          <button
            onClick={loadRequests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <ClipboardList size={16} />
            Refresh Requests
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Eligible Requests",
              value: stats?.totalRequests ?? 0,
              icon: BriefcaseBusiness,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Pending Assignment",
              value: stats?.pendingCount ?? 0,
              icon: Clock,
              color: "bg-amber-50 text-amber-700",
            },
            {
              label: "Assigned Requests",
              value: stats?.assignedCount ?? 0,
              icon: UserCheck,
              color: "bg-emerald-50 text-emerald-700",
            },
            {
              label: "Active Trainers",
              value: stats?.totalTrainers ?? 0,
              icon: Users,
              color: "bg-violet-50 text-violet-700",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>

                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Requests section */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Training Requests
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Only client-accepted TAF requests are listed here.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search request or client..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:w-64"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(
                      e.target.value as
                        | "ALL"
                        | "PENDING"
                        | "ASSIGNED"
                        | "REJECTED"
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  <option value="ALL">All Requests</option>
                  <option value="PENDING">Pending Assignment</option>
                  <option value="ASSIGNED">Assigned / In Progress</option>
                  <option value="REJECTED">Rejected / Reassignment</option>
                </select>
              </div>
            </div>
          </div>

          {error && !selectedRequest && (
            <div className="m-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              Loading training requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BriefcaseBusiness size={25} />
              </div>
              <h3 className="font-semibold text-slate-800">
                No requests found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Accepted TAF requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Request</th>
                    <th className="px-5 py-4 font-semibold">Client</th>
                    <th className="px-5 py-4 font-semibold">Programmes</th>
                    <th className="px-5 py-4 font-semibold">TAF Status</th>
                    <th className="px-5 py-4 font-semibold">Assignment</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((item) => {
                    const assigned = item.trainerAssignments.length > 0;
                    const allRejected =
                      assigned &&
                      item.trainerAssignments.every(
                        (assignment) => assignment.status === "REJECTED"
                      );

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {item.requestNumber}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.tafAgreement?.tafNumber}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">
                            {item.organisation || item.client.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.client.email}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {item.programs.map((program) => (
                              <p
                                key={program.id}
                                className="text-sm text-slate-700"
                              >
                                {program.program.code} · {program.program.title}
                              </p>
                            ))}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            TAF Accepted
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {assigned ? (
                            <div>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  allRejected
                                    ? "bg-red-50 text-red-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {allRejected
                                  ? "All Trainers Rejected"
                                  : `${item.trainerAssignments.length} Assignment(s)`}
                              </span>

                              <div className="mt-2 space-y-2">
                                {item.trainerAssignments.map((assignment) => (
                                  <div key={assignment.id}>
                                    <p className="text-xs font-medium text-slate-700">
                                      {assignment.trainer.name}
                                      {assignment.requestProgram?.program
                                        ? ` · ${assignment.requestProgram.program.code}`
                                        : ""}
                                      {assignment.batchNumber
                                        ? ` · Batch ${assignment.batchNumber}`
                                        : ""}
                                    </p>

                                    <span
                                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        assignment.status === "REJECTED"
                                          ? "bg-red-50 text-red-700"
                                          : assignment.status === "ACCEPTED"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : assignment.status === "COMPLETED"
                                              ? "bg-slate-100 text-slate-700"
                                              : "bg-amber-50 text-amber-700"
                                      }`}
                                    >
                                      {assignment.status}
                                    </span>

                                    {assignment.status === "REJECTED" &&
                                      assignment.remarks && (
                                        <p className="mt-1 max-w-xs text-xs leading-5 text-red-600">
                                          Reason: {assignment.remarks}
                                        </p>
                                      )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => openAssignment(item)}
                            disabled={assigned && !allRejected}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                          >
                            <Users size={15} />
                            {allRejected
                              ? "Reassign Trainer"
                              : assigned
                                ? "Assigned"
                                : "Assign Trainer"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Assignment modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
          <div className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                  Trainer Allocation
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Assign Trainers
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedRequest.requestNumber} ·{" "}
                  {selectedRequest.organisation || selectedRequest.client.name}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
                <Loader2 size={20} className="animate-spin" />
                Loading trainers and programmes...
              </div>
            ) : (
              <div className="max-h-[72vh] space-y-6 overflow-y-auto p-5 sm:p-6">
                {/* Previous assignment history */}
                {selectedRequest.trainerAssignments.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-red-800">
                          Previous Assignment History
                        </h3>
                        <p className="mt-1 text-xs text-red-700">
                          Previous records are preserved. You are creating a new assignment.
                        </p>
                      </div>
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                        Reassignment
                      </span>
                    </div>

                    <div className="space-y-3">
                      {selectedRequest.trainerAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="rounded-lg border border-red-100 bg-white p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800">
                              {assignment.trainer.name}
                            </p>
                            <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">
                              {assignment.status}
                            </span>
                          </div>
                          {assignment.requestProgram?.program && (
                            <p className="mt-1 text-xs text-slate-600">
                              {assignment.requestProgram.program.code} ·{" "}
                              {assignment.requestProgram.program.title}
                            </p>
                          )}
                          {assignment.batchNumber && (
                            <p className="mt-1 text-xs text-slate-600">
                              Batch {assignment.batchNumber}
                            </p>
                          )}
                          {assignment.remarks && (
                            <p className="mt-2 text-xs leading-5 text-red-700">
                              <strong>Rejection reason:</strong>{" "}
                              {assignment.remarks}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request details */}
                <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">TAF Number</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedRequest.tafAgreement?.tafNumber || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Training Location</p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-800">
                      <MapPin size={14} />
                      {selectedRequest.trainingLocation}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Preferred Date</p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-800">
                      <CalendarDays size={14} />
                      {selectedRequest.preferredDate
                        ? new Date(selectedRequest.preferredDate).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Assignment mode */}
                <div>
                  <h3 className="mb-3 text-sm font-bold text-slate-900">
                    Select Assignment Type
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => changeMode("SINGLE")}
                      className={`rounded-xl border p-4 text-left transition ${
                        assignmentMode === "SINGLE"
                          ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2 text-teal-700 shadow-sm">
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            Single Trainer
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Assign one trainer.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => changeMode("MULTIPLE")}
                      className={`rounded-xl border p-4 text-left transition ${
                        assignmentMode === "MULTIPLE"
                          ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2 text-teal-700 shadow-sm">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            Multiple Trainers
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Assign trainers across programmes and batches.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Assignment rows */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Trainer Details
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {assignmentMode === "SINGLE"
                          ? "One trainer will handle every programme and batch in this request."
                          : "Assign trainers to specific programmes and batches."}
                      </p>
                    </div>

                    {assignmentMode === "MULTIPLE" && (
                      <button
                        type="button"
                        onClick={addRow}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                      >
                        <Plus size={15} />
                        Add Trainer
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {rows.map((row, index) => {
                      const selectedProgram = programs.find(
                        (program) =>
                          program.requestProgramId === row.requestProgramId
                      );

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-800">
                              Assignment {index + 1}
                            </p>

                            {assignmentMode === "MULTIPLE" &&
                              rows.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeRow(index)}
                                  className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                  title="Remove assignment"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                Select Trainer *
                              </label>

                              <select
                                value={row.trainerId}
                                onChange={(e) =>
                                  updateRow(index, "trainerId", e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                              >
                                <option value="">Choose trainer</option>
                                {trainers.map((trainer) => (
                                  <option
                                    key={trainer.id}
                                    value={trainer.id}
                                  >
                                    {trainer.name} ({trainer.email})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {assignmentMode === "MULTIPLE" && (
                              <>
                                <div>
                                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Select Programme
                                  </label>

                                  <select
                                    value={row.requestProgramId}
                                    onChange={(e) => {
                                      updateRow(
                                        index,
                                        "requestProgramId",
                                        e.target.value
                                      );
                                      updateRow(index, "batchNumber", "");
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                  >
                                    <option value="">Entire Request / No specific programme</option>
                                    {programs.map((program) => (
                                      <option
                                        key={program.requestProgramId}
                                        value={program.requestProgramId}
                                      >
                                        {program.code} - {program.title}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Batch Number
                                  </label>

                                  <select
                                    value={row.batchNumber}
                                    disabled={!row.requestProgramId}
                                    onChange={(e) =>
                                      updateRow(index, "batchNumber", e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-400"
                                  >
                                    <option value="">All batches</option>
                                    {Array.from(
                                      {
                                        length:
                                          selectedProgram?.expectedBatches || 0,
                                      },
                                      (_, i) => i + 1
                                    ).map((batch) => (
                                      <option key={batch} value={batch}>
                                        Batch {batch}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            )}

                            {assignmentMode === "SINGLE" && (
                              <div className="sm:col-span-2 rounded-xl border border-teal-100 bg-teal-50 p-3">
                                <p className="text-sm font-semibold text-teal-800">
                                  Complete Request Allocation
                                </p>
                                <p className="mt-1 text-xs leading-5 text-teal-700">
                                  This trainer will be responsible for all {programs.length} programme(s)
                                  and all batches included in this request. No programme selection is required.
                                </p>
                              </div>
                            )}

                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                Remarks
                              </label>

                              <input
                                value={row.remarks}
                                onChange={(e) =>
                                  updateRow(index, "remarks", e.target.value)
                                }
                                placeholder="Optional remarks"
                                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-teal-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {message && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    <CheckCircle2 size={17} />
                    {message}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle size={17} />
                    {error}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveAssignments}
                disabled={saving || detailLoading || !trainers.length}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirm Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
