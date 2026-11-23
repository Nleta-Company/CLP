
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  UserRound,
  GraduationCap,
  CalendarDays,
  Trash2,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  trainingPrograms,
  type TrainingProgram,
} from "@/lib/data/training-programs";

interface ParticipantDetail {
  name: string;
  email: string;
  designation: string;
  phone: string;
}

interface ProgramRequirement {
  code: string;
  participants: string;
  batches: string;
  mode: "ON" | "HY" | "OF";
  participantsDetails: ParticipantDetail[];
}

interface ClientForm {
  organisation: string;
  gstin: string;
  address: string;
  country: string;
  state: string;
  city: string;
  contactName: string;
  designation: string;
  email: string;
  phone: string;
  preferredDate: string;
  alternateDate: string;
  location: string;
  language: string;
  coordinator: string;
  facilities: string;
  assessment: string;
  refresher: string;
  additionalRequirements: string;
}

const initialForm: ClientForm = {
  organisation: "",
  gstin: "",
  address: "",
  country: "India",
  state: "",
  city: "",
  contactName: "",
  designation: "",
  email: "",
  phone: "",
  preferredDate: "",
  alternateDate: "",
  location: "",
  language: "",
  coordinator: "",
  facilities: "",
  assessment: "Yes",
  refresher: "No",
  additionalRequirements: "",
};

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

const labelClass = "block text-sm font-medium text-slate-700";

