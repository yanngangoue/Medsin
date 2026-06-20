import type { CodeableConcept, FhirId, Meta, Quantity, Reference } from "./primitive";

/** Extension Anne Santé : marque un complément alimentaire dans un item consommé (Profil URI stable). */
export const EXTENSION_DIETARY_SUPPLEMENT =
  "https://medsim.local/fhir/StructureDefinition/dietary-supplement";

/**
 * FHIR NutritionIntake (aligné R5 / usage interop — en R4 souvent mappé via Observation).
 * Référence : https://hl7.org/fhir/nutritionintake.html
 */
export interface FhirNutritionIntakeConsumedItem {
  type?: CodeableConcept;
  /** Produit / aliment / complément */
  nutritionProduct?: CodeableConcept;
  amount?: Quantity;
  extension?: {
    url: string;
    valueBoolean?: boolean;
    valueString?: string;
    valueCode?: string;
  }[];
}

export interface FhirNutritionIntake {
  resourceType: "NutritionIntake";
  id?: FhirId;
  meta?: Meta;
  status: "preparation" | "in-progress" | "not-done" | "on-hold" | "stopped" | "completed" | "entered-in-error" | "unknown";
  subject?: Reference;
  effectiveDateTime?: string;
  consumedItem: FhirNutritionIntakeConsumedItem[];
}
