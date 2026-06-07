import type { MedicalQuestionnaire } from "@prisma/client";

type Props = {
  q: Pick<
    MedicalQuestionnaire,
    | "height"
    | "weight"
    | "bmi"
    | "targetWeight"
    | "medicalHistory"
    | "currentMedications"
    | "allergies"
    | "hasTried"
    | "previousAttempts"
    | "motivations"
  >;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-4">
      <h3 className="text-sm font-bold text-[#1D4D3A]">{title}</h3>
      <div className="mt-3 space-y-2 text-sm text-[#1A1A2E]">{children}</div>
    </div>
  );
}

export function QuestionnaireSectionsView({ q }: Props) {
  const history = q.medicalHistory as Record<string, unknown>;
  const allergies = q.allergies as Record<string, unknown>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Section title="1 — Biométrie">
        <p>Taille : {q.height} cm · Poids : {q.weight} kg · IMC : {q.bmi.toFixed(1)}</p>
        <p>Objectif : {q.targetWeight} kg</p>
        {history.waistCm != null ? <p>Tour de taille : {String(history.waistCm)} cm</p> : null}
      </Section>

      <Section title="2 — Historique médical">
        <p>
          Chroniques :{" "}
          {Array.isArray(history.chronicConditions)
            ? (history.chronicConditions as string[]).join(", ") || "Aucune"
            : "—"}
        </p>
        <p>Chirurgies : {String(history.surgeries || "—")}</p>
        <p>
          Hospitalisation récente : {history.recentHospitalization ? "Oui" : "Non"}
        </p>
      </Section>

      <Section title="3 — Médicaments et allergies">
        <pre className="whitespace-pre-wrap font-sans text-xs">
          {JSON.stringify(q.currentMedications, null, 2)}
        </pre>
        <p>Allergies : {String(allergies.text ?? "—")}</p>
        {history.supplements ? <p>Suppléments : {String(history.supplements)}</p> : null}
      </Section>

      <Section title="4 — GLP-1">
        <p>Tentatives antérieures : {q.hasTried ? "Oui" : "Non"}</p>
        {q.previousAttempts ? <p>Résultats : {q.previousAttempts}</p> : null}
        <p>Motivation : {q.motivations}</p>
        <p>Préférence : {String(history.medicationPreference ?? "—")}</p>
      </Section>

      <Section title="5 — Mode de vie">
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
