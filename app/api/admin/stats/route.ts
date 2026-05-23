import { NextResponse } from "next/server";
import { getSessionUser, isStaffRole } from "@/lib/session";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { getAdminStats } from "@/lib/admin/stats";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!isStaffRole(user.role)) return forbidden();

  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
