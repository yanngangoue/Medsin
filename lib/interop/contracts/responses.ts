/**
 * Contrats réponse types pour consommateurs internes (sans OpenAPI généré pour l’instant).
 */
import type { FhirPatient } from "@/lib/interop/fhir/patient";
import type { FhirMedicationRequest } from "@/lib/interop/fhir/medication-request";

export type CreatePatientResponse = FhirPatient;
export type MedicationRequestResponse = FhirMedicationRequest;
export type SyncPrescriptionAccepted = {
  resourceType: "Parameters";
  parameter: { name: string; valueString?: string }[];
};
