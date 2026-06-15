"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { readEligibilityDraft } from "@/lib/onboarding/eligibility-session";
import { computeBmi } from "@/lib/eligibility";
import {
  ONBOARDING_SERVICES,
  serviceConnexionPath,
} from "@/lib/onboarding/service-routes";
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

const ACCENT = "#6C63FF";
const TEXT = "#1A1A2E";

function pillClass(active: boolean, size: "sm" | "md" = "md") {
  const pad = size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm";
  return `${pad} rounded-full border-2 font-medium transition-all duration-150 ${
    active
      ? "border-transparent text-white shadow-sm"
      : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB]"
  }`;
}

function pillStyle(active: boolean): CSSProperties | undefined {
  return active ? { backgroundColor: ACCENT, borderColor: ACCENT } : undefined;
}

function QuestionCard({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E8EAED] bg-[#FAFBFC] p-5">
      <p className="text-base font-semibold text-[#1A1A2E]">{label}</p>
      {hint ? <p className="mt-1 text-sm text-[#6B7280]">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function isSectionComplete(section: number, form: Partial<MedicalQuestionnaireV2>): boolean {
  switch (section) {
    case 0:
      return (
        typeof form.height === "number" &&
        form.height >= 100 &&
        form.height <= 250 &&
        typeof form.weight === "number" &&
        form.weight >= 30 &&
        form.weight <= 400 &&
        typeof form.targetWeight === "number" &&
        form.targetWeight >= 30 &&
        form.targetWeight <= 400
      );
    case 3:
      return Boolean(form.motivation?.trim());
    case 5:
      return (
        form.consentMedical === true &&
        form.consentDataSharing === true &&
        form.consentAiCoach === true &&
        form.consentPrivacy === true
      );
    default:
      return true;
  }
}

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
  const formRef = useRef(form);
  formRef.current = form;

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

  const autosave = useCallback(async () => {
    await fetch("/api/onboarding/medical-questionnaire", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formRef.current),
    });
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    const id = setInterval(() => {
      void autosave();
    }, 30_000);
    return () => clearInterval(id);
  }, [status, autosave]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(serviceConnexionPath(ONBOARDING_SERVICES.GLP1, "/questionnaire"));
    }
  }, [status, router]);

  const bmi =
    form.height && form.weight ? computeBmi(form.weight, form.height) : null;

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

  const canContinue = isSectionComplete(section, form);
  const isLastSection = section === SECTIONS.length - 1;

  if (status === "loading") {
    return (
      <div className={`${dsCard} mx-auto max-w-lg text-center`}>
        <p className="text-sm text-[#6B7280]">Chargement…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className={`${dsCard} mx-auto max-w-lg text-center`}>
        <h2 className="text-lg font-bold text-[#1A1A2E]">Connexion requise</h2>
        <p className="mt-3 text-sm text-[#6B7280]">
          Créez un compte ou connectez-vous pour remplir le questionnaire médical (environ 5 minutes).
        </p>
        <p className="mt-4 text-sm text-[#6B7280]">Redirection vers la connexion…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl pb-28">
      {/* Progress */}
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#6B7280]">
        <span>
          Étape {section + 1} sur {SECTIONS.length}
        </span>
        <span>{Math.round(((section + 1) / SECTIONS.length) * 100)} %</span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${((section + 1) / SECTIONS.length) * 100}%`,
            backgroundColor: ACCENT,
          }}
        />
      </div>

      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: TEXT }}>
          Section {section + 1} sur {SECTIONS.length}
        </h2>
        <p className="mt-1 text-lg font-medium text-[#6C63FF]">{SECTIONS[section]}</p>
      </div>

      <div className="space-y-5">
        {section === 0 ? (
          <>
            <QuestionCard label="Taille" hint="En centimètres">
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  className="w-full rounded-2xl border-2 border-[#E5E7EB] bg-white py-4 text-center text-2xl font-semibold text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                  value={form.height ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, height: Number(e.target.value) }))}
                />
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#9CA3AF]">
                  cm
                </span>
              </div>
            </QuestionCard>

            <QuestionCard label="Poids actuel" hint="En kilogrammes">
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full rounded-2xl border-2 border-[#E5E7EB] bg-white py-4 text-center text-2xl font-semibold text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                  value={form.weight ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) }))}
                />
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#9CA3AF]">
                  kg
                </span>
              </div>
            </QuestionCard>

            <QuestionCard label="Poids cible" hint="Objectif souhaité en kg">
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full rounded-2xl border-2 border-[#E5E7EB] bg-white py-4 text-center text-2xl font-semibold text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                  value={form.targetWeight ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, targetWeight: Number(e.target.value) }))}
                />
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#9CA3AF]">
                  kg
                </span>
              </div>
            </QuestionCard>

            <QuestionCard label="Tour de taille" hint="Optionnel — en cm">
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  className="w-full rounded-2xl border-2 border-[#E5E7EB] bg-white py-4 text-center text-2xl font-semibold text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                  value={form.waistCm ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, waistCm: Number(e.target.value) }))}
                />
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#9CA3AF]">
                  cm
                </span>
              </div>
            </QuestionCard>

            {bmi ? (
              <div className="rounded-2xl border border-[#6C63FF]/20 bg-[#6C63FF]/5 px-5 py-4 text-center">
                <p className="text-sm text-[#6B7280]">Indice de masse corporelle estimé</p>
                <p className="mt-1 text-3xl font-bold text-[#6C63FF]">{bmi.toFixed(1)}</p>
              </div>
            ) : null}
          </>
        ) : null}

        {section === 1 ? (
          <>
            <QuestionCard
              label="Maladies chroniques"
              hint="Sélectionnez tout ce qui s'applique"
            >
              <div className="flex flex-wrap gap-2">
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
                      className={pillClass(checked, "sm")}
                      style={pillStyle(checked)}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </QuestionCard>

            <QuestionCard
              label="Chirurgies passées"
              hint="Avez-vous déjà subi une intervention chirurgicale ?"
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`${pillClass(form.surgeries !== undefined)} flex-1`}
                  style={pillStyle(form.surgeries !== undefined)}
                  onClick={() => setForm((f) => ({ ...f, surgeries: f.surgeries ?? "" }))}
                >
                  Oui
                </button>
                <button
                  type="button"
                  className={`${pillClass(form.surgeries === undefined)} flex-1`}
                  style={pillStyle(form.surgeries === undefined)}
                  onClick={() => setForm((f) => ({ ...f, surgeries: undefined }))}
                >
                  Non
                </button>
              </div>
              {form.surgeries !== undefined ? (
                <textarea
                  rows={3}
                  className="mt-4 w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                  placeholder="Décrivez brièvement…"
                  value={form.surgeries}
                  onChange={(e) => setForm((f) => ({ ...f, surgeries: e.target.value }))}
                />
              ) : null}
            </QuestionCard>

            <QuestionCard
              label="Hospitalisation récente"
              hint="Dans les 6 derniers mois"
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`${pillClass(form.recentHospitalization === true)} flex-1`}
                  style={pillStyle(form.recentHospitalization === true)}
                  onClick={() => setForm((f) => ({ ...f, recentHospitalization: true }))}
                >
                  Oui
                </button>
                <button
                  type="button"
                  className={`${pillClass(form.recentHospitalization === false)} flex-1`}
                  style={pillStyle(form.recentHospitalization === false)}
                  onClick={() => setForm((f) => ({ ...f, recentHospitalization: false }))}
                >
                  Non
                </button>
              </div>
            </QuestionCard>
          </>
        ) : null}

        {section === 2 ? (
          <>
            <QuestionCard
              label="Médicaments actuels"
              hint="Un par ligne : nom, dosage, fréquence"
            >
              <textarea
                rows={5}
                className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                placeholder="Ex. Ramipril 5 mg, 1×/jour"
                value={form.medications?.map((m) => m.name).join("\n") ?? ""}
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
            </QuestionCard>

            <QuestionCard label="Allergies médicamenteuses">
              <input
                className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                placeholder="Ex. Pénicilline, iode…"
                value={form.allergies ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
              />
            </QuestionCard>

            <QuestionCard label="Suppléments et vitamines">
              <input
                className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                placeholder="Ex. Vitamine D, oméga-3…"
                value={form.supplements ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, supplements: e.target.value }))}
              />
            </QuestionCard>
          </>
        ) : null}

        {section === 3 ? (
          <>
            <QuestionCard
              label="Tentatives antérieures de perte de poids"
              hint="Régime, exercice ou médicaments"
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`${pillClass(form.triedWeightLoss === true)} flex-1`}
                  style={pillStyle(form.triedWeightLoss === true)}
                  onClick={() => setForm((f) => ({ ...f, triedWeightLoss: true }))}
                >
                  Oui
                </button>
                <button
                  type="button"
                  className={`${pillClass(form.triedWeightLoss === false)} flex-1`}
                  style={pillStyle(form.triedWeightLoss === false)}
                  onClick={() => setForm((f) => ({ ...f, triedWeightLoss: false }))}
                >
                  Non
                </button>
              </div>
            </QuestionCard>

            {form.triedWeightLoss ? (
              <QuestionCard label="Résultats obtenus">
                <textarea
                  rows={3}
                  className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                  value={form.previousResults ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, previousResults: e.target.value }))}
                />
              </QuestionCard>
            ) : null}

            <QuestionCard label="Pourquoi maintenant ?" hint="Requis">
              <textarea
                rows={4}
                required
                className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                placeholder="Décrivez votre motivation…"
                value={form.motivation ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, motivation: e.target.value }))}
              />
            </QuestionCard>

            <QuestionCard label="Préférence de médicament">
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["none", "Sans préférence"],
                    ["ozempic", "Ozempic®"],
                    ["wegovy", "Wegovy®"],
                    ["generic", "Générique"],
                  ] as const
                ).map(([value, label]) => {
                  const active = (form.medicationPreference ?? "none") === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`${pillClass(active, "sm")} w-full`}
                      style={pillStyle(active)}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          medicationPreference: value,
                        }))
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </QuestionCard>
          </>
        ) : null}

        {section === 4 ? (
          <>
            <QuestionCard label="Activité physique" hint="Jours d'activité par semaine">
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    ["0", "0"],
                    ["1-2", "1–2"],
                    ["3-4", "3–4"],
                    ["5+", "5+"],
                  ] as const
                ).map(([value, label]) => {
                  const active = (form.activityDays ?? "1-2") === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={pillClass(active, "sm")}
                      style={pillStyle(active)}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          activityDays: value,
                        }))
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </QuestionCard>

            <QuestionCard label="Notes alimentation" hint="Optionnel">
              <textarea
                rows={3}
                className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15"
                placeholder="Habitudes, restrictions, préférences…"
                value={form.dietNotes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, dietNotes: e.target.value }))}
              />
            </QuestionCard>

            <QuestionCard label="Tabac">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["never", "Jamais"],
                    ["former", "Ex-fumeur"],
                    ["current", "Fumeur"],
                  ] as const
                ).map(([value, label]) => {
                  const active = (form.tobacco ?? "never") === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={pillClass(active, "sm")}
                      style={pillStyle(active)}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          tobacco: value,
                        }))
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </QuestionCard>

            <QuestionCard label="Alcool">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["none", "Aucun"],
                    ["occasional", "Occasionnel"],
                    ["regular", "Régulier"],
                  ] as const
                ).map(([value, label]) => {
                  const active = (form.alcohol ?? "none") === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={pillClass(active, "sm")}
                      style={pillStyle(active)}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          alcohol: value,
                        }))
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </QuestionCard>

            <QuestionCard label="Sommeil" hint="Heures par nuit">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-[#6C63FF]"
                  value={form.sleepHours ?? 7}
                  onChange={(e) => setForm((f) => ({ ...f, sleepHours: Number(e.target.value) }))}
                />
                <span className="min-w-[3.5rem] text-center text-2xl font-bold text-[#6C63FF]">
                  {form.sleepHours ?? 7}h
                </span>
              </div>
            </QuestionCard>

            <QuestionCard label="Niveau de stress" hint="1 = très calme, 5 = très élevé">
              <div className="flex justify-between gap-2">
                {([1, 2, 3, 4, 5] as const).map((level) => {
                  const active = (form.stressLevel ?? 3) === level;
                  const emoji = ["😌", "🙂", "😐", "😟", "😰"][level - 1];
                  return (
                    <button
                      key={level}
                      type="button"
                      className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 py-3 transition ${
                        active
                          ? "border-transparent text-white shadow-sm"
                          : "border-[#E5E7EB] bg-white text-[#6B7280]"
                      }`}
                      style={active ? { backgroundColor: ACCENT } : undefined}
                      onClick={() => setForm((f) => ({ ...f, stressLevel: level }))}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs font-semibold">{level}</span>
                    </button>
                  );
                })}
              </div>
            </QuestionCard>
          </>
        ) : null}

        {section === 5 ? (
          <div className="space-y-4">
            {(
              [
                [
                  "consentMedical",
                  "Traitement par IPS",
                  "Je consens à être pris en charge par une infirmière praticienne spécialisée via télémédecine.",
                ],
                [
                  "consentDataSharing",
                  "Partage avec l'équipe médicale",
                  "J'autorise le partage de mon dossier avec les professionnels impliqués dans mon suivi.",
                ],
                [
                  "consentAiCoach",
                  "Coach Anne (IA)",
                  "J'accepte l'accompagnement personnalisé par Anne, coach santé IA de MedSim.",
                ],
                [
                  "consentPrivacy",
                  "Politique de confidentialité",
                  "J'ai lu et j'accepte la politique de confidentialité conforme à la Loi 25.",
                ],
              ] as const
            ).map(([key, title, description]) => {
              const checked = form[key] === true;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, [key]: checked ? undefined : true }))
                  }
                  className={`w-full rounded-2xl border-2 p-5 text-left transition ${
                    checked
                      ? "border-[#6C63FF] bg-[#6C63FF]/5"
                      : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                        checked
                          ? "border-[#6C63FF] bg-[#6C63FF] text-white"
                          : "border-[#D1D5DB] bg-white"
                      }`}
                    >
                      {checked ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A2E]">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">{description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#DC2626]">
            {error}
          </div>
        ) : null}
      </div>

      {/* Fixed bottom navigation */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E5E7EB] bg-white/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            type="button"
            className={`${dsBtnSecondary} shrink-0`}
            disabled={section === 0}
            onClick={() => setSection((s) => Math.max(0, s - 1))}
          >
            Précédent
          </button>
          {isLastSection ? (
            <button
              type="button"
              className={`${dsBtnPrimary} flex-1 disabled:cursor-not-allowed disabled:opacity-40`}
              disabled={saving || !canContinue}
              onClick={() => void submit()}
            >
              {saving ? "Envoi…" : "Soumettre mon dossier"}
            </button>
          ) : (
            <button
              type="button"
              className={`${dsBtnPrimary} flex-1 disabled:cursor-not-allowed disabled:opacity-40`}
              disabled={!canContinue}
              onClick={() => {
                void autosave();
                setSection((s) => s + 1);
              }}
            >
              Continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
