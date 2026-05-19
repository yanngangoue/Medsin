/**
 * Consentement patient versionné (Loi 25 / DPIA) — persistance Prisma recommandée en phase 2.
 * MVP : types partagés pour contrats API et audit `consentVersion` sur les enveloppes d’événements.
 */
export type ConsentScope =
  | "care_delivery"
  | "data_sharing_provincial"
  | "research_opt_in"
  | "ai_decision_support"
  | "pharmacy_fulfillment"
  | "metabolic_behavior";

export type ConsentRecord = {
  id: string;
  patientId: string;
  scope: ConsentScope;
  /** opt-in explicite ou opt-out selon scope */
  decision: "granted" | "denied";
  version: string;
  validFrom: string;
  validUntil?: string;
  /** Empreinte du texte légal montré au patient */
  policyTextHash: string;
};

export function consentAppliesToEvent(scope: ConsentScope, eventType: string): boolean {
  const map: Partial<Record<ConsentScope, string[]>> = {
    pharmacy_fulfillment: ["PharmacySyncRequested", "MedicationRequestValidated"],
    metabolic_behavior: ["MetabolicIntakeRecorded", "MetabolicProfileRecomputed"],
    ai_decision_support: ["ObservationIngested"],
  };
  const list = map[scope];
  return !list || list.includes(eventType);
}
