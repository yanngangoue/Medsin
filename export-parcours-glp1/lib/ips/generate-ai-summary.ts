import Anthropic from "@anthropic-ai/sdk";
import type { MedicalQuestionnaire, User } from "@prisma/client";
import { buildIpsAiSummaryPlaceholder } from "@/lib/ips/questionnaire-summary";

type Input = MedicalQuestionnaire & {
  user: Pick<User, "prenom" | "email">;
  age?: number | null;
};

function buildContext(q: Input): string {
  const history = q.medicalHistory as Record<string, unknown>;
  const meds = JSON.stringify(q.currentMedications);
  const allergies = JSON.stringify(q.allergies);
  return [
    `Patient : ${q.user.prenom}, ${q.age ?? "?"} ans`,
    `IMC ${q.bmi.toFixed(1)}, poids ${q.weight} kg → objectif ${q.targetWeight} kg`,
    `Maladies chroniques : ${JSON.stringify(history.chronicConditions ?? [])}`,
    `Médicaments : ${meds}`,
    `Allergies : ${allergies}`,
    `Motivation : ${q.motivations}`,
    q.previousAttempts ? `Tentatives antérieures : ${q.previousAttempts}` : null,
    `Mode de vie : activité ${history.activityDays}, sommeil ${history.sleepHours}h, stress ${history.stressLevel}/5`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateIpsAiSummary(q: Input): Promise<string> {
  const fallback = buildIpsAiSummaryPlaceholder(q);
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return fallback;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system:
        "Tu rédiges un résumé clinique concis pour une IPS québécoise (GLP-1). 3-4 phrases, français canadien, factuel, sans diagnostic définitif. Mentionne admissibilité probable et points de vigilance.",
      messages: [
        {
          role: "user",
          content: `Résume ce dossier pour revue IPS :\n\n${buildContext(q)}`,
        },
      ],
    });

    const block = response.content.find((b) => b.type === "text");
    if (block && block.type === "text" && block.text.trim()) {
      return block.text.trim();
    }
  } catch (e) {
    console.error("[ips-ai-summary]", e);
  }

  return fallback;
}
