
import { requireRole } from "@/lib/auth/authorization";

export const instant = false;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole(["ADMIN"]);

  return <>{children}</>;
}
