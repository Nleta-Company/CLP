
import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/api-authorization";

export async function GET() {
  const auth = await requireApiRole(["ADMIN"]);

  if (auth.response) {
    return auth.response;
  }

  return NextResponse.json({
    success: true,
    message: "Admin access granted.",
    user: auth.user,
  });
}