export default function ClientServiceInformationPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [requirements, setRequirements] = useState<ProgramRequirement[]>([]);
  const [form, setForm] = useState<ClientForm>(initialForm);
  const [error, setError] = useState("");

  // Load selected programmes and registered client profile
  useEffect(() => {
    async function loadPageData() {
      try {
        setError("");

        // 1. Load selected programmes
        const saved = sessionStorage.getItem("clp-selected-programs");

        if (saved) {
          const parsed: TrainingProgram[] = JSON.parse(saved);

          const validPrograms = parsed.filter((item) =>
            trainingPrograms.some(
              (program) => program.code === item.code
            )
          );

          setPrograms(validPrograms);

          setRequirements(
            validPrograms.map((program) => ({
              code: program.code,
              participants: "",
              batches: "1",
              mode: program.mode,
              participantsDetails: [],
            }))
          );
        } else {
          setPrograms([]);
        }

        // 2. Fetch registered client details from database
        const response = await fetch("/api/client/profile", {
          method: "GET",
          cache: "no-store",
        });

        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          throw new Error(
            "Profile API is not returning JSON. Please check the API route."
          );
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load client information."
          );
        }

        const profile = data.profile;

        // 3. Automatically fill registration information
        setForm((previous) => ({
          ...previous,
          organisation: profile.organisation || "",
          gstin: profile.gstin || "",
          address: profile.address || "",
          country: profile.country || "India",
          state: profile.state || "",
          city: profile.city || "",
          contactName: profile.contactName || profile.name || "",
          designation: profile.designation || "",
          email: profile.email || "",
          phone: profile.phone || "",
        }));
      } catch (error) {
        console.error("Page data loading error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, []);

  function updateForm(field: keyof ClientForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateRequirement<K extends "participants" | "batches" | "mode">(
    code: string,
    field: K,
    value: ProgramRequirement[K]
  ) {
    setRequirements((previous) =>
      previous.map((item) =>
        item.code === code
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function updateParticipantCount(code: string, value: string) {
    const parsedCount = Number(value);
    const count = value === "" ? 0 : Math.max(0, Math.min(500, parsedCount || 0));

    setRequirements((previous) =>
      previous.map((item) => {
        if (item.code !== code) return item;

        const currentDetails = item.participantsDetails || [];
        const updatedDetails = Array.from(
          { length: count },
          (_, index) =>
            currentDetails[index] || {
              name: "",
              email: "",
              designation: "",
              phone: "",
            }
        );

        return {
          ...item,
          participants: value,
          participantsDetails: updatedDetails,
        };
      })
    );
  }

  function updateParticipantDetail(
    code: string,
    index: number,
    field: keyof ParticipantDetail,
    value: string
  ) {
    setRequirements((previous) =>
      previous.map((item) => {
        if (item.code !== code) return item;

        const updatedDetails = [...(item.participantsDetails || [])];
        updatedDetails[index] = {
          ...updatedDetails[index],
          [field]: value,
        };

        return {
          ...item,
          participantsDetails: updatedDetails,
        };
      })
    );
  }

  function removeProgram(code: string) {
    setPrograms((previous) =>
      previous.filter((program) => program.code !== code)
    );

    setRequirements((previous) =>
      previous.filter((item) => item.code !== code)
    );

    const updatedSelection = programs.filter(
      (program) => program.code !== code
    );

    sessionStorage.setItem(
      "clp-selected-programs",
      JSON.stringify(updatedSelection)
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (programs.length === 0) {
      setError("Please select at least one training programme.");
      return;
    }

    const incomplete = requirements.some(
      (item) =>
        !item.participants ||
        Number(item.participants) < 1 ||
        !item.batches ||
        Number(item.batches) < 1
    );

    if (incomplete) {
      setError(
        "Please enter valid participant and batch details for every selected programme."
      );
      return;
    }

    const incompleteParticipants = requirements.some((item) => {
      const expectedCount = Number(item.participants);
      const details = item.participantsDetails || [];

      return (
        details.length !== expectedCount ||
        details.some(
          (participant) =>
            !participant.name.trim() || !participant.designation.trim()
        )
      );
    });

    if (incompleteParticipants) {
      setError(
        "Please enter Full Name and Designation for every participant in all selected programmes."
      );
      return;
    }

    const requestData = {
      ...form,
      selectedPrograms: programs,
      programRequirements: requirements,
      submittedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(
      "clp-client-service-information",
      JSON.stringify(requestData)
    );

    router.push("/client/services/review");
  }

  if (loading) {
    return (
      <DashboardShell role="CLIENT">
        <div className="mx-auto max-w-5xl animate-pulse space-y-5">
          <div className="h-32 rounded-2xl bg-indigo-100" />
          <div className="h-64 rounded-2xl bg-white" />
          <div className="h-64 rounded-2xl bg-white" />
        </div>
      </DashboardShell>
    );
  }

  if (programs.length === 0) {
    return (
      <DashboardShell role="CLIENT">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <AlertCircle className="mx-auto size-10 text-orange-500" />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            No Training Programmes Selected
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please go back and select at least one training programme.
          </p>

          <Link
            href="/client/services"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="size-4" />
            Select Programmes
          </Link>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="CLIENT">
      <div className="mx-auto max-w-5xl space-y-6">

        <Link
          href="/client/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="size-4" />
          Back to Programme Selection
        </Link>

        {/* PAGE HEADER */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-blue-600 p-6 text-white shadow-lg md:p-8">
          <Badge className="border border-white/20 bg-white/15 text-white">
            NLETA · TSP-01
          </Badge>

          <p className="mt-4 text-sm text-indigo-100">
            Service Request · Step 2 of 3
          </p>

          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            Organisation & Training Information
          </h1>

          <p className="mt-2 text-sm leading-6 text-indigo-100">
            Provide your organisation details and requirements for
            the selected training programmes.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Badge className="bg-white/15 text-white">
              {programs.length} Selected Programmes
            </Badge>

            <Badge className="bg-white/15 text-white">
              {requirements.reduce(
                (total, item) =>
                  total + (Number(item.participants) || 0),
                0
              )} Participants Entered
            </Badge>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ORGANISATION DETAILS */}
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
                  Company registration and billing information
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Organisation / Company Name *
                <input
                  required
                  className={inputClass}
                  value={form.organisation}
                  onChange={(e) =>
                    updateForm("organisation", e.target.value)
                  }
                  placeholder="Enter registered company name"
                />
              </label>

              <label className={labelClass}>
                GSTIN
                <input
                  className={inputClass}
                  value={form.gstin}
                  onChange={(e) =>
                    updateForm("gstin", e.target.value)
                  }
                  placeholder="Enter GSTIN if applicable"
                />
              </label>

              <label className={`${labelClass} md:col-span-2`}>
                Registered / Billing Address *
                <textarea
                  required
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  value={form.address}
                  onChange={(e) =>
                    updateForm("address", e.target.value)
                  }
                  placeholder="Complete registered billing address"
                />
              </label>

              <label className={labelClass}>
                Country *
                <input
                  required
                  className={inputClass}
                  value={form.country}
                  onChange={(e) =>
                    updateForm("country", e.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                State *
                <input
                  required
                  className={inputClass}
                  value={form.state}
                  onChange={(e) =>
                    updateForm("state", e.target.value)
                  }
                  placeholder="Enter state"
                />
              </label>

              <label className={labelClass}>
                City *
                <input
                  required
                  className={inputClass}
                  value={form.city}
                  onChange={(e) =>
                    updateForm("city", e.target.value)
                  }
                  placeholder="Enter city"
                />
              </label>
            </div>
          </Card>

          {/* CONTACT DETAILS */}
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
                  Person responsible for coordinating the training request
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Contact Person Name *
                <input
                  required
                  className={inputClass}
                  value={form.contactName}
                  onChange={(e) =>
                    updateForm("contactName", e.target.value)
                  }
                  placeholder="Enter full name"
                />
              </label>

              <label className={labelClass}>
                Designation *
                <input
                  required
                  className={inputClass}
                  value={form.designation}
                  onChange={(e) =>
                    updateForm("designation", e.target.value)
                  }
                  placeholder="e.g. HR Manager"
                />
              </label>

              <label className={labelClass}>
                Official Email *
                <input
                  required
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) =>
                    updateForm("email", e.target.value)
                  }
                  placeholder="name@company.com"
                />
              </label>

              <label className={labelClass}>
                Mobile Number *
                <input
                  required
                  type="tel"
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) =>
                    updateForm("phone", e.target.value)
                  }
                  placeholder="Enter mobile number"
                />
              </label>
            </div>
          </Card>

          {/* SELECTED PROGRAMMES */}
          <Card className="space-y-5 border-emerald-100 p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <GraduationCap className="size-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Selected Training Programmes
                </h2>

                <p className="text-xs text-slate-500">
                  Enter participant and batch requirements for each programme
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {programs.map((program) => {
                const requirement = requirements.find(
                  (item) => item.code === program.code
                );

                if (!requirement) return null;

                return (
                  <div
                    key={program.code}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                            {program.code}
                          </Badge>

                          <Badge variant="outline">
                            {program.duration}
                          </Badge>
                        </div>

                        <h3 className="mt-2 font-semibold text-slate-900">
                          {program.title}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Reference audience: {program.audience}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeProgram(program.code)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Remove programme"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <label className={labelClass}>
                        Participants *
                        <input
                          required
                          type="number"
                          min="1"
                          className={inputClass}
                          value={requirement.participants}
                          max="500"
                          onChange={(e) =>
                            updateParticipantCount(program.code, e.target.value)
                          }
                          placeholder="e.g. 25"
                        />
                      </label>

                      <label className={labelClass}>
                        Expected Batches *
                        <input
                          required
                          type="number"
                          min="1"
                          className={inputClass}
                          value={requirement.batches}
                          onChange={(e) =>
                            updateRequirement(
                              program.code,
                              "batches",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 1"
                        />
                      </label>

                      <label className={labelClass}>
                        Preferred Mode *
                        <select
                          required
                          className={inputClass}
                          value={requirement.mode}
                          onChange={(e) =>
                            updateRequirement(
                              program.code,
                              "mode",
                              e.target.value as ProgramRequirement["mode"]
                            )
                          }
                        >
                          <option value="ON">Online</option>
                          <option value="HY">Hybrid</option>
                          <option value="OF">Offline / Onsite</option>
                        </select>
                      </label>
                    </div>

                    {Number(requirement.participants) > 0 && (
                      <div className="mt-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              Participant Details
                            </h4>
                            <p className="mt-1 text-xs text-slate-500">
                              Enter details for every participant in this programme.
                            </p>
                          </div>

                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                            {requirement.participantsDetails.length} Participants
                          </Badge>
                        </div>

                        {requirement.participantsDetails.map((participant, index) => (
                          <div
                            key={`${program.code}-${index}`}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <h5 className="font-semibold text-slate-800">
                                Participant {index + 1}
                              </h5>
                              <Badge variant="outline">{program.code}</Badge>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className={labelClass}>
                                Full Name *
                                <input
                                  required
                                  type="text"
                                  className={inputClass}
                                  value={participant.name}
                                  onChange={(e) =>
                                    updateParticipantDetail(
                                      program.code,
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter full name"
                                />
                              </label>

                              <label className={labelClass}>
                                Email ID
                                <input
                                  type="email"
                                  className={inputClass}
                                  value={participant.email}
                                  onChange={(e) =>
                                    updateParticipantDetail(
                                      program.code,
                                      index,
                                      "email",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter email ID (optional)"
                                />
                              </label>

                              <label className={labelClass}>
                                Designation *
                                <input
                                  required
                                  type="text"
                                  className={inputClass}
                                  value={participant.designation}
                                  onChange={(e) =>
                                    updateParticipantDetail(
                                      program.code,
                                      index,
                                      "designation",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. Safety Officer"
                                />
                              </label>

                              <label className={labelClass}>
                                Mobile Number
                                <input
                                  type="tel"
                                  className={inputClass}
                                  value={participant.phone}
                                  onChange={(e) =>
                                    updateParticipantDetail(
                                      program.code,
                                      index,
                                      "phone",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter mobile number (optional)"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="mt-3 text-xs text-slate-500">
                      Programme reference mode: {program.mode}. Final delivery
                      mode and batch plan will be reviewed by NLETA.
                    </p>
                  </div>
                );
              })}
            </div>

            {programs.length === 0 && (
              <p className="text-sm text-red-600">
                No programmes selected. Please return to the catalogue.
              </p>
            )}
          </Card>

          {/* DELIVERY & SCHEDULE */}
          <Card className="space-y-5 border-orange-100 p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-orange-100 p-3 text-orange-700">
                <CalendarDays className="size-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Delivery & Schedule Requirements
                </h2>

                <p className="text-xs text-slate-500">
                  Your preferred training schedule and location
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Preferred Training Date
                <input
                  type="date"
                  className={inputClass}
                  value={form.preferredDate}
                  onChange={(e) =>
                    updateForm("preferredDate", e.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                Alternate Training Date
                <input
                  type="date"
                  className={inputClass}
                  value={form.alternateDate}
                  onChange={(e) =>
                    updateForm("alternateDate", e.target.value)
                  }
                />
              </label>

              <label className={`${labelClass} md:col-span-2`}>
                Training Venue / Location *
                <input
                  required
                  className={inputClass}
                  value={form.location}
                  onChange={(e) =>
                    updateForm("location", e.target.value)
                  }
                  placeholder="Enter complete training venue or location"
                />
              </label>

              <label className={labelClass}>
                Preferred Training Language
                <input
                  className={inputClass}
                  value={form.language}
                  onChange={(e) =>
                    updateForm("language", e.target.value)
                  }
                  placeholder="e.g. English / Hindi"
                />
              </label>

              <label className={labelClass}>
                Client Training Coordinator
                <input
                  className={inputClass}
                  value={form.coordinator}
                  onChange={(e) =>
                    updateForm("coordinator", e.target.value)
                  }
                  placeholder="Coordinator name and contact"
                />
              </label>
            </div>
          </Card>

          {/* ADDITIONAL REQUIREMENTS */}
          <Card className="space-y-5 border-cyan-100 p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-cyan-100 p-3 text-cyan-700">
                <ClipboardList className="size-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Additional Training Requirements
                </h2>

                <p className="text-xs text-slate-500">
                  Facilities, assessments and other expectations
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Facilities Available at Venue
                <textarea
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  value={form.facilities}
                  onChange={(e) =>
                    updateForm("facilities", e.target.value)
                  }
                  placeholder="Projector, screen, internet, practical equipment, etc."
                />
              </label>

              <label className={labelClass}>
                Additional Requirements
                <textarea
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  value={form.additionalRequirements}
                  onChange={(e) =>
                    updateForm("additionalRequirements", e.target.value)
                  }
                  placeholder="Mention any special requirements..."
                />
              </label>

              <label className={labelClass}>
                Assessment Required?
                <select
                  className={inputClass}
                  value={form.assessment}
                  onChange={(e) =>
                    updateForm("assessment", e.target.value)
                  }
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="To be discussed">To be discussed</option>
                </select>
              </label>

              <label className={labelClass}>
                Refresher Training Required?
                <select
                  className={inputClass}
                  value={form.refresher}
                  onChange={(e) =>
                    updateForm("refresher", e.target.value)
                  }
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="To be discussed">To be discussed</option>
                </select>
              </label>
            </div>
          </Card>

          {/* NOTICE */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            <strong>Important:</strong> Programme duration, delivery mode,
            batch allocation and commercial terms are subject to NLETA review
            and confirmation. This form does not display or confirm pricing.
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col-reverse justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
            <Link
              href="/client/services"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
              Back to Selection
            </Link>

            <button
              type="submit"
              disabled={programs.length === 0}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50"
            >
              Review Request
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
