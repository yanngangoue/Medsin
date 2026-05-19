import type { CodeableConcept, FhirId, Meta, Reference } from "./primitive";

/** FHIR R4 MedicationRequest — ordonnance / prescription. */
export interface FhirMedicationRequest {
  resourceType: "MedicationRequest";
  id?: FhirId;
  meta?: Meta;
  status:
    | "active"
    | "on-hold"
    | "cancelled"
    | "completed"
    | "entered-in-error"
    | "stopped"
    | "draft"
    | "unknown";
  intent: "proposal" | "plan" | "order" | "original-order" | "reflex-order" | "filler-order" | "instance-order" | "option";
  medicationCodeableConcept?: CodeableConcept;
  subject: Reference;
  encounter?: Reference;
  authoredOn?: string;
  requester?: Reference;
  dosageInstruction?: { text?: string }[];
  note?: { text?: string }[];
}
