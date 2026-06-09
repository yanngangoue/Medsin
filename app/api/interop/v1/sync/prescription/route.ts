import { catchRouteError } from "@/lib/api/catch-route-error";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { logInteropAction } from "@/lib/interop/audit-interop";
import { getInteropEventBus } from "@/lib/interop/events/bus";
import { interopError, interopJson } from "@/lib/interop/http";
import { canReadPatientRecord, sessionToPrincipal } from "@/lib/interop/gateway";
import { parseTenantFromHeaders } from "@/lib/interop/tenancy";
import type { NextRequest } from "next/server";
import { z } from "zod";

const syncBody = z.object({
  prescriptionFhirId: z.string().uuid(),
  partnerPharmacyId: z.string().min(1),
  /** Identifiant pharmacie côté partenaire (optionnel) */
  externalOrderId: z.string().optional(),
});

/** POST /api/interop/v1/sync/prescription — déclenche synchronisation vers pharmacie partenaire (événement). */
export async function POST(req: NextRequest) {
  return catchRouteError("interop/v1/sync/prescription/POST", async () => {
    const tenant = parseTenantFromHeaders(req.headers);
      if (!tenant) {
        return interopError(400, "tenant-required", "En-tête x-medisim-tenant requis (QC|ON|BC|AB)");
      }
      const session = await auth();
      const principal = sessionToPrincipal(session, tenant.province);
      if (!principal) return interopError(401, "unauthorized", "Session requise");
      if (!canReadPatientRecord(principal)) {
        return interopError(403, "forbidden", "Rôle insuffisant");
      }
    
      const json = await req.json().catch(() => null);
      const parsed = syncBody.safeParse(json);
      if (!parsed.success) {
        return interopError(400, "validation", parsed.error.message);
      }
    
      const traceId = randomUUID();
      await logInteropAction({
        userId: session!.user!.id,
        action: "PharmacySyncRequested",
        resourceType: "MedicationRequest",
        resourceId: parsed.data.prescriptionFhirId,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      });
    
      await getInteropEventBus().publish({
        id: traceId,
        type: "PharmacySyncRequested",
        occurredAt: new Date().toISOString(),
        tenantProvince: tenant.province,
        payload: {
          prescriptionFhirId: parsed.data.prescriptionFhirId,
          partnerPharmacyId: parsed.data.partnerPharmacyId,
          externalOrderId: parsed.data.externalOrderId,
        },
        correlationId: req.headers.get("x-correlation-id") ?? undefined,
      });
    
      return interopJson(
        {
          resourceType: "Parameters",
          parameter: [
            { name: "status", valueString: "queued" },
            { name: "traceId", valueString: traceId },
          ],
        },
        { status: 202 },
      );
  });
}
