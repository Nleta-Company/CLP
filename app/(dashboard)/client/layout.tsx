
import { requireRole } from "@/lib/auth/authorization";
export const instant = false;
export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole(["CLIENT"]);

  return <>{children}</>;
}
