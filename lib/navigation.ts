import {
  Award,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Layers } from "lucide-react";
export type UserRole =
  | "ADMIN"
  | "SUB_ADMIN"
  | "BDE"
  | "CLIENT"
  | "TRAINER"

export interface NavigationItem {
  title: string
  href: string
  icon: typeof LayoutDashboard
}

export const navigationByRole: Record<UserRole, NavigationItem[]> = {
  ADMIN: [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Approvals",
      href: "/admin/approvals",
      icon: ClipboardCheck,
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: FileCheck2,
    },
    {
      title: "Certificates",
      href: "/admin/certificates",
      icon: Award,
    },
    {
      title: "Documents",
      href: "/admin/documents",
      icon: FileText,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ],

  SUB_ADMIN: [
    {
      title: "Dashboard",
      href: "/sub-admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Requests",
      href: "/sub-admin/requests",
      icon: BriefcaseBusiness,
    },

    {
      title: "Batch Management",
      href: "/sub-admin/batches",
      icon: Layers,
    },
    {
      title: "Verification",
      href: "/sub-admin/verification",
      icon: ClipboardCheck,
    },
    {
      title: "Documents",
      href: "/sub-admin/documents",
      icon: FileText,
    },
    {
      title: "Trainer Assignment",
      href: "/sub-admin/trainers",
      icon: Users,
    },
    {
      title: "Reports",
      href: "/sub-admin/reports",
      icon: FileCheck2,
    },
  ],

  BDE: [
    {
      title: "Dashboard",
      href: "/bde",
      icon: LayoutDashboard,
    },
    {
      title: "Clients",
      href: "/bde/clients",
      icon: Building2,
    },
    {
      title: "Service Requests",
      href: "/bde/requests",
      icon: BriefcaseBusiness,
    },
    {
      title: "Follow-ups",
      href: "/bde/follow-ups",
      icon: ClipboardCheck,
    },
  ],

  CLIENT: [
    {
      title: "Dashboard",
      href: "/client",
      icon: LayoutDashboard,
    },
    {
      title: "Services",
      href: "/client/services",
      icon: BriefcaseBusiness,
    },
    {
      title: "My Requests",
      href: "/client/requests",
      icon: FileText,
    },
    {
      title: "Documents",
      href: "/client/documents",
      icon: FileCheck2,
    },
    {
      title: "Training",
      href: "/client/training",
      icon: Users,
    },
    {
      title: "Certificates",
      href: "/client/certificates",
      icon: Award,
    },
  ],

  TRAINER: [
    {
      title: "Dashboard",
      href: "/trainer",
      icon: LayoutDashboard,
    },
    {
      title: "Assignments",
      href: "/trainer/assignments",
      icon: BriefcaseBusiness,
    },
    {
      title: "Batches",
      href: "/trainer/batches",
      icon: Users,
    },
    {
      title: "Attendance",
      href: "/trainer/attendance",
      icon: ClipboardCheck,
    },
    {
      title: "Assessments",
      href: "/trainer/assessments",
      icon: FileCheck2,
    },
    {
      title: "Reports",
      href: "/trainer/reports",
      icon: FileText,
    },
  ],
}