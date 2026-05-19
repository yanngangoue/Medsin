/** Sous-ensemble FHIR R4 pour typer sans dépendre d’un bundle complet. */
export type FhirId = string;
export type FhirUri = string;
export type FhirDateTime = string;
export type FhirCode = string;

export interface Meta {
  versionId?: string;
  lastUpdated?: FhirDateTime;
  profile?: FhirUri[];
}

export interface Reference {
  reference?: string;
  display?: string;
}

export interface Coding {
  system?: FhirUri;
  code?: FhirCode;
  display?: string;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Quantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}
