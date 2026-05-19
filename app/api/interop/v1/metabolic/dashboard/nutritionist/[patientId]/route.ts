import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseTenantFromHeaders } from "@/lib/interop/tenancy";
import { sessionToPrincipal, canViewNutritionistMetabolicDashboard } from "@/lib/interop/gateway";
import { buildNutritionistMetabolicDashboard } from "@/lib/metabolic/dashboards";

export async function GET(req: NextRequest, ctx: { params: Promise<{ patientId: string }> }) {
  if (!parseTenantFromHeaders(req.headers)) {
    return NextResponse.json({ error: "x-medisim-tenant requis" }, { status: 400 });
  }
  const session = await auth();
  const tenant = parseTenantFromHeaders(req.headers)!;
  const principal = sessionToPrincipal(session, tenant.province);
  if (!principal || !canViewNutritionistMetabolicDashboard(principal)) {
    return NextResponse.json({ error: "Reserve aux nutritionnistes" }, { status: 403 });
  }
  const { patientId } = await ctx.params;
  const data = await buildNutritionistMetabolicDashboard(patientId);
  return NextResponse.json(data);
}
