import type { CodeableConcept, FhirId, Meta, Reference } from "./primitive";

/** FHIR R4 MedicationStatement — ex. dose GLP‑1 réellement prise (adhérence). */
export interface FhirMedicationStatement {
  resourceType: "MedicationStatement";
  id?: FhirId;
  meta?: Meta;
  status: "active" | "completed" | "entered-in-error" | "intended" | "stopped" | "on-hold" | "unknown" | "not-taken";
  medicationCodeableConcept?: CodeableConcept;
  subject: Reference;
  effectiveDateTime?: string;
  dateAsserted?: string;
  dosage?: { text?: string; timing?: { repeat?: { frequency?: number; period?: number; periodUnit?: string } } }[];
  note?: { text?: string }[];
}
