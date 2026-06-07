"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { readEligibilityDraft } from "@/lib/onboarding/eligibility-session";
import { computeBmi } from "@/lib/eligibility";
import { dsBtnPrimary, dsBtnSecondary, dsCard } from "@/lib/design-system";
import type { MedicalQuestionnaireV2 } from "@/lib/schemas/medical-questionnaire-v2";

const SECTIONS = [
  "Biométrie",
  "Historique médical",
  "Médicaments",
  "GLP-1",
  "Mode de vie",
  "Consentements",
] as const;

const CHRONIC = [
  "Diabète type 2",
  "Hypertension",
  "Apnée du sommeil",
  "Dyslipidémie",
  "SOPK",
  "Autre",
];

export function MedicalQuestionnaireWizard() {
  const router = useRouter();
  const { status } = useSession();
  const [section, setSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<MedicalQuestionnaireV2>>({
    chronicConditions: [],
    medications: [],
    triedWeightLoss: false,
    activityDays: "1-2",
    tobacco: "never",
    alcohol: "none",
    sleepHours: 7,
    stressLevel: 3,
    medicationPreference: "none",
    recentHospitalization: false,
    consentMedical: undefined,
    consentDataSharing: undefined,
    consentAiCoach: undefined,
    consentPrivacy: undefined,
  });

  useEffect(() => {
    const elig = readEligibilityDraft();
    if (elig) {
      setForm((f) => ({
        ...f,
        height: elig.heightCm,
        weight: elig.weightKg,
        targetWeight: Math.max(60, elig.weightKg - 10),
      }));
    }

    void (async () => {
      const res = await fetch("/api/onboarding/medical-questionnaire");
      if (!res.ok) return;
      const data = (await res.json()) as { draft?: Partial<MedicalQuestionnaireV2> | null };
      if (data.draft && typeof data.draft === "object") {
        setForm((f) => ({ ...f, ...data.draft }));
      }
    })();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(
        `/auth/inscription?service=gestion-poids&callbackUrl=${encodeURIComponent("/questionnaire")}`,
      );
    }
  }, [status, router]);

  const bmi =
    form.height && form.weight ? computeBmi(form.weight, form.height) : null;

  async function autosave() {
    await fetch("/api/onboarding/medical-questionnaire", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  }

  async function submit() {
    setSaving(true);
    setError(null);
    const payload = form as MedicalQuestionnaireV2;
    const res = await fetch("/api/onboarding/medical-questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Soumission impossible.");
      setSaving(false);
      return;
    }
    router.push("/examen-en-cours");
  }

  if (status === "loading" || status === "unauthenticated") {
    return <p className="text-center text-sm text-[#6B7280]">Chargement…</p>;
  }

  return (
    <div>
      <div className="mb-6 flex gap-1">
        {SECTIONS.map((label, i) => (
          <div
            key={label}
            className={`h-1 flex-1 rounded-full ${i <= section ? "bg-[#3EBD93]" : "bg-[#E5E7EB]"}`}
            title={label}
          />
        ))}
      </div>

      <div className={dsCard}>
        <p className="text-xs font-bold uppercase tracking-wide text-[#1D4D3A]">
          Section {section + 1} — {SECTIONS[section]}
        </p>

        {section === 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Taille (cm)
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.height ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, height: Number(e.target.value) }))}
              />
            </label>
            <label className="text-sm">
              Poids actuel (kg)
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.weight ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) }))}
              />
            </label>
            <label className="text-sm">
              Poids cible (kg)
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.targetWeight ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, targetWeight: Number(e.target.value) }))}
              />
            </label>
            <label className="text-sm">
              Tour de taille (cm, optionnel)
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.waistCm ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, waistCm: Number(e.target.value) }))}
              />
            </label>
            {bmi ? (
              <p className="sm:col-span-2 text-sm text-[#6B7280]">IMC : {bmi.toFixed(1)}</p>
            ) : null}
          </div>
        ) : null}

        {section === 1 ? (
          <div className="mt-4 space-y-4">
            <fieldset>
              <legend className="text-sm font-medium">Maladies chroniques</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CHRONIC.map((c) => {
                  const checked = form.chronicConditions?.includes(c) ?? false;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          chronicConditions: checked
                            ? (f.chronicConditions ?? []).filter((x) => x !== c)
                            : [...(f.chronicConditions ?? []), c],
                        }))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs ${
                        checked ? "border-[#1D4D3A] bg-[#F0F7F4]" : "border-[#E5E7EB]"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label className="block text-sm">
              Chirurgies passées
              <textarea
                rows={2}
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.surgeries ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, surgeries: e.target.value }))}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.recentHospitalization ?? false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recentHospitalization: e.target.checked }))
                }
              />
              Hospitalisation dans les 6 derniers mois
            </label>
          </div>
        ) : null}

        {section === 2 ? (
          <div className="mt-4 space-y-4 text-sm">
            <label className="block">
              Médicaments actuels (un par ligne : nom, dosage, fréquence)
              <textarea
                rows={4}
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                placeholder="Ex. Ramipril 5 mg, 1x/jour"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    medications: e.target.value
                      .split("\n")
                      .filter(Boolean)
                      .map((line) => ({ name: line.trim() })),
                  }))
                }
              />
            </label>
            <label className="block">
              Allergies médicamenteuses
              <input
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.allergies ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
              />
            </label>
            <label className="block">
              Suppléments / vitamines
              <input
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.supplements ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, supplements: e.target.value }))}
              />
            </label>
          </div>
        ) : null}

        {section === 3 ? (
          <div className="mt-4 space-y-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.triedWeightLoss ?? false}
                onChange={(e) => setForm((f) => ({ ...f, triedWeightLoss: e.target.checked }))}
              />
              J&apos;ai déjà essayé de perdre du poids (régime, exercice, médicaments)
            </label>
            <label className="block">
              Résultats obtenus
              <textarea
                rows={2}
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.previousResults ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, previousResults: e.target.value }))}
              />
            </label>
            <label className="block">
              Pourquoi maintenant ?
              <textarea
                rows={3}
                required
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.motivation ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, motivation: e.target.value }))}
              />
            </label>
            <label className="block">
              Préférence médicament
              <select
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.medicationPreference ?? "none"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    medicationPreference: e.target.value as MedicalQuestionnaireV2["medicationPreference"],
                  }))
                }
              >
                <option value="none">Sans préférence</option>
                <option value="ozempic">Ozempic</option>
                <option value="wegovy">Wegovy</option>
                <option value="generic">Générique (sémaglutide)</option>
              </select>
            </label>
          </div>
        ) : null}

        {section === 4 ? (
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <label className="block sm:col-span-2">
              Activité physique (jours/semaine)
              <select
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.activityDays ?? "1-2"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    activityDays: e.target.value as MedicalQuestionnaireV2["activityDays"],
                  }))
                }
              >
                <option value="0">0</option>
                <option value="1-2">1–2</option>
                <option value="3-4">3–4</option>
                <option value="5+">5+</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              Notes alimentation
              <textarea
                rows={2}
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.dietNotes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, dietNotes: e.target.value }))}
              />
            </label>
            <label className="block">
              Tabac
              <select
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.tobacco ?? "never"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tobacco: e.target.value as MedicalQuestionnaireV2["tobacco"],
                  }))
                }
              >
                <option value="never">Jamais</option>
                <option value="former">Ancien fumeur</option>
                <option value="current">Fumeur actuel</option>
              </select>
            </label>
            <label className="block">
              Alcool
              <select
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.alcohol ?? "none"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    alcohol: e.target.value as MedicalQuestionnaireV2["alcohol"],
                  }))
                }
              >
                <option value="none">Aucun</option>
                <option value="occasional">Occasionnel</option>
                <option value="regular">Régulier</option>
              </select>
            </label>
            <label className="block">
              Sommeil (heures/nuit)
              <input
                type="number"
                step={0.5}
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.sleepHours ?? 7}
                onChange={(e) => setForm((f) => ({ ...f, sleepHours: Number(e.target.value) }))}
              />
            </label>
            <label className="block">
              Stress (1–5)
              <input
                type="number"
                min={1}
                max={5}
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
                value={form.stressLevel ?? 3}
                onChange={(e) => setForm((f) => ({ ...f, stressLevel: Number(e.target.value) }))}
              />
            </label>
          </div>
        ) : null}

        {section === 5 ? (
          <div className="mt-4 space-y-3 text-sm">
            {(
              [
                ["consentMedical", "Consentement au traitement par IPS via télémédecine"],
                ["consentDataSharing", "Consentement au partage avec l'équipe médicale"],
                ["consentAiCoach", "Consentement Anne — coach santé IA (personnalisation)"],
                ["consentPrivacy", "J'ai lu la politique de confidentialité (Loi 25)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={form[key] === true}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.checked ? true : undefined }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-[#DC2626]">{error}</p> : null}

        <div className="mt-8 flex justify-between gap-3">
          <button
            type="button"
            className={dsBtnSecondary}
            disabled={section === 0}
            onClick={() => setSection((s) => Math.max(0, s - 1))}
          >
            Précédent
          </button>
          {section < SECTIONS.length - 1 ? (
            <button
              type="button"
              className={dsBtnPrimary}
              onClick={() => {
                void autosave();
                setSection((s) => s + 1);
              }}
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              className={dsBtnPrimary}
              disabled={saving}
              onClick={() => void submit()}
            >
              {saving ? "Envoi…" : "Soumettre mon dossier médical"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
