import { catchRouteError } from "@/lib/api/catch-route-error";
import { randomUUID } from "node:crypto";
import { logInteropAction } from "@/lib/interop/audit-interop";
import { getInteropEventBus } from "@/lib/interop/events/bus";
import type { FhirObservation } from "@/lib/interop/fhir/observation";
import { interopError, interopJson } from "@/lib/interop/http";
import { parseTenantFromHeaders } from "@/lib/interop/tenancy";
import type { NextRequest } from "next/server";
import { z } from "zod";

const ObservationSchema = z.object({
  resourceType: z.literal("Observation"),
  id: z.string().optional(),
  status: z.enum(["registered", "preliminary", "final", "amended", "corrected", "cancelled", "entered-in-error", "unknown"]),
  code: z.object({
    text: z.string().optional(),
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  }),
  subject: z.object({ reference: z.string() }).optional(),
  effectiveDateTime: z.string().optional(),
  valueQuantity: z.object({ value: z.number(), unit: z.string().optional() }).optional(),
  valueString: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
  category: z.array(z.unknown()).optional(),
});

/**
 * POST /api/interop/v1/internal/Observation — écriture FHIR réservée au moteur IA / batch (pas de cookie session).
 * Auth : `Authorization: Bearer <MEDSIM_SERVICE_TOKEN>` ; journaliser toute requête (audit Loi 25).
 */
export async function POST(req: NextRequest) {
  return catchRouteError("interop/v1/internal/Observation/POST", async () => {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      const expected = process.env.MEDSIM_SERVICE_TOKEN;
      if (!expected || token !== expected) {
        return interopError(401, "unauthorized", "Jeton de service invalide ou absent");
      }
    
      const tenant = parseTenantFromHeaders(req.headers);
      if (!tenant) {
        return interopError(400, "tenant-required", "En-tête x-medisim-tenant requis (QC|ON|BC|AB)");
      }
    
      let raw: unknown;
      try {
        raw = await req.json();
      } catch {
        return interopError(400, "invalid-json", "Corps JSON invalide");
      }
      const parsed = ObservationSchema.safeParse(raw);
      if (!parsed.success) {
        return interopError(400, "invalid-resource", parsed.error.issues.map((i) => i.message).join("; "));
      }
      const obs = parsed.data as FhirObservation;
    
      const id = obs.id ?? randomUUID();
      const saved: FhirObservation = {
        ...obs,
        id,
        meta: { ...obs.meta, lastUpdated: new Date().toISOString() },
      };
    
      await logInteropAction({
        userId: null,
        action: "AI_ObservationWrite",
        resourceType: "Observation",
        resourceId: id,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      });
    
      await getInteropEventBus().publish({
        id: randomUUID(),
        type: "ObservationIngested",
        occurredAt: new Date().toISOString(),
        tenantProvince: tenant.province,
        payload: { observationId: id, subject: obs.subject },
        correlationId: req.headers.get("x-correlation-id") ?? undefined,
      });
    
      return interopJson(saved, { status: 201 });
  });
}
