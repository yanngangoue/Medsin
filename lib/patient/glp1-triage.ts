import {
  GLP1_HEALTH_1,
  GLP1_HEALTH_2,
  GLP1_HEALTH_3,
  GLP1_HEALTH_NONE_IDS,
  type Glp1EligibilityAnswers,
} from "@/lib/patient/glp1-eligibility-questions";
import { computeAgeFromGlp1Birth } from "@/lib/patient/glp1-dossier";
import { computeBmi } from "@/lib/eligibility";

export type Glp1TriageReason = {
  code: string;
  labelFr: string;
};

export type Glp1TriageResult = {
  /** Écarté du parcours GLP-1 à cette étape (critères d'exclusion stricts). */
  excluded: boolean;
  reasons: Glp1TriageReason[];
  /** Peut poursuivre vers la revue professionnelle (non exclu). */
  passedPreDiagnostic: boolean;
};

const ALL_HEALTH = [...GLP1_HEALTH_1, ...GLP1_HEALTH_2, ...GLP1_HEALTH_3];

function labelForId(id: string): string {
  return ALL_HEALTH.find((h) => h.id === id)?.label ?? id;
}

/** Situations health1 — contre-indications absolues au parcours automatisé. */
const HEALTH1_EXCLUSION_IDS = new Set(GLP1_HEALTH_1.map((h) => h.id));

/** Antécédents health2/health3 — exclusion stricte immédiate. */
const ADDITIONAL_EXCLUSION_IDS = new Set([
  "substance_use",
  "t1",
  "retinopathy",
  "thyroid_cancer_history",
  "pancreatitis",
  "all_meds_allergy",
]);

function selectedIds(answers: Glp1EligibilityAnswers, key: "health1" | "health2" | "health3"): string[] {
  const list = answers[key] ?? [];
  const noneId = GLP1_HEALTH_NONE_IDS[key];
  return list.filter((id) => id !== noneId);
}

/**
 * Premier tri automatique pré-diagnostique.
 * Les patients exclus ne sont pas transmis au professionnel de santé.
 * La décision thérapeutique finale appartient toujours au médecin (étapes suivantes).
 */
export function runGlp1PreDiagnosticTriage(answers: Glp1EligibilityAnswers): Glp1TriageResult {
  const reasons: Glp1TriageReason[] = [];

  for (const id of selectedIds(answers, "health1")) {
    if (HEALTH1_EXCLUSION_IDS.has(id)) {
      reasons.push({
        code: id,
        labelFr: GLP1_HEALTH_1.find((h) => h.id === id)?.label ?? id,
      });
    }
  }

  for (const key of ["health2", "health3"] as const) {
    for (const id of selectedIds(answers, key)) {
      if (ADDITIONAL_EXCLUSION_IDS.has(id)) {
        reasons.push({ code: id, labelFr: labelForId(id) });
      }
    }
  }

  const age = computeAgeFromGlp1Birth(answers);
  if (age < 18) {
    reasons.push({
      code: "age_minor",
      labelFr: "Moins de 18 ans — parcours GLP-1 réservé aux adultes.",
    });
  }

  const weightKg = Number.parseFloat(answers.weightKg ?? "0");
  const heightCm = Number.parseFloat(answers.heightCm ?? "0");
  const bmi = computeBmi(weightKg, heightCm);
  if (bmi > 0 && bmi < 18.5) {
    reasons.push({
      code: "bmi_underweight",
      labelFr: "IMC inférieur à 18,5 — profil non compatible avec un parcours GLP-1.",
    });
  }

  if (answers.opioids3Months === "oui") {
    reasons.push({
      code: "opioids_recent",
      labelFr: "Utilisation d'opioïdes au cours des 3 derniers mois.",
    });
  }

  if (answers.bloodPressure === "stage2") {
    reasons.push({
      code: "bp_stage2",
      labelFr: "Hypertension artérielle de stade 2 (≥ 140/90).",
    });
  }

  if (answers.restingHeartRate === "fast") {
    reasons.push({
      code: "hr_fast",
      labelFr: "Fréquence cardiaque au repos supérieure à 110 battements/min.",
    });
  }

  const excluded = reasons.length > 0;
  return {
    excluded,
    reasons,
    passedPreDiagnostic: !excluded,
  };
}
