import type { MedicalQuestionnaire, User } from "@prisma/client";

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

export function buildIpsAiSummaryPlaceholder(
  q: QuestionnaireWithUser,
  age?: number | null,
): string {
  const history = q.medicalHistory as Record<string, unknown>;
  const conditions = Array.isArray(history.chronicConditions)
    ? (history.chronicConditions as string[])
    : [];
  const medPref =
    typeof history.medicationPreference === "string"
      ? history.medicationPreference
      : "GLP-1 à déterminer";
  const agePart = age != null ? `${age}` : "non précisé";
  const attention: string[] = [];
  if (conditions.length > 0) attention.push(`antécédents : ${conditions.join(", ")}`);
  if (history.recentHospitalization) attention.push("hospitalisation récente");
  if (q.hasTried) attention.push("tentatives antérieures de perte de poids");

  return [
    `Patient de ${agePart} ans, IMC ${q.bmi.toFixed(1)}, sans contre-indication majeure identifiée à ce stade.`,
    `Préférence déclarée : ${medPref}.`,
    `Candidat approprié pour un parcours GLP-1 sous supervision IPS.`,
    attention.length > 0
      ? `Points d'attention : ${attention.join(" ; ")}.`
      : "Points d'attention : surveillance standard post-initiation.",
    "Révision clinique IPS requise avant émission de l'ordonnance.",
  ].join("\n\n");
}
