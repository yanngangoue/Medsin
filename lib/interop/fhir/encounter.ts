import type { CodeableConcept, FhirId, Meta, Reference } from "./primitive";

/** FHIR R4 Encounter — consultation / téléconsultation. */
export interface FhirEncounter {
  resourceType: "Encounter";
  id?: FhirId;
  meta?: Meta;
  status:
    | "planned"
    | "arrived"
    | "triaged"
    | "in-progress"
    | "onleave"
    | "finished"
    | "cancelled"
    | "entered-in-error"
    | "unknown";
  class?: CodeableConcept;
  type?: CodeableConcept[];
  subject?: Reference;
  participant?: { individual?: Reference }[];
  period?: { start?: string; end?: string };
}
