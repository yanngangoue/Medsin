import type { MetabolicIntakeCategory } from "@prisma/client";
import { logInteropAction } from "@/lib/interop/audit-interop";
import { getInteropEventBus } from "@/lib/interop/events/bus";
import { parseTenantFromHeaders } from "@/lib/interop/tenancy";
import { analyzeMetabolicFhir } from "@/lib/metabolic/ai-pipeline";
import { insertMetabolicIntake, getDietaryConsent } from "@/lib/metabolic/repository";
import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

export class MetabolicConsentError extends Error {
  constructor() {
    super("Consentement explicite requis pour les données alimentaires et comportementales (Loi 25).");
    this.name = "MetabolicConsentError";
  }
}

export async function requireDietaryOptIn(patientUserId: string): Promise<void> {
  const c = await getDietaryConsent(patientUserId);
  if (!c?.dietaryBehaviorOptIn) throw new MetabolicConsentError();
}

export async function persistMetabolicIntake(params: {
  req: NextRequest;
  patientUserId: string;
  actorUserId: string;
  category: MetabolicIntakeCategory;
  fhirResource: unknown;
}): Promise<{ id: string; fhirResource: unknown; aiAnalysis: unknown }> {
  await requireDietaryOptIn(params.patientUserId);
  const ai = await analyzeMetabolicFhir({ category: params.category, fhir: params.fhirResource });
  const row = await insertMetabolicIntake({
    patientUserId: params.patientUserId,
    category: params.category,
    fhirResource: params.fhirResource,
    aiAnalysis: ai,
  });
  const tenant = parseTenantFromHeaders(params.req.headers);
  const province = tenant?.province ?? "QC";
  const ip = params.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  await logInteropAction({
    userId: params.actorUserId,
    action: "MetabolicIntakeRecorded",
    resourceType: String(params.category),
    resourceId: row.id,
    ipAddress: ip,
  });

  await getInteropEventBus().publish({
    id: randomUUID(),
    type: "MetabolicIntakeRecorded",
    occurredAt: new Date().toISOString(),
    tenantProvince: province,
    consentVersion: (await getDietaryConsent(params.patientUserId))?.dietaryBehaviorVersion,
    payload: { intakeId: row.id, category: params.category, patientUserId: params.patientUserId },
    correlationId: params.req.headers.get("x-correlation-id") ?? undefined,
  });

  return { id: row.id, fhirResource: row.fhirResource, aiAnalysis: ai };
}
