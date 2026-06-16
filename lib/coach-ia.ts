import Anthropic from "@anthropic-ai/sdk";
import { COACH_NAME } from "@/lib/coach-brand";
import type { WeightCheckInPublic, WeightProgramPublic } from "@/lib/patient/weight-program";
import { tendancePoids } from "@/lib/coach-weight-trends";

export const COACH_MODEL = "claude-sonnet-4-20250514";

/** Gabarit obligatoire des rapports hebdomadaires IPS (vendredi 8 h). */
export const ANNE_RAPPORT_IPS_GABARIT = `═══════════════════════════════
RAPPORT ANNE — [Nom] — Sem.[N]
═══════════════════════════════
📊 DONNÉES
Poids : X kg (Δ -X,X kg)
Énergie : X/5 | Sommeil : Xh
Nausées : X/5

📈 TENDANCE 4 SEMAINES
[Analyse en 2 phrases]

⚠️ POINTS D'ATTENTION
[Liste ou "Aucun"]

💬 EXTRAITS CONVERSATION
[3 échanges significatifs]

🔔 RECOMMANDATION
☐ Maintenir dose
☐ Envisager ajustement
☐ Consultation requise
═══════════════════════════════`;

export const COACH_SYSTEM_PROMPT = `Tu t'appelles ${COACH_NAME}. Tu es la coach santé IA de MedSim — plateforme médicale québécoise en gestion du poids GLP-1. Tu parles français canadien (Québec), chaleureuse, empathique, factuelle et proactive.

IDENTITÉ OBLIGATOIRE
- Tu es ${COACH_NAME}, une intelligence artificielle — jamais une humaine, jamais une IPS, jamais une médecin.
- Mentionne clairement que tu es une IA lorsque c'est pertinent (accueil, conseils sensibles).

═══ TES 5 RESPONSABILITÉS ═══

1) APRÈS CHAQUE CHECK-IN PATIENT
   • Analyser : poids + énergie (1-5) + sommeil (h) + nausées (1-5) + notes
   • Envoyer un message personnalisé au patient (3 à 5 phrases, 1-2 emojis max, question ouverte)
   • Générer un rapport structuré pour l'IPS (format MedSim)
   • Détecter si escalade nécessaire (nausées ≥ 4/5, perte > 2 kg/7 j, énergie ≤ 1/5 sur les 3 derniers check-ins)

2) CHAQUE LUNDI 9 H (CRON — MESSAGE PROACTIF)
   • Contacter PROACTIVEMENT chaque patient actif
   • Analyser la tendance des 4 dernières semaines
   • Envoyer un message de check-in hebdomadaire personnalisé
   • Rappeler la dose si oubli ou irrégularité détectée (sans modifier la prescription)

3) CHAQUE VENDREDI 8 H (CRON — RAPPORT IPS)
   • Produire un rapport hebdomadaire structuré pour chaque patient actif
   • Respecter EXACTEMENT le gabarit MedSim (voir ci-dessous)
   • Recommandation : Maintenir dose / Envisager ajustement / Consultation requise

4) SURVEILLANCE ESCALADES (CRON HORAIRE + POST CHECK-IN)
   • Nausées ≥ 4/5 → escalade IPS immédiate
   • Perte > 2 kg en 7 jours → escalade IPS
   • Énergie ≤ 1/5 sur 3 check-ins consécutifs → escalade IPS
   • En cas d'escalade : ton rassurant pour le patient + mention que l'IPS est avisée

5) CONVERSATION LIBRE (CHAT)
   • Répondre aux questions GLP-1, effets secondaires, mode de vie
   • 3 à 5 phrases, factuel, bienveillant
   • Terminer par une question ouverte

═══ GABARIT RAPPORT IPS (VENDREDI) ═══
${ANNE_RAPPORT_IPS_GABARIT}

═══ LIMITES ABSOLUES ═══
❌ Jamais de diagnostic médical
❌ Jamais modifier, augmenter ou diminuer une dose — renvoyer vers l'IPS
❌ Jamais prescrire ou recommander un médicament spécifique sans IPS
✅ Urgence médicale → « Appelez le 811 immédiatement » ou le 911
✅ Toujours rappeler que tu es une IA
✅ Doute clinique → « Discutez-en avec votre IPS »

═══ FORMAT MESSAGES PATIENT ═══
3 à 5 phrases · 1-2 emojis maximum · français québécois · question ouverte en conclusion.`;

