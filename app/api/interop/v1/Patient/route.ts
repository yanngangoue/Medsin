import { catchRouteError } from "@/lib/api/catch-route-error";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { logInteropAction } from "@/lib/interop/audit-interop";
import { getInteropEventBus } from "@/lib/interop/events/bus";
import type { FhirPatient } from "@/lib/interop/fhir/patient";
import { interopError, interopJson } from "@/lib/interop/http";
import { canReadPatientRecord, sessionToPrincipal } from "@/lib/interop/gateway";
import { parseTenantFromHeaders } from "@/lib/interop/tenancy";
import type { NextRequest } from "next/server";

/** POST /api/interop/v1/Patient — crée un enregistrement logique Patient FHIR (MVP : pas de persistance FHIR dédiée). */
export async function POST(req: NextRequest) {
  return catchRouteError("interop/v1/Patient/POST", async () => {
    const tenant = parseTenantFromHeaders(req.headers);
      if (!tenant) {
        return interopError(400, "tenant-required", "En-tête x-medisim-tenant requis (QC|ON|BC|AB)");
      }
      const session = await auth();
      const principal = sessionToPrincipal(session, tenant.province);
      if (!principal) {
        return interopError(401, "unauthorized", "Session requise");
      }
      if (!canReadPatientRecord(principal)) {
        return interopError(403, "forbidden", "Rôle insuffisant");
      }
    
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return interopError(400, "invalid-json", "Corps JSON invalide");
      }
      const p = body as FhirPatient;
      if (p?.resourceType !== "Patient") {
        return interopError(400, "invalid-resource", "resourceType doit être Patient");
      }
    
      const id = randomUUID();
      const patient: FhirPatient = {
        ...p,
        id,
        meta: {
          ...p.meta,
          lastUpdated: new Date().toISOString(),
          profile: [...(p.meta?.profile ?? []), "https://medsim.local/fhir/StructureDefinition/MedsimPatient"],
        },
      };
    
      await logInteropAction({
        userId: session!.user!.id,
        action: "PatientCreated",
        resourceType: "Patient",
        resourceId: id,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      });
    
      const bus = getInteropEventBus();
      const envId = randomUUID();
      await bus.publish({
        id: envId,
        type: "PatientCreated",
        occurredAt: new Date().toISOString(),
        tenantProvince: tenant.province,
        payload: { patientId: id },
        correlationId: req.headers.get("x-correlation-id") ?? undefined,
      });
    
      return interopJson(patient, { status: 201 });
  });
}
