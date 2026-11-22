
import { requireRole } from "@/lib/auth/authorization";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const instant = false;

export default async function SubAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole(["SUB_ADMIN"]);

  return (
    <DashboardShell role="SUB_ADMIN">
      {children}
    </DashboardShell>
  );
}
