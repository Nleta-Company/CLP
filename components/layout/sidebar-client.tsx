"use client"

import { Suspense } from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import type { UserRole } from "@/lib/navigation"

interface SidebarClientProps {
  role: UserRole
}

export function SidebarClient({
  role,
}: SidebarClientProps) {
  return (
    <Suspense fallback={<SidebarFallback />}>
      <AppSidebar role={role} />
    </Suspense>
  )
}

function SidebarFallback() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-indigo-100/80 bg-white md:flex md:flex-col">
      {/* Logo area */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="size-10 animate-pulse rounded-xl bg-indigo-100" />

          <div className="space-y-1.5">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Navigation skeleton */}
      <div className="flex-1 space-y-2 border-t border-indigo-100/80 p-4">
        <div className="h-10 animate-pulse rounded-lg bg-indigo-50" />
        <div className="h-10 animate-pulse rounded-lg bg-slate-50" />
        <div className="h-10 animate-pulse rounded-lg bg-slate-50" />
        <div className="h-10 animate-pulse rounded-lg bg-slate-50" />
        <div className="h-10 animate-pulse rounded-lg bg-slate-50" />
        <div className="h-10 animate-pulse rounded-lg bg-slate-50" />
      </div>

      {/* User skeleton */}
      <div className="border-t border-indigo-100/80 p-4">
        <div className="flex items-center gap-3">
          <div className="size-9 animate-pulse rounded-full bg-slate-200" />

          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    </aside>
  )
}