export type CoachChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type CoachContextePatient = {
  prenom: string;
  semaineProgramme: number;
  poidsActuel: number;
  poidsDepart: number;
  poidsObjectif: number;
  deltaCetteSemaine: number;
  dernierCheckIn: {
    energie: number | null;
    sommeil: number | null;
    nausee: number | null;
    notes: string | null;
  } | null;
  tendance4Semaines: number[];
  medication: string;
  dose: string;
};

export type CoachContexte = {
  prenom?: string;
  programme: WeightProgramPublic;
  checkInsRecents?: WeightCheckInPublic[];
  medication?: string | null;
  dose?: string | null;
};

function semaineProgramme(startDate: string): number {
  const days = Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(days / 7) + 1);
}

function deltaCetteSemaine(checkIns: WeightCheckInPublic[], currentWeight: number): number {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const inWeek = [...checkIns]
    .filter((c) => new Date(c.recordedAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  if (inWeek.length >= 2) {
    return Math.round((inWeek[inWeek.length - 1]!.weight - inWeek[0]!.weight) * 10) / 10;
  }
  if (inWeek.length === 1) {
    return Math.round((currentWeight - inWeek[0]!.weight) * 10) / 10;
  }
  return 0;
}

function tendance4Semaines(checkIns: WeightCheckInPublic[]): number[] {
  return [...checkIns]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .slice(-4)
    .map((c) => c.weight);
}

export function buildCoachContextePatient(
  ctx: CoachContexte,
  checkIns: WeightCheckInPublic[],
): CoachContextePatient {
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
  const last = sorted[sorted.length - 1];

  return {
    prenom: ctx.prenom ?? "",
    semaineProgramme: semaineProgramme(ctx.programme.startDate),
    poidsActuel: ctx.programme.currentWeight,
    poidsDepart: ctx.programme.startWeight,
    poidsObjectif: ctx.programme.targetWeight,
    deltaCetteSemaine: deltaCetteSemaine(checkIns, ctx.programme.currentWeight),
    dernierCheckIn: last
      ? {
          energie: last.energie,
          sommeil: last.sommeil,
          nausee: last.nausee,
          notes: last.notes,
        }
      : null,
    tendance4Semaines: tendance4Semaines(checkIns),
    medication: ctx.medication ?? "Non précisé",
    dose: ctx.dose ?? "Non précisée",
  };
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

function formatCheckInLine(c: WeightCheckInPublic): string {
  const date = new Date(c.recordedAt).toLocaleDateString("fr-CA", { dateStyle: "medium" });
  const extras: string[] = [];
  if (c.energie != null) extras.push(`énergie ${c.energie}/5`);
  if (c.sommeil != null) extras.push(`sommeil ${c.sommeil} h`);
  if (c.nausee != null) extras.push(`nausée ${c.nausee}/5`);
  if (c.notes?.trim()) extras.push(`note: ${c.notes.trim()}`);
  const suffix = extras.length ? ` (${extras.join(", ")})` : "";
  return `- ${date} : ${c.weight.toFixed(1)} kg${suffix}`;
}

/** Tendance de poids — voir lib/coach-weight-trends.ts (safe client). */
export { tendancePoids } from "@/lib/coach-weight-trends";

export function construireContextePatient(ctx: CoachContexte): string {
  const { programme, prenom, checkInsRecents = programme.recentCheckIns } = ctx;
  const tendance = tendancePoids(checkInsRecents);
  const lignesCheckIns =
    checkInsRecents.length > 0
      ? checkInsRecents
          .slice()
          .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
          .slice(0, 10)
          .map(formatCheckInLine)
          .join("\n")
      : "Aucun check-in enregistré.";

  const contexteStructure = buildCoachContextePatient(ctx, checkInsRecents);

  return [
    "--- Contexte structuré (JSON) ---",
    JSON.stringify(contexteStructure, null, 2),
    "--- Résumé ---",
    prenom ? `Prénom : ${prenom}` : null,
    `Programme : ${programme.status}`,
    `Poids départ : ${programme.startWeight.toFixed(1)} kg`,
    `Poids actuel : ${programme.currentWeight.toFixed(1)} kg`,
    `Objectif : ${programme.targetWeight.toFixed(1)} kg`,
    `Progrès : ${programme.progressPct}% (${programme.weightLost.toFixed(1)} kg perdus)`,
    `Fréquence check-in : ${programme.checkInFreq === "DAILY" ? "quotidienne" : "hebdomadaire"}`,
    `Tendance : ${tendance.libelle}`,
    tendance.moyenneEnergie != null ? `Énergie moyenne (récent) : ${tendance.moyenneEnergie}/5` : null,
    tendance.moyenneSommeil != null ? `Sommeil moyen (récent) : ${tendance.moyenneSommeil} h` : null,
    `10 derniers check-ins :\n${lignesCheckIns}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildAnthropicMessages(
  historique: CoachChatTurn[],
  messagePatient: string,
): { prior: CoachChatTurn[]; consigne: string } {
  const prior = historique.filter((m) => m.content.trim().length > 0);
  const sansDoublon =
    prior.length > 0 && prior[prior.length - 1]?.role === "user"
      ? prior.slice(0, -1)
      : prior;
  return { prior: sansDoublon, consigne: messagePatient.trim() };
}

async function appelerClaude(input: {
  contexte: string;
  messages: CoachChatTurn[];
  consigneUtilisateur: string;
  maxTokens?: number;
}): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: COACH_MODEL,
    max_tokens: input.maxTokens ?? 512,
    system: `${COACH_SYSTEM_PROMPT}\n\n--- Données patient ---\n${input.contexte}`,
    messages: [
      ...input.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: input.consigneUtilisateur },
    ],
  });

  const block = response.content.find((c) => c.type === "text");
  const text = block?.type === "text" ? block.text : "";
  if (!text.trim()) {
    throw new Error("Anthropic response contained no text content");
  }
  return text.trim();
}

/** Réponse sans programme poids actif — pas de données biométriques. */
export async function coachRepondreStreamSansProgramme(
  prenom: string,
  historique: CoachChatTurn[],
  messagePatient: string,
  onToken: (chunk: string) => void,
): Promise<string> {
  const client = getClient();
  const contexte = [
    `Prénom : ${prenom.trim() || "Patient"}`,
    "Programme poids : non activé (paiement ou démarrage de traitement en attente).",
    "Données de check-in : aucune — ne pas inventer de chiffres de poids.",
    "Rôle : informer sur le GLP-1, les effets secondaires courants et le parcours MedSim.",
  ].join("\n");

  const { prior, consigne } = buildAnthropicMessages(historique, messagePatient);

  const stream = client.messages.stream({
    model: COACH_MODEL,
    max_tokens: 768,
    system: `${COACH_SYSTEM_PROMPT}\n\n--- Données patient ---\n${contexte}`,
    messages: [
      ...prior.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: consigne },
    ],
  });

  let fullText = "";
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta" &&
      event.delta.text
    ) {
      fullText += event.delta.text;
      onToken(event.delta.text);
    }
  }

  const trimmed = fullText.trim();
  if (!trimmed) {
    throw new Error("Anthropic stream contained no text content");
  }
  return trimmed;
}

/** Réponse conversationnelle streamée — retourne le texte complet une fois terminé. */
export async function coachRepondreStream(
  ctx: CoachContexte,
  historique: CoachChatTurn[],
  messagePatient: string,
  onToken: (chunk: string) => void,
): Promise<string> {
  const client = getClient();
  const contexte = construireContextePatient(ctx);
  const { prior, consigne } = buildAnthropicMessages(historique, messagePatient);

  const stream = client.messages.stream({
    model: COACH_MODEL,
    max_tokens: 1024,
    system: `${COACH_SYSTEM_PROMPT}\n\n--- Données patient ---\n${contexte}`,
    messages: [
      ...prior.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: consigne },
    ],
  });

  let fullText = "";
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta" &&
      event.delta.text
    ) {
      fullText += event.delta.text;
      onToken(event.delta.text);
    }
  }

  const trimmed = fullText.trim();
  if (!trimmed) {
    throw new Error("Anthropic stream contained no text content");
  }
  return trimmed;
}

/** Réponse conversationnelle à un message patient. */
export async function coachRepondre(
  ctx: CoachContexte,
  historique: CoachChatTurn[],
  messagePatient: string,
): Promise<string> {
  const contexte = construireContextePatient(ctx);
  const { prior, consigne } = buildAnthropicMessages(historique, messagePatient);

  return appelerClaude({
    contexte,
    messages: prior,
    consigneUtilisateur: consigne,
    maxTokens: 1024,
  });
}

/**
 * Message proactif généré après un check-in — célébration, tendance, prochaine action.
 */
export async function messageProactifApresCheckIn(
  programme: WeightProgramPublic,
  dernierCheckIn: WeightCheckInPublic,
  options?: { prenom?: string; checkInsRecents?: WeightCheckInPublic[] },
): Promise<string> {
  const checkInsRecents = options?.checkInsRecents ?? programme.recentCheckIns;
  const contexte = construireContextePatient({
    prenom: options?.prenom,
    programme,
    checkInsRecents,
  });

  const tendance = tendancePoids(checkInsRecents);
  const consigne = [
    "Le patient vient d'enregistrer un nouveau check-in.",
    `Poids enregistré : ${dernierCheckIn.weight.toFixed(1)} kg.`,
    dernierCheckIn.energie != null ? `Énergie déclarée : ${dernierCheckIn.energie}/5.` : null,
    dernierCheckIn.sommeil != null ? `Sommeil déclaré : ${dernierCheckIn.sommeil} h.` : null,
    dernierCheckIn.notes?.trim() ? `Note du patient : ${dernierCheckIn.notes.trim()}` : null,
    tendance.deltaDernierKg != null
      ? `Variation depuis le check-in précédent : ${tendance.deltaDernierKg > 0 ? "+" : ""}${tendance.deltaDernierKg} kg.`
      : null,
    "Rédige UN message proactif en tant qu'Anne (pas de salutation générique type « Bonjour » si tu as déjà échangé).",
    "Félicite ou rassure selon la tendance, commente énergie/sommeil si pertinent, propose UNE action concrète pour les prochains jours.",
  ]
    .filter(Boolean)
    .join("\n");

  return appelerClaude({
    contexte,
    messages: [],
    consigneUtilisateur: consigne,
    maxTokens: 512,
  });
}

/** Message d'accueil lors de la première ouverture du coach. */
export async function messageAccueilCoach(
  programme: WeightProgramPublic,
  options?: { prenom?: string },
): Promise<string> {
  const salut = options?.prenom ? options.prenom : "le patient";
  const contexte = construireContextePatient({ prenom: options?.prenom, programme });

  return appelerClaude({
    contexte,
    messages: [],
    consigneUtilisateur: `C'est la première interaction avec ${salut}. Présente-toi comme Anne, accueille-le chaleureusement, rappelle que tu es une IA, résume brièvement sa situation (${programme.currentWeight.toFixed(1)} kg vers ${programme.targetWeight.toFixed(1)} kg) et invite-le à partager comment il se sent cette semaine.`,
    maxTokens: 400,
  });
}

/** Alias — chat libre patient ↔ IA. */
export async function chatCoach(
  message: string,
  programme: WeightProgramPublic,
  historique: CoachChatTurn[],
  options?: { prenom?: string; checkInsRecents?: WeightCheckInPublic[] },
): Promise<string> {
  return coachRepondre(
    {
      prenom: options?.prenom,
      programme,
      checkInsRecents: options?.checkInsRecents,
    },
    historique,
    message,
  );
}

export async function envoyerRappelHebdomadaire(
  programme: WeightProgramPublic,
  dernierCheckIn: WeightCheckInPublic | null,
  options?: { prenom?: string },
): Promise<string> {
  if (dernierCheckIn) {
    return messageProactifApresCheckIn(programme, dernierCheckIn, options);
  }
  return messageAccueilCoach(programme, options);
}

export async function analyserCheckIn(
  checkIn: WeightCheckInPublic,
  historique: WeightCheckInPublic[],
  programme: WeightProgramPublic,
  options?: { prenom?: string },
): Promise<{ messagePatient: string; rapportIps: string; escalade: boolean }> {
  const escalade = detecterEscalade(checkIn, historique);

  const messagePatient = await messageProactifApresCheckIn(programme, checkIn, {
    ...options,
    checkInsRecents: historique,
  });

  const rapportIps = await genererRapportIps(
    programme,
    historique,
    options?.prenom,
    checkIn,
  );

  return { messagePatient, rapportIps, escalade };
}

export async function genererRapportIps(
  programme: WeightProgramPublic,
  checkIns: WeightCheckInPublic[],
  prenom?: string,
  dernierCheckIn?: WeightCheckInPublic,
  options?: { historiqueChat?: CoachChatTurn[]; weekNumber?: number },
): Promise<string> {
  const contexte = construireContextePatient({
    prenom,
    programme,
    checkInsRecents: checkIns,
  });

  const nom = prenom?.trim() || "Patient";
  const sem = options?.weekNumber ?? semaineProgramme(programme.startDate);

  const extraits =
    options?.historiqueChat
      ?.filter((m) => m.content.trim())
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Patient" : "Anne"} : ${m.content.slice(0, 120)}`)
      .join("\n") ?? "Aucun extrait disponible.";

  return appelerClaude({
    contexte,
    messages: [],
    consigneUtilisateur: [
      `Rédige le rapport hebdomadaire IPS pour ${nom}, semaine ${sem}.`,
      "Respecte EXACTEMENT le gabarit MedSim (lignes ═══, sections 📊 📈 ⚠️ 💬 🔔, cases ☐).",
      "Remplace [Nom] par le prénom du patient et [N] par le numéro de semaine.",
      "Utilise les vraies données du contexte — n'invente pas de chiffres.",
      dernierCheckIn
        ? `Dernier check-in : ${dernierCheckIn.weight} kg, énergie ${dernierCheckIn.energie ?? "N/D"}/5, sommeil ${dernierCheckIn.sommeil ?? "N/D"} h, nausées ${dernierCheckIn.nausee ?? "N/D"}/5.`
        : null,
      `Extraits de conversation récents :\n${extraits}`,
      "Coche UNE seule case sous RECOMMANDATION selon l'analyse clinique (sans prescrire).",
    ]
      .filter(Boolean)
      .join("\n"),
    maxTokens: 1200,
  });
}

/** Détecte si une escalade IPS est requise. */
export function detecterEscalade(
  checkIn: WeightCheckInPublic,
  historique: WeightCheckInPublic[],
): boolean {
  if (checkIn.nausee != null && checkIn.nausee >= 4) return true;

  const sorted = [...historique].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const inWeek = sorted.filter((c) => new Date(c.recordedAt).getTime() >= weekAgo);
  if (inWeek.length >= 2) {
    const delta = inWeek[inWeek.length - 1]!.weight - inWeek[0]!.weight;
    if (delta < -2) return true;
  }

  const recent = sorted.slice(-3);
  if (
    recent.length >= 3 &&
    recent.every((c) => c.energie != null && c.energie <= 1)
  ) {
    return true;
  }

  return false;
}
