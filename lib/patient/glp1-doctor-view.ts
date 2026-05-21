import {
  GLP1_BLOOD_PRESSURE_OPTIONS,
  GLP1_HEALTH_1,
  GLP1_HEALTH_2,
  GLP1_HEALTH_3,
  GLP1_HEALTH_NONE_IDS,
  GLP1_HEART_RATE_OPTIONS,
  type Glp1EligibilityAnswers,
  type Glp1YesNo,
} from "@/lib/patient/glp1-eligibility-questions";
import { GLP1_WEIGHT_GOAL_OPTIONS } from "@/lib/patient/glp1-weight-goal";
import { computeBmi } from "@/lib/eligibility";
import {
  computeAgeFromGlp1Birth,
  glp1RequiresMedicalReview,
  type Glp1HealthInfoPayload,
} from "@/lib/patient/glp1-dossier";

export type Glp1DoctorField = {
  label: string;
  value: string;
  highlight?: "alert" | "neutral";
};

export type Glp1DoctorSection = {
  title: string;
  fields: Glp1DoctorField[];
};

const YES_NO_FR: Record<Glp1YesNo, string> = {
  oui: "Oui",
  non: "Non",
};

const GENDER_FR = { male: "Homme", female: "Femme" } as const;

function healthSection(
  title: string,
  items: readonly { id: string; label: string }[],
  selected: string[] | undefined,
  noneId: string,
): Glp1DoctorField[] {
  const sel = selected ?? [];
  if (sel.includes(noneId)) {
    return [{ label: title, value: "Aucune des réponses ci-dessus", highlight: "neutral" }];
  }
  const labels = items.filter((i) => sel.includes(i.id)).map((i) => i.label);
  if (labels.length === 0) {
    return [{ label: title, value: "—", highlight: "neutral" }];
  }
  return labels.map((text, idx) => ({
    label: idx === 0 ? title : "",
    value: text,
    highlight: "alert" as const,
  }));
}

/** Rapport structuré pour la fiche médecin (lecture seule, toutes les réponses patient). */
export function buildGlp1DoctorReport(
  payload: Glp1HealthInfoPayload,
): {
  sections: Glp1DoctorSection[];
  alerts: string[];
  imc: number;
  age: number;
} {
  const w = payload.wizard;
  const weightKg = Number.parseFloat(w.weightKg ?? "0");
  const heightCm = Number.parseFloat(w.heightCm ?? "0");
  const imc = payload.imc || computeBmi(weightKg, heightCm);
  const age = computeAgeFromGlp1Birth(w);

  const alerts: string[] = [];
  if (glp1RequiresMedicalReview(w)) {
    alerts.push("Revue médicale recommandée selon les règles de triage (conditions signalées ou réponses à risque).");
  }
  if (age < 18) alerts.push("Patient de moins de 18 ans.");
  if (imc > 0 && imc < 27) {
    alerts.push("IMC < 27 — vérifier critères d’admissibilité GLP-1 et comorbidités déclarées.");
  }

  const goal =
    GLP1_WEIGHT_GOAL_OPTIONS.find((o) => o.id === w.weightGoal)?.label ?? w.weightGoal ?? "—";
  const bp =
    GLP1_BLOOD_PRESSURE_OPTIONS.find((o) => o.id === w.bloodPressure)?.label ??
    w.bloodPressure ??
    "—";
  const hr =
    GLP1_HEART_RATE_OPTIONS.find((o) => o.id === w.restingHeartRate)?.label ??
    w.restingHeartRate ??
    "—";

  const sections: Glp1DoctorSection[] = [
    {
      title: "Objectifs et mensurations (saisie patient)",
      fields: [
        { label: "Objectif de perte de poids", value: goal },
        { label: "Taille", value: `${w.heightCm} cm` },
        { label: "Poids actuel", value: `${w.weightKg} kg` },
        { label: "Poids idéal visé", value: `${w.idealWeightKg} kg` },
        { label: "IMC calculé", value: imc > 0 ? String(imc) : "—" },
        { label: "Âge (à partir de la date de naissance)", value: `${age} ans` },
        {
          label: "Date de naissance",
          value: `${w.birthDay} ${w.birthMonth} ${w.birthYear}`,
        },
        { label: "Genre déclaré", value: GENDER_FR[w.gender!] ?? "—" },
      ],
    },
    {
      title: "Antécédents — bloc 1 (conditions graves)",
      fields: healthSection(
        "Conditions",
        GLP1_HEALTH_1,
        w.health1,
        GLP1_HEALTH_NONE_IDS.health1,
      ),
    },
    {
      title: "Antécédents — bloc 2",
      fields: healthSection(
        "Conditions",
        GLP1_HEALTH_2,
        w.health2,
        GLP1_HEALTH_NONE_IDS.health2,
      ),
    },
    {
      title: "Antécédents — bloc 3",
      fields: healthSection(
        "Conditions",
        GLP1_HEALTH_3,
        w.health3,
        GLP1_HEALTH_NONE_IDS.health3,
      ),
    },
    {
      title: "Habitudes et traitements déclarés",
      fields: [
        {
          label: "Opioïdes (3 derniers mois)",
          value: YES_NO_FR[w.opioids3Months!] ?? "—",
          highlight: w.opioids3Months === "oui" ? "alert" : "neutral",
        },
        {
          label: "Chirurgie bariatrique",
          value: YES_NO_FR[w.bariatricSurgery!] ?? "—",
          highlight: w.bariatricSurgery === "oui" ? "alert" : "neutral",
        },
        {
          label: "Médicaments sur ordonnance",
          value: YES_NO_FR[w.prescriptionMeds!] ?? "—",
          highlight: w.prescriptionMeds === "oui" ? "alert" : "neutral",
        },
      ],
    },
    {
      title: "Signes vitaux déclarés (auto-déclaration)",
      fields: [
        { label: "Pression artérielle", value: bp },
        {
          label: "Fréquence cardiaque au repos",
          value: hr,
          highlight: w.restingHeartRate === "fast" ? "alert" : "neutral",
        },
      ],
    },
  ];

  return { sections, alerts, imc, age };
}
