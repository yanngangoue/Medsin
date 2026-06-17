import {
  GLP1_BLOOD_PRESSURE_OPTIONS,
  GLP1_HEALTH_1,
  GLP1_HEALTH_2,
  GLP1_HEALTH_3,
  GLP1_HEALTH_NONE_IDS,
  GLP1_HEART_RATE_OPTIONS,
} from "@/lib/patient/glp1-eligibility-questions";

type Props = {
  q: {
    height: number;
    weight: number;
    bmi: number;
    targetWeight: number;
    medicalHistory: Record<string, unknown>;
    currentMedications: unknown;
    allergies: unknown;
    familyHistory?: unknown;
    bloodPressure?: string | null;
    hasTried: boolean;
    previousAttempts: string | null;
    motivations: string;
  };
};

const ALL_HEALTH = [...GLP1_HEALTH_1, ...GLP1_HEALTH_2, ...GLP1_HEALTH_3];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-4">
      <h3 className="text-sm font-bold text-[#1D4D3A]">{title}</h3>
      <div className="mt-3 space-y-2 text-sm text-[#1A1A2E]">{children}</div>
    </div>
  );
}

function formatHealthIds(ids: unknown): string {
  if (!Array.isArray(ids) || ids.length === 0) return "—";
  const labels = (ids as string[])
    .filter(
      (id) =>
        id !== GLP1_HEALTH_NONE_IDS.health1 &&
        id !== GLP1_HEALTH_NONE_IDS.health2 &&
        id !== GLP1_HEALTH_NONE_IDS.health3,
    )
    .map((id) => ALL_HEALTH.find((h) => h.id === id)?.label ?? id);
  return labels.length ? labels.join(" · ") : "Aucune déclarée";
}

function yesNoLabel(v: unknown): string {
  if (v === "oui") return "Oui";
  if (v === "non") return "Non";
  return "—";
}

export function QuestionnaireSectionsView({ q }: Props) {
  const history = q.medicalHistory as Record<string, unknown>;
  const allergies = (q.allergies ?? {}) as Record<string, unknown>;
  const birth = history.birthDate as Record<string, string> | undefined;
  const bp =
    GLP1_BLOOD_PRESSURE_OPTIONS.find((o) => o.id === q.bloodPressure)?.hint ?? q.bloodPressure ?? "—";
  const hr =
    GLP1_HEART_RATE_OPTIONS.find((o) => o.id === history.restingHeartRate)?.hint ??
    String(history.restingHeartRate ?? "—");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Section title="1 — Identité & biométrie">
        <p>
          Sexe : {history.gender === "female" ? "Femme" : history.gender === "male" ? "Homme" : "—"}
          {birth ? ` · Né(e) le ${birth.day} ${birth.month} ${birth.year}` : null}
        </p>
        <p>
          Taille : {q.height} cm · Poids : {q.weight} kg · IMC : {q.bmi.toFixed(1)}
        </p>
        <p>Objectif : {q.targetWeight} kg</p>
        {history.waistCm != null ? <p>Tour de taille : {String(history.waistCm)} cm</p> : null}
      </Section>

      <Section title="2 — Dépistage clinique (conditions graves)">
        <p className="text-xs leading-relaxed">{formatHealthIds(history.health1)}</p>
      </Section>

      <Section title="3 — Antécédents médicaux (1/2)">
        <p className="text-xs leading-relaxed">{formatHealthIds(history.health2)}</p>
      </Section>

      <Section title="4 — Antécédents médicaux (2/2)">
        <p className="text-xs leading-relaxed">{formatHealthIds(history.health3)}</p>
      </Section>

      <Section title="5 — Questions complémentaires">
        <p>Opioïdes (3 mois) : {yesNoLabel(history.opioids3Months)}</p>
        <p>Chirurgie bariatrique : {yesNoLabel(history.bariatricSurgery)}</p>
        <p>Médicaments sur ordonnance : {yesNoLabel(history.prescriptionMeds)}</p>
      </Section>

      <Section title="6 — Signes vitaux déclarés">
        <p>Tension artérielle : {bp}</p>
        <p>Fréquence cardiaque au repos : {hr}</p>
      </Section>

      <Section title="7 — Médicaments et allergies">
        <pre className="whitespace-pre-wrap font-sans text-xs">
          {JSON.stringify(q.currentMedications, null, 2)}
        </pre>
        <p>Allergies : {String(allergies.text ?? "—")}</p>
        {history.supplements ? <p>Suppléments : {String(history.supplements)}</p> : null}
      </Section>

      <Section title="8 — Parcours GLP-1">
        <p>Tentatives antérieures : {q.hasTried ? "Oui" : "Non"}</p>
        {q.previousAttempts ? <p>Résultats : {q.previousAttempts}</p> : null}
        <p>Motivation : {q.motivations}</p>
        <p>Préférence : {String(history.medicationPreference ?? "—")}</p>
      </Section>

      <Section title="9 — Mode de vie">
        <p>Activité : {String(history.activityDays ?? "—")} j/sem.</p>
        <p>Alimentation : {String(history.dietNotes || "—")}</p>
        <p>
          Tabac : {String(history.tobacco)} · Alcool : {String(history.alcohol)}
        </p>
        <p>
          Sommeil : {String(history.sleepHours)} h · Stress : {String(history.stressLevel)}/5
        </p>
      </Section>
    </div>
  );
}
