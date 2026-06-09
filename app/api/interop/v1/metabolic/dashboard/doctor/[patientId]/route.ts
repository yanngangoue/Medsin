import { catchRouteError } from "@/lib/api/catch-route-error";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseTenantFromHeaders } from "@/lib/interop/tenancy";
import { sessionToPrincipal, canViewDoctorMetabolicDashboard } from "@/lib/interop/gateway";
import { buildDoctorMetabolicDashboard } from "@/lib/metabolic/dashboards";

export async function GET(req: NextRequest, ctx: { params: Promise<{ patientId: string }> }) {
  return catchRouteError("interop/v1/metabolic/dashboard/doctor/[patientId]/GET", async () => {
    if (!parseTenantFromHeaders(req.headers)) {
        return NextResponse.json({ error: "x-medisim-tenant requis", code: "VALIDATION_ERROR" }, { status: 400 });
      }
      const session = await auth();
      const tenant = parseTenantFromHeaders(req.headers)!;
      const principal = sessionToPrincipal(session, tenant.province);
      if (!principal || !canViewDoctorMetabolicDashboard(principal)) {
        return NextResponse.json({ error: "Reserve aux medecins", code: "FORBIDDEN" }, { status: 403 });
      }
      const { patientId } = await ctx.params;
      const data = await buildDoctorMetabolicDashboard(patientId);
      return NextResponse.json(data);
  });
}
