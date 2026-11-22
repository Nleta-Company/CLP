
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, Settings } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"

import { Separator } from "@/components/ui/separator"

import {
  navigationByRole,
  type UserRole,
} from "@/lib/navigation"

interface AppSidebarProps {
  role?: UserRole
}

export function AppSidebar({
  role = "ADMIN",
}: AppSidebarProps) {
  const pathname = usePathname()

  // Hide Batch Management only for Sub Admin
  const navigation = navigationByRole[role].filter((item) => {
    if (
      role === "SUB_ADMIN" &&
      item.href === "/sub-admin/batches"
    ) {
      return false
    }

    return true
  })

  return (
    <aside
      className="
        fixed inset-y-0 left-0 z-40 hidden w-64
        flex-col border-r border-indigo-100/80
        bg-white/95 shadow-sm backdrop-blur-xl md:flex
      "
    >
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="
            flex size-10 shrink-0 items-center justify-center
            rounded-xl bg-gradient-to-br from-indigo-600
            via-violet-600 to-blue-500 text-white
            shadow-lg shadow-indigo-500/25
          ">
            <ShieldCheck className="size-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold leading-none text-slate-900">
              CLP Portal
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              Corporate Learning
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-indigo-100/70" />

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-slate-500 group-hover:text-indigo-600",
                  ].join(" ")}
                >
                  <Icon className="size-4" />
                </span>

                <span className="truncate">
                  {item.title}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <Separator className="bg-indigo-100/70" />

      <div className="shrink-0 p-3">
        <div className="
          flex items-center gap-3 rounded-xl border
          border-slate-200 bg-slate-50/80 p-3
          transition-colors hover:border-indigo-100
          hover:bg-indigo-50/50
        ">
          <Avatar className="size-9 shrink-0 ring-2 ring-indigo-100">
            <AvatarFallback className="
              bg-gradient-to-br from-indigo-600 to-violet-600
              text-xs font-semibold text-white
            ">
              AD
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              Admin User
            </p>
            <p className="truncate text-xs text-slate-500">
              Administrator
            </p>
          </div>

          <button
            type="button"
            aria-label="Settings"
            className="
              flex size-8 shrink-0 items-center justify-center
              rounded-lg text-slate-400 transition-colors
              hover:bg-white hover:text-indigo-600
            "
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
