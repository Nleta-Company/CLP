"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"

import ServiceRequestDetailClient from "./service-request-detail-client"

export default function ServiceRequestDetailPage() {
  return (
    <Suspense fallback={<ServiceRequestPageFallback />}>
      <ServiceRequestPageContent />
    </Suspense>
  )
}

function ServiceRequestPageContent() {
  const params = useParams<{ id: string }>()

  const id = params.id

  return <ServiceRequestDetailClient id={id} />
}

function ServiceRequestPageFallback() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="size-9 animate-pulse rounded-md bg-slate-200" />

          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-7 w-64 animate-pulse rounded bg-slate-200" />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        {/* Main content */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
            <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
          </div>

          <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  )
}