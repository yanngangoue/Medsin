/**
 * Événements du domaine interop — normalisés pour NATS / Kafka / webhooks internes.
 * Les payloads référencent des ressources FHIR par référence logique (id + type).
 */
export type InteropEventType =
  | "PatientCreated"
  | "MedicationRequestSubmitted"
  | "MedicationRequestValidated"
  | "EncounterClosed"
  | "ObservationIngested"
  | "PharmacySyncRequested"
  | "DeliveryStatusUpdated"
  | "MetabolicIntakeRecorded"
  | "MetabolicProfileRecomputed";

export type InteropEnvelope<T extends InteropEventType = InteropEventType> = {
  id: string;
  type: T;
  occurredAt: string;
  tenantProvince: string;
  /** Référence versionnée consentement applicable (Loi 25) */
  consentVersion?: string;
  payload: Record<string, unknown>;
  correlationId?: string;
};
