import type { MedicalQuestionnaire, User } from "@prisma/client";
import { GLP1_HEALTH_NONE_IDS } from "@/lib/patient/glp1-eligibility-questions";

type QuestionnaireWithUser = MedicalQuestionnaire & { user: Pick<User, "prenom" | "email"> };

export function formatQuestionnaireHeader(q: QuestionnaireWithUser, age?: number | null): string {
  const name = q.user.prenom || "Patient";
  const received = new Intl.DateTimeFormat("fr-CA", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(q.createdAt);
  const agePart = age != null ? `${age} ans` : "âge non précisé";
  return `Dossier — ${name} · Reçu le ${received} · IMC ${q.bmi.toFixed(1)} · ${agePart}`;
}

function countClinicalFlags(history: Record<string, unknown>): number {
  const lists = [history.health1, history.health2, history.health3].filter(Array.isArray) as string[][];
  return lists.reduce((acc, list) => {
    const flags = list.filter(
      (id) =>
        id !== GLP1_HEALTH_NONE_IDS.health1 &&
        id !== GLP1_HEALTH_NONE_IDS.health2 &&
        id !== GLP1_HEALTH_NONE_IDS.health3,
    );
    return acc + flags.length;
  }, 0);
}

export function buildIpsAiSummaryPlaceholder(
  q: QuestionnaireWithUser,
  age?: number | null,
): string {
  const history = q.medicalHistory as Record<string, unknown>;
  const medPref =
    typeof history.medicationPreference === "string"
      ? history.medicationPreference
      : "GLP-1 à déterminer";
  const agePart = age != null ? `${age}` : "non précisé";
  const attention: string[] = [];
  const clinicalFlags = countClinicalFlags(history);
  if (clinicalFlags > 0) attention.push(`${clinicalFlags} antécédent(s) clinique(s) déclaré(s)`);
  if (history.opioids3Months === "oui") attention.push("opioïdes récents");
  if (history.bariatricSurgery === "oui") attention.push("chirurgie bariatrique");
  if (q.bloodPressure === "stage2") attention.push("hypertension stade 2");
  if (history.restingHeartRate === "fast") attention.push("tachycardie au repos");
  if (q.hasTried) attention.push("tentatives antérieures de perte de poids");

  return [
    `Patient de ${agePart} ans, IMC ${q.bmi.toFixed(1)}, dossier clinique complet reçu.`,
    `Préférence déclarée : ${medPref}.`,
    `Candidat à évaluer pour un parcours GLP-1 sous supervision IPS.`,
    attention.length > 0
      ? `Points d'attention : ${attention.join(" ; ")}.`
      : "Points d'attention : surveillance standard post-initiation.",
    "Révision clinique IPS requise avant émission de l'ordonnance.",
  ].join("\n\n");
}
