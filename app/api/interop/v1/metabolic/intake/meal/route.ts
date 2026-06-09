import { catchRouteError } from "@/lib/api/catch-route-error";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseTenantFromHeaders } from "@/lib/interop/tenancy";
import { canIngestOwnMetabolicData, sessionToPrincipal } from "@/lib/interop/gateway";
import { mealIntakeSchema } from "@/lib/metabolic/schemas";
import { fhirNutritionMeal } from "@/lib/metabolic/fhir-normalize";
import { persistMetabolicIntake, MetabolicConsentError } from "@/lib/metabolic/record-intake";

export async function POST(req: NextRequest) {
  return catchRouteError("interop/v1/metabolic/intake/meal/POST", async () => {
    if (!parseTenantFromHeaders(req.headers)) {
        return NextResponse.json({ error: "x-medisim-tenant requis", code: "VALIDATION_ERROR" }, { status: 400 });
      }
      const session = await auth();
      const tenant = parseTenantFromHeaders(req.headers)!;
      const principal = sessionToPrincipal(session, tenant.province);
      if (!principal || !canIngestOwnMetabolicData(principal)) {
        return NextResponse.json({ error: "Non autorise", code: "UNAUTHORIZED" }, { status: 401 });
      }
      const json = await req.json().catch(() => null);
      const parsed = mealIntakeSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      try {
        const fhir = fhirNutritionMeal({ patientUserId: principal.userId, ...parsed.data });
        const out = await persistMetabolicIntake({
          req,
          patientUserId: principal.userId,
          actorUserId: principal.userId,
          category: "MEAL",
          fhirResource: fhir,
        });
        return NextResponse.json(
          { id: out.id, resource: out.fhirResource, aiAnalysis: out.aiAnalysis },
          { status: 201, headers: { "Content-Type": "application/fhir+json" } },
        );
      } catch (e) {
        if (e instanceof MetabolicConsentError) {
          return NextResponse.json({ error: e.message }, { status: 403 });
        }
        throw e;
      }
  });
}
