
"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BookOpenCheck,
  Search,
  Clock3,
  Monitor,
  Users,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  BriefcaseBusiness,
  Factory,
  BrainCircuit,
  Settings2,
  HeartHandshake,
  ClipboardList,
  X,
  Check,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import {
  trainingPrograms,
  trainingCategories,
  audienceLegend,
  type TrainingProgram,
} from "@/lib/data/training-programs"

const categoryStyles: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; text: string }
> = {
  WCT: {
    icon: BriefcaseBusiness,
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
  },
  SCT: {
    icon: ShieldCheck,
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  OET: {
    icon: Settings2,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  LET: {
    icon: Factory,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  FMT: {
    icon: BuildingIcon,
    color: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  CSR: {
    icon: HeartHandshake,
    color: "from-pink-500 to-rose-600",
    bg: "bg-pink-50",
    text: "text-pink-700",
  },
  PDT: {
    icon: Users,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  ADT: {
    icon: BrainCircuit,
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  TTM: {
    icon: GraduationCap,
    color: "from-fuchsia-500 to-purple-600",
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
  },
}

function BuildingIcon({ className }: { className?: string }) {
  return <ClipboardList className={className} />
}

const modeLabels: Record<string, string> = {
  ON: "Online",
  HY: "Hybrid",
  OF: "Offline / Onsite",
}

export default function ClientServicesPage() {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("ALL")
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)

  const filteredPrograms = useMemo(() => {
    return trainingPrograms.filter((program) => {
      const matchesCategory =
        activeCategory === "ALL" ||
        program.category === activeCategory

      const matchesSearch =
        program.code.toLowerCase().includes(search.toLowerCase()) ||
        program.title.toLowerCase().includes(search.toLowerCase()) ||
        program.audience.toLowerCase().includes(search.toLowerCase())

      const matchesSelected =
        !showSelectedOnly ||
        selectedPrograms.includes(program.code)

      return matchesCategory && matchesSearch && matchesSelected
    })
  }, [activeCategory, search, selectedPrograms, showSelectedOnly])

  const selectedProgramDetails = useMemo(() => {
    return trainingPrograms.filter((program) =>
      selectedPrograms.includes(program.code)
    )
  }, [selectedPrograms])

  const selectedCount = selectedPrograms.length

  const toggleProgram = (code: string) => {
    setSelectedPrograms((previous) =>
      previous.includes(code)
        ? previous.filter((item) => item !== code)
        : [...previous, code]
    )
  }

  const selectAllVisible = () => {
    const visibleCodes = filteredPrograms.map((program) => program.code)

    setSelectedPrograms((previous) =>
      Array.from(new Set([...previous, ...visibleCodes]))
    )
  }

  const clearSelection = () => {
    setSelectedPrograms([])
  }

  const handleContinue = () => {
    if (selectedPrograms.length === 0) return

    const selectedData: TrainingProgram[] =
      selectedProgramDetails

    sessionStorage.setItem(
      "clp-selected-programs",
      JSON.stringify(selectedData)
    )

    router.push("/client/services/information")
  }

  return (
    <DashboardShell role="CLIENT">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-blue-600 p-6 text-white shadow-xl shadow-indigo-900/10 md:p-9">
          <div className="pointer-events-none absolute -right-12 -top-16 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 size-56 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative max-w-3xl">
            <Badge className="mb-4 border border-white/20 bg-white/15 text-white hover:bg-white/20">
              NLETA · TSP-01
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Select Your Training Programmes
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 md:text-base">
              Explore NLETA&apos;s complete training portfolio.
              Select one or multiple programmes according to your
              organisation&apos;s training requirements.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-indigo-100">
              <span className="flex items-center gap-2">
                <BookOpenCheck className="size-4" />
                9 Training Categories
              </span>

              <span className="flex items-center gap-2">
                <GraduationCap className="size-4" />
                62 Programmes
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                Multiple Selection
              </span>
            </div>
          </div>
        </section>

        {/* SUMMARY CARDS */}
        <section className="grid gap-4 sm:grid-cols-3">

          <Card className="flex items-center gap-4 border-indigo-100 p-4 shadow-sm">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
              <BookOpenCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">
                Total Programmes
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {trainingPrograms.length}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border-emerald-100 p-4 shadow-sm">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">
                Training Categories
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {trainingCategories.length}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border-violet-100 p-4 shadow-sm">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">
                Selected Programmes
              </p>
              <p className="text-2xl font-bold text-violet-700">
                {selectedCount}
              </p>
            </div>
          </Card>

        </section>

        {/* SEARCH AND FILTER */}
        <section className="space-y-5">

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Training Programme Catalogue
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select the programmes your organisation requires.
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search programme or code..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => {
                setActiveCategory("ALL")
                setShowSelectedOnly(false)
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                activeCategory === "ALL" && !showSelectedOnly
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50"
              }`}
            >
              All Programmes ({trainingPrograms.length})
            </button>

            {trainingCategories.map((category) => {
              const count = trainingPrograms.filter(
                (program) => program.category === category.code
              ).length

              return (
                <button
                  key={category.code}
                  onClick={() => {
                    setActiveCategory(category.code)
                    setShowSelectedOnly(false)
                  }}
                  className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    activeCategory === category.code
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {category.code} ({count})
                </button>
              )
            })}
          </div>

          {/* SELECTED FILTER AND SELECT ALL */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">

            <button
              onClick={() => setShowSelectedOnly(!showSelectedOnly)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                showSelectedOnly
                  ? "bg-violet-100 text-violet-800"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <CheckCircle2 className="size-4" />
              {showSelectedOnly
                ? "Showing Selected"
                : `View Selected (${selectedCount})`}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={selectAllVisible}
                disabled={filteredPrograms.length === 0}
                className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-40"
              >
                Select All Visible
              </button>

              <button
                type="button"
                onClick={clearSelection}
                disabled={selectedCount === 0}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* PROGRAMME LIST */}
          <div className="space-y-4">

            {trainingCategories
              .filter((category) =>
                filteredPrograms.some(
                  (program) => program.category === category.code
                )
              )
              .map((category) => {
                const programs = filteredPrograms.filter(
                  (program) => program.category === category.code
                )

                const style = categoryStyles[category.code]
                const Icon = style.icon

                return (
                  <Card
                    key={category.code}
                    className="overflow-hidden border-slate-200 shadow-sm"
                  >
                    {/* CATEGORY HEADER */}
                    <div className={`h-1.5 bg-gradient-to-r ${style.color}`} />

                    <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 md:flex-row md:items-center md:justify-between md:p-5">

                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl ${style.bg} p-3 ${style.text}`}>
                          <Icon className="size-5" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900">
                              {category.code}
                            </h3>

                            <Badge
                              variant="secondary"
                              className={`${style.bg} ${style.text} border-0`}
                            >
                              {programs.length} programmes
                            </Badge>
                          </div>

                          <p className="mt-0.5 text-sm text-slate-500">
                            {category.title}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const codes = programs.map((p) => p.code)
                          setSelectedPrograms((previous) =>
                            Array.from(new Set([...previous, ...codes]))
                          )
                        }}
                        className="text-left text-sm font-semibold text-indigo-600 hover:text-indigo-800 md:text-right"
                      >
                        Select category programmes
                      </button>

                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="w-16 px-5 py-3">Select</th>
                            <th className="px-4 py-3">Programme Code</th>
                            <th className="px-4 py-3">Training Programme</th>
                            <th className="px-4 py-3">Audience</th>
                            <th className="px-4 py-3">Mode</th>
                            <th className="px-4 py-3">Duration</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {programs.map((program) => {
                            const isSelected =
                              selectedPrograms.includes(program.code)

                            return (
                              <tr
                                key={program.code}
                                onClick={() => toggleProgram(program.code)}
                                className={`cursor-pointer transition ${
                                  isSelected
                                    ? "bg-indigo-50/70"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <td className="px-5 py-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleProgram(program.code)}
                                    onClick={(event) => event.stopPropagation()}
                                    className="size-4 cursor-pointer rounded border-slate-300 accent-indigo-600"
                                  />
                                </td>

                                <td className="px-4 py-3 font-semibold text-indigo-700">
                                  {program.code}
                                </td>

                                <td className="max-w-md px-4 py-3 font-medium text-slate-800">
                                  {program.title}
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                  {program.audience}
                                </td>

                                <td className="px-4 py-3">
                                  <Badge variant="outline">
                                    {program.mode}
                                  </Badge>
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                  {program.duration}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="divide-y divide-slate-100 md:hidden">
                      {programs.map((program) => {
                        const isSelected =
                          selectedPrograms.includes(program.code)

                        return (
                          <label
                            key={program.code}
                            className={`flex cursor-pointer gap-3 p-4 transition ${
                              isSelected ? "bg-indigo-50" : "bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProgram(program.code)}
                              className="mt-1 size-4 shrink-0 accent-indigo-600"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold text-indigo-700">
                                  {program.code}
                                </span>

                                {isSelected && (
                                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                                    Selected
                                  </Badge>
                                )}
                              </div>

                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {program.title}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span>Audience: {program.audience}</span>
                                <span>•</span>
                                <span>{modeLabels[program.mode]}</span>
                                <span>•</span>
                                <span>{program.duration}</span>
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </Card>
                )
              })}

            {filteredPrograms.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Search className="mx-auto size-9 text-slate-400" />

                <h3 className="mt-3 font-semibold text-slate-900">
                  No programmes found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try another programme name or category.
                </p>

                <button
                  onClick={() => {
                    setSearch("")
                    setActiveCategory("ALL")
                    setShowSelectedOnly(false)
                  }}
                  className="mt-4 text-sm font-semibold text-indigo-600"
                >
                  Clear Filters
                </button>
              </div>
            )}

          </div>
        </section>

        {/* AUDIENCE LEGEND */}
        <Card className="border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-900">
            Target Audience Legend
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {audienceLegend.map((item) => (
              <div
                key={item.code}
                className="rounded-xl bg-slate-50 p-3"
              >
                <p className="font-bold text-indigo-700">
                  {item.code}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* SELECTED PROGRAMME SUMMARY */}
        {selectedCount > 0 && (
          <Card className="border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-slate-900">
                  Selected Training Programmes
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  You have selected {selectedCount} programme(s).
                </p>
              </div>

              <Badge className="w-fit bg-indigo-600 px-3 py-1.5 text-white">
                {selectedCount} Selected
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedProgramDetails.map((program) => (
                <span
                  key={program.code}
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700"
                >
                  {program.code}

                  <button
                    type="button"
                    onClick={() => toggleProgram(program.code)}
                    aria-label={`Remove ${program.code}`}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="font-bold text-slate-900">
                {selectedCount} Programme(s) Selected
              </p>

              <p className="text-xs text-slate-500">
                Select your required programmes to continue.
              </p>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={selectedCount === 0}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to Information
              <ArrowRight className="size-4" />
            </button>

          </div>
        </div>

      </div>
    </DashboardShell>
  )
}
