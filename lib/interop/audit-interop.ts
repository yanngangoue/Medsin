import { writeAuditLog } from "@/lib/audit";
import type { InteropEnvelope } from "@/lib/interop/events/types";

/**
 * Journal interop : relie l’événement métier à AuditLog (traçabilité Loi 25).
 * Chaque mutation FHIR ou webhook doit appeler logInteropAction.
 * Champs DB limités : `entity` encode type + id de ressource ; détails en phase 2 (Json ou store FHIR).
 */
export async function logInteropAction(params: {
  userId?: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string | null;
}): Promise<void> {
  const entity =
    params.resourceType && params.resourceId
      ? `${params.resourceType}/${params.resourceId}`
      : params.resourceType ?? null;
  await writeAuditLog({
    userId: params.userId ?? null,
    action: `interop:${params.action}`,
    entity: entity ?? undefined,
    ipAddress: params.ipAddress ?? undefined,
  });
}

export async function logInteropEventPublished(
  envelope: InteropEnvelope,
  userId?: string | null,
  ipAddress?: string | null,
): Promise<void> {
  await logInteropAction({
    userId,
    action: `event:${envelope.type}`,
    resourceId: envelope.id,
    ipAddress,
  });
}
