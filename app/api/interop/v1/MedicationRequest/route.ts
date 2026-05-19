import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { logInteropAction } from "@/lib/interop/audit-interop";
import { getInteropEventBus } from "@/lib/interop/events/bus";
import type { FhirMedicationRequest } from "@/lib/interop/fhir/medication-request";
import { interopCorrelationId, validateMedicationRequest } from "@/lib/interop/medication-validation";
import { interopError, interopJson } from "@/lib/interop/http";
import { canWriteMedicationRequest, sessionToPrincipal } from "@/lib/interop/gateway";
import { parseTenantFromHeaders } from "@/lib/interop/tenancy";
import type { NextRequest } from "next/server";

/** POST /api/interop/v1/MedicationRequest — envoi ordonnance (FHIR) + validation MVP + événement bus. */
export async function POST(req: NextRequest) {
  const tenant = parseTenantFromHeaders(req.headers);
  if (!tenant) {
    return interopError(400, "tenant-required", "En-tête x-medisim-tenant requis (QC|ON|BC|AB)");
  }
  const session = await auth();
  const principal = sessionToPrincipal(session, tenant.province);
  if (!principal) return interopError(401, "unauthorized", "Session requise");
  if (!canWriteMedicationRequest(principal)) {
    return interopError(403, "forbidden", "Seuls les prescripteurs peuvent créer une MedicationRequest");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return interopError(400, "invalid-json", "Corps JSON invalide");
  }
  const mr = body as FhirMedicationRequest;
  if (mr?.resourceType !== "MedicationRequest") {
    return interopError(400, "invalid-resource", "resourceType doit être MedicationRequest");
  }

  const dosageText = mr.dosageInstruction?.map((d) => d.text).filter(Boolean).join("; ");
  const validation = validateMedicationRequest({
    medicationDisplay: mr.medicationCodeableConcept?.text ?? mr.medicationCodeableConcept?.coding?.[0]?.display,
    dosageText,
  });
  if (!validation.ok) {
    return interopJson(
      {
        resourceType: "OperationOutcome",
        issue: validation.issues.map((i) => ({
          severity: i.severity,
          code: "business-rule",
          diagnostics: i.detail,
          details: { coding: [{ code: i.code }] },
        })),
      },
      { status: 422 },
    );
  }

  const id = randomUUID();
  const saved: FhirMedicationRequest = {
    ...mr,
    id,
    meta: {
      ...mr.meta,
      lastUpdated: new Date().toISOString(),
    },
  };

  const correlationId = interopCorrelationId(req);
  await logInteropAction({
    userId: session!.user!.id,
    action: "MedicationRequestValidated",
    resourceType: "MedicationRequest",
    resourceId: id,
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
  });

  const bus = getInteropEventBus();
  await bus.publish({
    id: randomUUID(),
    type: "MedicationRequestValidated",
    occurredAt: new Date().toISOString(),
    tenantProvince: tenant.province,
    payload: { medicationRequestId: id, subject: mr.subject },
    correlationId,
  });

  return interopJson(saved, { status: 201 });
}
