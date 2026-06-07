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

export function buildIpsAiSummaryPlaceholder(q: QuestionnaireWithUser): string {
  const history = q.medicalHistory as Record<string, unknown>;
  const conditions = Array.isArray(history.chronicConditions)
    ? (history.chronicConditions as string[]).join(", ")
    : "aucune maladie chronique déclarée";
  return [
    `Patient·e avec IMC ${q.bmi.toFixed(1)} kg/m², objectif ${q.targetWeight} kg.`,
    `Antécédents : ${conditions || "non précisés"}.`,
    q.hasTried
      ? `Tentatives antérieures : ${q.previousAttempts?.trim() || "mentionnées sans détail"}.`
      : "Première démarche structurée de perte de poids.",
    "Révision clinique requise avant prescription GLP-1.",
  ].join(" ");
}
