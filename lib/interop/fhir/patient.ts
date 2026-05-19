import type { FhirId, Meta } from "./primitive";

export interface HumanName {
  use?: "usual" | "official" | "nickname";
  family?: string;
  given?: string[];
}

/** FHIR R4 Patient — champs usuels interop (pas exhaustif). */
export interface FhirPatient {
  resourceType: "Patient";
  id?: FhirId;
  meta?: Meta;
  identifier?: { system?: string; value?: string }[];
  active?: boolean;
  name?: HumanName[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  telecom?: { system?: "phone" | "email" | "url"; value?: string }[];
}
