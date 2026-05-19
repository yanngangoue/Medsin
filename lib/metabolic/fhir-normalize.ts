import type { FhirObservation } from "@/lib/interop/fhir/observation";
import type { FhirNutritionIntake } from "@/lib/interop/fhir/nutrition-intake";
import { EXTENSION_DIETARY_SUPPLEMENT } from "@/lib/interop/fhir/nutrition-intake";
import type { FhirMedicationStatement } from "@/lib/interop/fhir/medication-statement";
import { randomUUID } from "node:crypto";

export function fhirNutritionMeal(input: {
  patientUserId: string;
  items: {
    name: string;
    brand?: string;
    energyKcal?: number;
    proteinG?: number;
    carbG?: number;
    fatG?: number;
  }[];
  consumedAt?: string;
  notes?: string;
}): FhirNutritionIntake {
  return {
    resourceType: "NutritionIntake",
    id: randomUUID(),
    status: "completed",
    subject: { reference: `Patient/${input.patientUserId}` },
    effectiveDateTime: input.consumedAt ?? new Date().toISOString(),
    consumedItem: input.items.map((it) => ({
      nutritionProduct: {
        text: it.name,
        coding: it.brand ? [{ display: it.brand }] : undefined,
      },
      amount: {
        ...(it.energyKcal != null ? { value: it.energyKcal, unit: "kcal" } : {}),
      },
      extension:
        it.proteinG != null || it.carbG != null || it.fatG != null
          ? [
              ...(it.proteinG != null
                ? [{ url: "https://medsim.local/fhir/StructureDefinition/macro-protein-g", valueString: String(it.proteinG) }]
                : []),
              ...(it.carbG != null
                ? [{ url: "https://medsim.local/fhir/StructureDefinition/macro-carb-g", valueString: String(it.carbG) }]
                : []),
              ...(it.fatG != null
                ? [{ url: "https://medsim.local/fhir/StructureDefinition/macro-fat-g", valueString: String(it.fatG) }]
                : []),
            ]
          : undefined,
    })),
    ...(input.notes ? { meta: { profile: [`https://medsim.local/fhir/NutritionIntake/meal-note`] } } : {}),
  };
}

export function fhirNutritionSupplement(input: {
  patientUserId: string;
  productName: string;
  doseText?: string;
  takenAt?: string;
  ingredientsNote?: string;
}): FhirNutritionIntake {
  return {
    resourceType: "NutritionIntake",
    id: randomUUID(),
    status: "completed",
    subject: { reference: `Patient/${input.patientUserId}` },
    effectiveDateTime: input.takenAt ?? new Date().toISOString(),
    consumedItem: [
      {
        nutritionProduct: { text: input.productName },
        extension: [
          { url: EXTENSION_DIETARY_SUPPLEMENT, valueBoolean: true },
          ...(input.doseText ? [{ url: "https://medsim.local/fhir/StructureDefinition/dose-text", valueString: input.doseText }] : []),
          ...(input.ingredientsNote
            ? [{ url: "https://medsim.local/fhir/StructureDefinition/ingredients-note", valueString: input.ingredientsNote }]
            : []),
        ],
      },
    ],
  };
}

export function fhirObservationSleep(input: {
  patientUserId: string;
  hours: number;
  quality?: "poor" | "fair" | "good";
  nightOfDate?: string;
}): FhirObservation {
  return {
    resourceType: "Observation",
    id: randomUUID(),
    status: "final",
    category: [{ text: "Sleep" }],
    code: {
      text: "Sleep duration",
      coding: [{ system: "http://loinc.org", code: "93832-4", display: "Sleep duration" }],
    },
    subject: { reference: `Patient/${input.patientUserId}` },
    effectiveDateTime: input.nightOfDate ? `${input.nightOfDate}T12:00:00Z` : new Date().toISOString(),
    valueQuantity: { value: input.hours, unit: "h", system: "http://unitsofmeasure.org", code: "h" },
    component: input.quality
      ? [{ code: { text: "Sleep quality", coding: [{ code: "sleep-quality-self" }] }, valueString: input.quality }]
      : undefined,
  };
}

export function fhirObservationActivity(input: {
  patientUserId: string;
  minutes: number;
  intensity?: "light" | "moderate" | "vigorous";
  day?: string;
}): FhirObservation {
  return {
    resourceType: "Observation",
    id: randomUUID(),
    status: "final",
    category: [{ text: "Activity" }],
    code: {
      text: "Physical activity duration",
      coding: [{ system: "http://loinc.org", code: "68516-4", display: "Physical activity" }],
    },
    subject: { reference: `Patient/${input.patientUserId}` },
    effectiveDateTime: input.day ? `${input.day}T12:00:00Z` : new Date().toISOString(),
    valueQuantity: { value: input.minutes, unit: "min" },
    component: input.intensity ? [{ code: { text: "Intensity" }, valueString: input.intensity }] : undefined,
  };
}

export function fhirMedicationStatementGlp1(input: {
  patientUserId: string;
  productDisplay: string;
  takenAt?: string;
  dosageText?: string;
  note?: string;
}): FhirMedicationStatement {
  return {
    resourceType: "MedicationStatement",
    id: randomUUID(),
    status: "completed",
    medicationCodeableConcept: { text: input.productDisplay },
    subject: { reference: `Patient/${input.patientUserId}` },
    effectiveDateTime: input.takenAt ?? new Date().toISOString(),
    dosage: input.dosageText ? [{ text: input.dosageText }] : undefined,
    note: input.note ? [{ text: input.note }] : undefined,
  };
}
