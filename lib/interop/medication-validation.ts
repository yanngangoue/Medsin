import { randomUUID } from "node:crypto";

/** Résultat validation prescription (interactions, titration) — brancher base médicamenteuse en prod. */
export type MedicationValidationIssue = {
  code: string;
  severity: "error" | "warning" | "information";
  detail: string;
};

export type MedicationValidationResult = {
  ok: boolean;
  issues: MedicationValidationIssue[];
};

/**
 * MVP : règles conservatrices sans Drug DB.
 * Critique : toujours auditer l’appel ; en production, coupler Vigilance / First Databank, etc.
 */
export function validateMedicationRequest(input: {
  medicationDisplay?: string;
  dosageText?: string;
}): MedicationValidationResult {
  const issues: MedicationValidationIssue[] = [];
  if (!input.medicationDisplay?.trim()) {
    issues.push({
      code: "medication-required",
      severity: "error",
      detail: "medicationCodeableConcept ou display requis",
    });
  }
  if (!input.dosageText?.trim()) {
    issues.push({
      code: "dosage-recommended",
      severity: "warning",
      detail: "dosageInstruction recommandé pour réduction des erreurs",
    });
  }
  return { ok: !issues.some((i) => i.severity === "error"), issues };
}

export function interopCorrelationId(req: Request): string {
  return req.headers.get("x-correlation-id")?.trim() || randomUUID();
}
