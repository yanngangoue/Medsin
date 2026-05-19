import type { CodeableConcept, FhirId, Meta, Quantity, Reference } from "./primitive";

/** FHIR R4 Observation — mesures clinique / biologie (sous-ensemble). */
export interface FhirObservation {
  resourceType: "Observation";
  id?: FhirId;
  meta?: Meta;
  status: "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled";
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference;
  effectiveDateTime?: string;
  valueQuantity?: Quantity;
  valueString?: string;
  component?: {
    code: CodeableConcept;
    valueQuantity?: Quantity;
    valueString?: string;
  }[];
}
