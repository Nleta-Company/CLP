
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileCheck2,
  RefreshCw,
  Search,
  User,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DashboardShell } from "@/components/layout/dashboard-shell";

type ApprovalItem = {
  id: string;
  reference: string;
  type: "PAYMENT_VERIFICATION" | "ATR_REPORT";
  title: string;
  client: string;
  submittedBy: string;
  amount: number | null;
  status: string;
  submittedAt: string;
};

type ApprovalData = {
  totalPending: number;
  pendingPayments: number;
  pendingReports: number;
  approvedThisMonth: number;
  returnedThisMonth: number;
  items: ApprovalItem[];
};

const emptyData: ApprovalData = {
  totalPending: 0,
  pendingPayments: 0,
  pendingReports: 0,
  approvedThisMonth: 0,
  returnedThisMonth: 0,
  items: [],
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number | null) {
  if (amount === null) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminApprovalsPage() {
  const [data, setData] = useState<ApprovalData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadApprovals() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/approvals", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.debug || result.message || "Unable to load approvals."
        );
      }

      setData({
        ...emptyData,
        ...result.data,
      });
    } catch (err) {
      console.error("Approvals loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load approval records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApprovals();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data.items;

    return data.items.filter((item) =>
      [
        item.reference,
        item.title,
        item.client,
        item.submittedBy,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [data.items, search]);

  const summaryCards = [
    {
      title: "Total Pending",
      value: data.totalPending,
      description: "Records awaiting review",
      icon: FileCheck2,
      color: "indigo",
    },
    {
      title: "Payment Verification",
      value: data.pendingPayments,
      description: "Payments awaiting verification",
      icon: CreditCard,
      color: "amber",
    },
    {
      title: "ATR-01 Reviews",
      value: data.pendingReports,
      description: "Reports awaiting review",
      icon: Clock3,
      color: "violet",
    },
    {
      title: "Approved This Month",
      value: data.approvedThisMonth,
      description: "Verified payments and approved reports",
      icon: CheckCircle2,
      color: "emerald",
    },
  ];

  const colors: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
    violet: "bg-violet-100 text-violet-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };

  return (
    <DashboardShell role="ADMIN">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <CheckCircle2 className="size-4" />
              Admin Control Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Approvals
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Review actual payment submissions and ATR-01 reports.
            </p>
          </div>

          <button
            type="button"
            onClick={loadApprovals}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">
                  Approval data unavailable
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadApprovals}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card
                key={card.title}
                className="border-slate-200 bg-white shadow-sm"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${colors[card.color]}`}
                    >
                      <Icon className="size-5" />
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                      LIVE
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-slate-900">
                    {loading ? "—" : card.value}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {card.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* RETURNED SUMMARY */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <XCircle className="size-5 text-red-600" />
            <div>
              <p className="font-semibold text-slate-800">
                Rejected / Returned This Month
              </p>
              <p className="text-sm text-slate-500">
                Rejected payments and ATR-01 reports returned for correction.
              </p>
            </div>
          </div>

          <p className="text-2xl font-bold text-red-700">
            {loading ? "—" : data.returnedThisMonth}
          </p>
        </div>

        {/* APPROVAL QUEUE */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Approval Queue
                </CardTitle>

                <p className="mt-1 text-sm text-slate-500">
                  Actual records awaiting Admin review.
                </p>
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search approvals..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Loading actual approval records...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="mx-auto size-9 text-emerald-500" />

                <p className="mt-3 font-semibold text-slate-800">
                  {search
                    ? "No matching records found"
                    : "No pending approvals"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? "Try a different search term."
                    : "There are currently no records awaiting review in the database."}
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        {[
                          "Approval",
                          "Client",
                          "Submitted By",
                          "Amount",
                          "Submitted",
                          "Status",
                          "Action",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredItems.map((item) => (
                        <tr
                          key={`${item.type}-${item.id}`}
                          className="border-b border-slate-100 transition-colors hover:bg-indigo-50/30"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                {item.type === "PAYMENT_VERIFICATION" ? (
                                  <CreditCard className="size-5" />
                                ) : (
                                  <FileCheck2 className="size-5" />
                                )}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {item.title}
                                </p>
                                <p className="mt-1 font-mono text-xs text-slate-400">
                                  {item.reference}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <Building2 className="size-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">
                                {item.client}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {item.submittedBy}
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                            {formatAmount(item.amount)}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {formatDate(item.submittedAt)}
                          </td>

                          <td className="px-6 py-5">
                            <Badge className="border-0 bg-amber-50 text-amber-700 hover:bg-amber-50">
                              <Clock3 className="mr-1.5 size-3.5" />
                              {item.status.replaceAll("_", " ")}
                            </Badge>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <Link
                              href={`/admin/approvals/${item.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              Review
                              <ArrowUpRight className="size-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE LIST */}
                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredItems.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={`/admin/approvals/${item.id}`}
                      className="block p-5 transition-colors hover:bg-indigo-50/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          {item.type === "PAYMENT_VERIFICATION" ? (
                            <CreditCard className="size-5" />
                          ) : (
                            <FileCheck2 className="size-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.title}
                              </p>
                              <p className="mt-1 font-mono text-xs text-slate-400">
                                {item.reference}
                              </p>
                            </div>

                            <ChevronRight className="mt-1 size-4 shrink-0 text-slate-300" />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Client
                              </p>
                              <p className="mt-1 truncate text-sm font-medium text-slate-700">
                                {item.client}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Submitted By
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {item.submittedBy}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                            <Badge className="border-0 bg-amber-50 text-amber-700">
                              <Clock3 className="mr-1.5 size-3.5" />
                              {item.status.replaceAll("_", " ")}
                            </Badge>

                            <span className="text-sm font-semibold text-slate-800">
                              {formatAmount(item.amount)}
                            </span>
                          </div>

                          <p className="mt-3 text-xs text-slate-400">
                            {formatDate(item.submittedAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* FOOTER */}
        <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
          <User className="size-4 shrink-0 text-indigo-600" />
          <p className="text-xs leading-5 text-indigo-700">
            This page displays database records for pending payment
            verification and ATR-01 report review. No sample records are used.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
