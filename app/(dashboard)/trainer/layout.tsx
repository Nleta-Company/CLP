
import { requireRole } from "@/lib/auth/authorization";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const instant = false;

export default async function TrainerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole(["TRAINER"]);

  return (
    <DashboardShell role="TRAINER">
      {children}
    </DashboardShell>
  );
}
