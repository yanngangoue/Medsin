import { catchRouteError } from "@/lib/api/catch-route-error";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseTenantFromHeaders } from "@/lib/interop/tenancy";
import { sessionToPrincipal, canManageDietaryConsent } from "@/lib/interop/gateway";
import { dietaryConsentSchema } from "@/lib/metabolic/schemas";
import { upsertDietaryConsent } from "@/lib/metabolic/repository";
import { logInteropAction } from "@/lib/interop/audit-interop";

/**
 * POST consentement explicite (Loi 25) pour donnees alimentaires et comportement metabolique.
 */
export async function POST(req: NextRequest) {
  return catchRouteError("interop/v1/metabolic/consent/dietary/POST", async () => {
    if (!parseTenantFromHeaders(req.headers)) {
        return NextResponse.json({ error: "x-medisim-tenant requis", code: "VALIDATION_ERROR" }, { status: 400 });
      }
      const session = await auth();
      const tenant = parseTenantFromHeaders(req.headers)!;
      const principal = sessionToPrincipal(session, tenant.province);
      if (!principal || !canManageDietaryConsent(principal)) {
        return NextResponse.json({ error: "Non autorise", code: "UNAUTHORIZED" }, { status: 401 });
      }
      const json = await req.json().catch(() => null);
      const parsed = dietaryConsentSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      await upsertDietaryConsent(principal.userId, { optIn: parsed.data.optIn, version: parsed.data.version });
      await logInteropAction({
        userId: principal.userId,
        action: "DietaryBehaviorConsentUpdated",
        resourceType: "Consent",
        resourceId: principal.userId,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      });
      return NextResponse.json({
        ok: true,
        dietaryBehaviorOptIn: parsed.data.optIn,
        version: parsed.data.version ?? "1.0",
      });
  });
}
