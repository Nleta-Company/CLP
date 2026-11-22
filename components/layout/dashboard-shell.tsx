import { SidebarClient } from "@/components/layout/sidebar-client"
import { Topbar } from "@/components/layout/topbar"
import type { UserRole } from "@/lib/navigation"

interface DashboardShellProps {
  children: React.ReactNode
  role?: UserRole
}

export function DashboardShell({
  children,
  role = "ADMIN",
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          FIXED SIDEBAR
          Client boundary + Suspense handles usePathname()
      ====================================================== */}
      <SidebarClient role={role} />

      {/* =====================================================
          MAIN CONTENT AREA
          md:pl-64 = sidebar width
      ====================================================== */}
      <div className="min-h-screen md:pl-64">

        {/* ===================================================
            TOPBAR
        ==================================================== */}
        <Topbar />

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}
        <main className="min-w-0 p-4 md:p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  )
}