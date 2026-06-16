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
import {
  BirthDateFields,
  BloodPressureSelect,
  GenderSelect,
  GLP1_HEALTH_1,
  GLP1_HEALTH_2,
  GLP1_HEALTH_3,
  GLP1_HEALTH_NONE_IDS,
  HealthChecklist,
  HeartRateSelect,
  YesNoSelect,
} from "@/components/onboarding/MedicalQuestionnaireClinicalFields";

const SECTIONS = [
  "Identité & biométrie",
  "Dépistage clinique",
  "Antécédents (1/2)",
  "Antécédents (2/2)",
  "Questions complémentaires",
  "Signes vitaux",
  "Médicaments",
  "Parcours GLP-1",
  "Mode de vie",
  "Consentements",
] as const;

const ACCENT = "#6C63FF";

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

const LIVE_INPUT =
  "w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-center text-sm font-medium text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15";
const LIVE_TEXTAREA =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#1A1A2E] outline-none transition focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15";

function LiveTypewriter({
  text,
  className,
  onDone,
}: {
  text: string;
  className?: string;
  onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        onDoneRef.current?.();
      }
    }, 16);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <p className={className}>
      {displayed}
      <span className="ml-0.5 inline-block animate-pulse text-[#6C63FF]">|</span>
    </p>
  );
}

function LiveHeader({ section, savedAt }: { section: number; savedAt: Date | null }) {
  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
            Consultation en direct
          </span>
          <span className="text-[10px] text-[#9CA3AF]">· {SECTIONS[section]}</span>
        </div>
        {savedAt ? (
          <span className="text-[10px] text-[#9CA3AF]">
            Sauvegardé {savedAt.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-0.5">
        {SECTIONS.map((name, i) => (
          <div
            key={i}
            title={name}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < section
                ? "bg-[#6C63FF]"
                : i === section
                  ? "bg-[#6C63FF]/40"
                  : "bg-[#E5E7EB]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function PastPromptBubble({ label }: { label: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-xl rounded-br-sm bg-[#F3F4F6] px-3 py-1.5 text-[10px] leading-snug text-[#6B7280]">
        {label}
      </div>
    </div>
  );
}

function QuestionCard({
  label,
  hint,
  children,
  live = false,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  live?: boolean;
}) {
  const [typingDone, setTypingDone] = useState(!live);

  useEffect(() => {
    setTypingDone(!live);
  }, [label, live]);

  return (
    <div className="rounded-xl border border-[#E8EAED] bg-white p-3.5 shadow-sm">
      {live ? (
        <LiveTypewriter
          text={label}
          className="text-xs font-medium text-[#1A1A2E]"
          onDone={() => setTypingDone(true)}
        />
      ) : (
        <p className="text-xs font-medium text-[#1A1A2E]">{label}</p>
      )}
      {hint && typingDone ? (
        <p className="mt-1 text-[10px] leading-snug text-[#6B7280]">{hint}</p>
      ) : null}
      {typingDone ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

function getPromptIds(section: number, form: Partial<MedicalQuestionnaireV2>): string[] {
  switch (section) {
    case 0:
      return ["gender", "birthDate", "height", "weight", "targetWeight", "waist"];
    case 1:
      return ["health1"];
    case 2:
      return ["health2"];
    case 3:
      return ["health3"];
    case 4:
      return ["opioids3Months", "bariatricSurgery", "prescriptionMeds"];
    case 5:
      return ["bloodPressure", "restingHeartRate"];
    case 6:
      return ["medications", "allergies", "supplements"];
    case 7:
      return form.triedWeightLoss
        ? ["triedWeightLoss", "previousResults", "motivation", "medicationPreference"]
        : ["triedWeightLoss", "motivation", "medicationPreference"];
    case 8:
      return ["activity", "diet", "tobacco", "alcohol", "sleep", "stress"];
    case 9:
      return ["consentMedical", "consentDataSharing", "consentAiCoach", "consentPrivacy"];
    default:
      return [];
  }
}

function getPromptLabel(id: string): string {
  const labels: Record<string, string> = {
    gender: "Sexe à la naissance",
    birthDate: "Date de naissance",
    height: "Taille",
    weight: "Poids actuel",
    targetWeight: "Poids cible",
    waist: "Tour de taille",
    health1: "Conditions graves à dépister",
    health2: "Antécédents médicaux (1/2)",
    health3: "Antécédents médicaux (2/2)",
    opioids3Months: "Opioïdes (3 derniers mois)",
    bariatricSurgery: "Chirurgie bariatrique",
    prescriptionMeds: "Médicaments sur ordonnance",
    bloodPressure: "Tension artérielle",
    restingHeartRate: "Fréquence cardiaque au repos",
    medications: "Médicaments actuels",
    allergies: "Allergies médicamenteuses",
    supplements: "Suppléments et vitamines",
    triedWeightLoss: "Tentatives antérieures de perte de poids",
    previousResults: "Résultats obtenus",
    motivation: "Pourquoi maintenant ?",
    medicationPreference: "Préférence de médicament",
    activity: "Activité physique",
    diet: "Notes alimentation",
    tobacco: "Tabac",
    alcohol: "Alcool",
    sleep: "Sommeil",
    stress: "Niveau de stress",
    consentMedical: "Traitement par IPS",
    consentDataSharing: "Partage avec l'équipe médicale",
    consentAiCoach: "Coach Anne (IA)",
    consentPrivacy: "Politique de confidentialité",
  };
  return labels[id] ?? id;
}

function isBirthDateComplete(form: Partial<MedicalQuestionnaireV2>): boolean {
  if (!form.birthMonth?.trim() || !form.birthDay?.trim() || !form.birthYear?.trim()) return false;
  const year = Number(form.birthYear);
  const day = Number(form.birthDay);
  return Number.isFinite(year) && year >= 1920 && year <= 2010 && Number.isFinite(day) && day >= 1 && day <= 31;
}

function isHealthComplete(field: "health1" | "health2" | "health3", form: Partial<MedicalQuestionnaireV2>): boolean {
  const list = form[field];
  return Array.isArray(list) && list.length > 0;
}

function isPromptComplete(id: string, form: Partial<MedicalQuestionnaireV2>): boolean {
  switch (id) {
    case "gender":
      return form.gender === "male" || form.gender === "female";
    case "birthDate":
      return isBirthDateComplete(form);
    case "height":
      return typeof form.height === "number" && form.height >= 100 && form.height <= 250;
    case "weight":
      return typeof form.weight === "number" && form.weight >= 30 && form.weight <= 400;
    case "targetWeight":
      return (
        typeof form.targetWeight === "number" &&
        form.targetWeight >= 30 &&
        form.targetWeight <= 400
      );
    case "health1":
      return isHealthComplete("health1", form);
    case "health2":
      return isHealthComplete("health2", form);
    case "health3":
      return isHealthComplete("health3", form);
    case "opioids3Months":
    case "bariatricSurgery":
    case "prescriptionMeds":
      return form[id] === "oui" || form[id] === "non";
    case "bloodPressure":
      return Boolean(form.bloodPressure);
    case "restingHeartRate":
      return Boolean(form.restingHeartRate);
    case "motivation":
      return Boolean(form.motivation?.trim());
    case "consentMedical":
      return form.consentMedical === true;
    case "consentDataSharing":
      return form.consentDataSharing === true;
    case "consentAiCoach":
      return form.consentAiCoach === true;
    case "consentPrivacy":
      return form.consentPrivacy === true;
    default:
      return true;
  }
}

function isSectionComplete(section: number, form: Partial<MedicalQuestionnaireV2>): boolean {
  return getPromptIds(section, form).every((id) => isPromptComplete(id, form));
}

export function MedicalQuestionnaireWizard() {
  const router = useRouter();
  const { status } = useSession();
  const [section, setSection] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [form, setForm] = useState<Partial<MedicalQuestionnaireV2>>({
    health1: [],
    health2: [],
    health3: [],
    medications: [],
    triedWeightLoss: false,
    activityDays: "1-2",
    tobacco: "never",
    alcohol: "none",
    sleepHours: 7,
    stressLevel: 3,
    medicationPreference: "none",
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
    const res = await fetch("/api/onboarding/medical-questionnaire", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formRef.current),
    });
    if (res.ok) setSavedAt(new Date());
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

  const promptIds = getPromptIds(section, form);
  const currentPromptId = promptIds[promptIndex] ?? promptIds[0];
  const canContinuePrompt = isPromptComplete(currentPromptId, form);
  const isLastPrompt = promptIndex >= promptIds.length - 1;

  useEffect(() => {
    setPromptIndex(0);
  }, [section]);

  useEffect(() => {
    if (promptIndex >= promptIds.length) {
      setPromptIndex(Math.max(0, promptIds.length - 1));
    }
  }, [promptIds.length, promptIndex]);

  function goBack() {
    if (promptIndex > 0) {
      setPromptIndex((i) => i - 1);
      return;
    }
    if (section > 0) {
      const prevSection = section - 1;
      const prevPrompts = getPromptIds(prevSection, form);
      setSection(prevSection);
      setPromptIndex(Math.max(0, prevPrompts.length - 1));
    }
  }

  function goForward() {
    if (!isLastPrompt) {
      setPromptIndex((i) => i + 1);
      return;
    }
    void autosave();
    setSection((s) => s + 1);
    setPromptIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const isLastSection = section === SECTIONS.length - 1;
  const canContinue = isLastSection && isLastPrompt
    ? isSectionComplete(section, form)
    : canContinuePrompt;

  function renderCurrentPrompt() {
    switch (currentPromptId) {
      case "gender":
        return (
          <QuestionCard live label="Sexe à la naissance" hint="Requis pour l'évaluation clinique">
            <GenderSelect
              value={form.gender}
              onChange={(gender) => setForm((f) => ({ ...f, gender }))}
            />
          </QuestionCard>
        );
      case "birthDate":
        return (
          <QuestionCard live label="Date de naissance" hint="Mois, jour et année">
            <BirthDateFields
              birthMonth={form.birthMonth}
              birthDay={form.birthDay}
              birthYear={form.birthYear}
              onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            />
          </QuestionCard>
        );
      case "height":
        return (
          <QuestionCard live label="Taille" hint="En centimètres">
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                className={LIVE_INPUT}
                value={form.height ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, height: Number(e.target.value) }))}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#9CA3AF]">
                cm
              </span>
            </div>
          </QuestionCard>
        );
      case "weight":
        return (
          <QuestionCard live label="Poids actuel" hint="En kilogrammes">
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                className={LIVE_INPUT}
                value={form.weight ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) }))}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#9CA3AF]">
                kg
              </span>
            </div>
            {bmi ? (
              <p className="mt-2 text-center text-[10px] text-[#6B7280]">
                IMC estimé : <span className="font-semibold text-[#6C63FF]">{bmi.toFixed(1)}</span>
              </p>
            ) : null}
          </QuestionCard>
        );
      case "targetWeight":
        return (
          <QuestionCard live label="Poids cible" hint="Objectif souhaité en kg">
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                className={LIVE_INPUT}
                value={form.targetWeight ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, targetWeight: Number(e.target.value) }))}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#9CA3AF]">
                kg
              </span>
            </div>
          </QuestionCard>
        );
      case "waist":
        return (
          <QuestionCard live label="Tour de taille" hint="Optionnel — en cm">
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                className={LIVE_INPUT}
                value={form.waistCm ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, waistCm: Number(e.target.value) }))}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#9CA3AF]">
                cm
              </span>
            </div>
          </QuestionCard>
        );
      case "health1":
        return (
          <QuestionCard
            live
            label="Parmi les situations suivantes, lesquelles vous concernent ?"
            hint="Cochez toutes les cases applicables ou « Aucune des réponses ci-dessus »"
          >
            <HealthChecklist
              items={GLP1_HEALTH_1}
              noneId={GLP1_HEALTH_NONE_IDS.health1}
              selected={form.health1 ?? []}
              onChange={(health1) => setForm((f) => ({ ...f, health1 }))}
            />
          </QuestionCard>
        );
      case "health2":
        return (
          <QuestionCard
            live
            label="Antécédents médicaux — partie 1"
            hint="Sélectionnez tout ce qui s'applique à votre situation"
          >
            <HealthChecklist
              items={GLP1_HEALTH_2}
              noneId={GLP1_HEALTH_NONE_IDS.health2}
              selected={form.health2 ?? []}
              onChange={(health2) => setForm((f) => ({ ...f, health2 }))}
            />
          </QuestionCard>
        );
      case "health3":
        return (
          <QuestionCard
            live
            label="Antécédents médicaux — partie 2"
            hint="Incluant diabète, thyroïde, pancréatite, MEN2, etc."
          >
            <HealthChecklist
              items={GLP1_HEALTH_3}
              noneId={GLP1_HEALTH_NONE_IDS.health3}
              selected={form.health3 ?? []}
              onChange={(health3) => setForm((f) => ({ ...f, health3 }))}
            />
          </QuestionCard>
        );
      case "opioids3Months":
        return (
          <QuestionCard
            live
            label="Avez-vous pris des opioïdes au cours des 3 derniers mois ?"
            hint="Incluant codéine, morphine, oxycodone, fentanyl, etc."
          >
            <YesNoSelect
              value={form.opioids3Months}
              onChange={(opioids3Months) => setForm((f) => ({ ...f, opioids3Months }))}
            />
          </QuestionCard>
        );
      case "bariatricSurgery":
        return (
          <QuestionCard
            live
            label="Avez-vous déjà subi une chirurgie bariatrique ?"
            hint="Bypass gastrique, sleeve, bande gastrique, etc."
          >
            <YesNoSelect
              value={form.bariatricSurgery}
              onChange={(bariatricSurgery) => setForm((f) => ({ ...f, bariatricSurgery }))}
            />
          </QuestionCard>
        );
      case "prescriptionMeds":
        return (
          <QuestionCard
            live
            label="Prenez-vous actuellement des médicaments sur ordonnance ?"
          >
            <YesNoSelect
              value={form.prescriptionMeds}
              onChange={(prescriptionMeds) => setForm((f) => ({ ...f, prescriptionMeds }))}
            />
          </QuestionCard>
        );
      case "bloodPressure":
        return (
          <QuestionCard
            live
            label="Quelle est votre plage de tension artérielle habituelle ?"
            hint="D'après votre dernière mesure ou suivi médical"
          >
            <BloodPressureSelect
              value={form.bloodPressure}
              onChange={(bloodPressure) => setForm((f) => ({ ...f, bloodPressure }))}
            />
          </QuestionCard>
        );
      case "restingHeartRate":
        return (
          <QuestionCard
            live
            label="Quelle est votre fréquence cardiaque moyenne au repos ?"
          >
            <HeartRateSelect
              value={form.restingHeartRate}
              onChange={(restingHeartRate) => setForm((f) => ({ ...f, restingHeartRate }))}
            />
          </QuestionCard>
        );
      case "medications":
        return (
          <QuestionCard live label="Médicaments actuels" hint="Un par ligne : nom, dosage, fréquence">
            <textarea
              rows={4}
              className={LIVE_TEXTAREA}
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
        );
      case "allergies":
        return (
          <QuestionCard live label="Allergies médicamenteuses">
            <input
              className={LIVE_TEXTAREA}
              placeholder="Ex. Pénicilline, iode…"
              value={form.allergies ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
            />
          </QuestionCard>
        );
      case "supplements":
        return (
          <QuestionCard live label="Suppléments et vitamines">
            <input
              className={LIVE_TEXTAREA}
              placeholder="Ex. Vitamine D, oméga-3…"
              value={form.supplements ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, supplements: e.target.value }))}
            />
          </QuestionCard>
        );
      case "triedWeightLoss":
        return (
          <QuestionCard
            live
            label="Tentatives antérieures de perte de poids"
            hint="Régime, exercice ou médicaments"
          >
            <div className="flex gap-2">
              <button
                type="button"
                className={`${pillClass(form.triedWeightLoss === true, "sm")} flex-1`}
                style={pillStyle(form.triedWeightLoss === true)}
                onClick={() => setForm((f) => ({ ...f, triedWeightLoss: true }))}
              >
                Oui
              </button>
              <button
                type="button"
                className={`${pillClass(form.triedWeightLoss === false, "sm")} flex-1`}
                style={pillStyle(form.triedWeightLoss === false)}
                onClick={() => setForm((f) => ({ ...f, triedWeightLoss: false }))}
              >
                Non
              </button>
            </div>
          </QuestionCard>
        );
      case "previousResults":
        return (
          <QuestionCard live label="Résultats obtenus">
            <textarea
              rows={3}
              className={LIVE_TEXTAREA}
              value={form.previousResults ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, previousResults: e.target.value }))}
            />
          </QuestionCard>
        );
      case "motivation":
        return (
          <QuestionCard live label="Pourquoi maintenant ?" hint="Requis">
            <textarea
              rows={3}
              required
              className={LIVE_TEXTAREA}
              placeholder="Décrivez votre motivation…"
              value={form.motivation ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, motivation: e.target.value }))}
            />
          </QuestionCard>
        );
      case "medicationPreference":
        return (
          <QuestionCard live label="Préférence de médicament">
            <div className="grid grid-cols-2 gap-1.5">
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
        );
      case "activity":
        return (
          <QuestionCard live label="Activité physique" hint="Jours d'activité par semaine">
            <div className="grid grid-cols-4 gap-1.5">
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
        );
      case "diet":
        return (
          <QuestionCard live label="Notes alimentation" hint="Optionnel">
            <textarea
              rows={3}
              className={LIVE_TEXTAREA}
              placeholder="Habitudes, restrictions, préférences…"
              value={form.dietNotes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, dietNotes: e.target.value }))}
            />
          </QuestionCard>
        );
      case "tobacco":
        return (
          <QuestionCard live label="Tabac">
            <div className="flex flex-wrap gap-1.5">
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
        );
      case "alcohol":
        return (
          <QuestionCard live label="Alcool">
            <div className="flex flex-wrap gap-1.5">
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
        );
      case "sleep":
        return (
          <QuestionCard live label="Sommeil" hint="Heures par nuit">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-[#6C63FF]"
                value={form.sleepHours ?? 7}
                onChange={(e) => setForm((f) => ({ ...f, sleepHours: Number(e.target.value) }))}
              />
              <span className="min-w-[2.5rem] text-center text-sm font-semibold text-[#6C63FF]">
                {form.sleepHours ?? 7}h
              </span>
            </div>
          </QuestionCard>
        );
      case "stress":
        return (
          <QuestionCard live label="Niveau de stress" hint="1 = très calme, 5 = très élevé">
            <div className="flex justify-between gap-1">
              {([1, 2, 3, 4, 5] as const).map((level) => {
                const active = (form.stressLevel ?? 3) === level;
                const emoji = ["😌", "🙂", "😐", "😟", "😰"][level - 1];
                return (
                  <button
                    key={level}
                    type="button"
                    className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl border py-2 text-[10px] transition ${
                      active
                        ? "border-transparent text-white shadow-sm"
                        : "border-[#E5E7EB] bg-white text-[#6B7280]"
                    }`}
                    style={active ? { backgroundColor: ACCENT } : undefined}
                    onClick={() => setForm((f) => ({ ...f, stressLevel: level }))}
                  >
                    <span className="text-base">{emoji}</span>
                    <span className="font-semibold">{level}</span>
                  </button>
                );
              })}
            </div>
          </QuestionCard>
        );
      case "consentMedical":
      case "consentDataSharing":
      case "consentAiCoach":
      case "consentPrivacy": {
        const consentMeta: Record<
          string,
          { title: string; description: string }
        > = {
          consentMedical: {
            title: "Traitement par IPS",
            description:
              "Je consens à être pris en charge par une infirmière praticienne spécialisée via télémédecine.",
          },
          consentDataSharing: {
            title: "Partage avec l'équipe médicale",
            description:
              "J'autorise le partage de mon dossier avec les professionnels impliqués dans mon suivi.",
          },
          consentAiCoach: {
            title: "Coach Anne (IA)",
            description:
              "J'accepte l'accompagnement personnalisé par Anne, coach santé IA de MedSim.",
          },
          consentPrivacy: {
            title: "Politique de confidentialité",
            description:
              "J'ai lu et j'accepte la politique de confidentialité conforme à la Loi 25.",
          },
        };
        const meta = consentMeta[currentPromptId];
        const checked = form[currentPromptId as keyof MedicalQuestionnaireV2] === true;
        return (
          <QuestionCard live label={meta.title} hint={meta.description}>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  [currentPromptId]: checked ? undefined : true,
                }))
              }
              className={`w-full rounded-xl border-2 px-3 py-2.5 text-left text-xs transition ${
                checked
                  ? "border-[#6C63FF] bg-[#6C63FF]/5 text-[#1A1A2E]"
                  : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB]"
              }`}
            >
              {checked ? "✓ Accepté" : "Appuyez pour accepter"}
            </button>
          </QuestionCard>
        );
      }
      default:
        return null;
    }
  }

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
    <div className="mx-auto max-w-lg pb-28">
      <LiveHeader section={section} savedAt={savedAt} />

      <div className="mb-3 flex items-center justify-between text-[10px] font-medium text-[#9CA3AF]">
        <span>
          Question {promptIndex + 1} / {promptIds.length}
        </span>
        <span>
          Section {section + 1} / {SECTIONS.length}
        </span>
      </div>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${((promptIndex + 1) / promptIds.length) * 100}%`,
            backgroundColor: ACCENT,
          }}
        />
      </div>

      <div className="space-y-2">
        {promptIds.slice(0, promptIndex).map((id) => (
          <PastPromptBubble key={id} label={getPromptLabel(id)} />
        ))}

        <div className="flex justify-start">
          <div className="w-full max-w-[95%]">{renderCurrentPrompt()}</div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-[#DC2626]">
            {error}
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <button
            type="button"
            className={`${dsBtnSecondary} shrink-0 !px-3 !py-2 !text-xs`}
            disabled={section === 0 && promptIndex === 0}
            onClick={goBack}
          >
            Précédent
          </button>
          {isLastSection && isLastPrompt ? (
            <button
              type="button"
              className={`${dsBtnPrimary} flex-1 !py-2 !text-xs disabled:cursor-not-allowed disabled:opacity-40`}
              disabled={saving || !canContinue}
              onClick={() => void submit()}
            >
              {saving ? "Envoi…" : "Soumettre mon dossier"}
            </button>
          ) : (
            <button
              type="button"
              className={`${dsBtnPrimary} flex-1 !py-2 !text-xs disabled:cursor-not-allowed disabled:opacity-40`}
              disabled={!canContinue}
              onClick={goForward}
            >
              {isLastPrompt ? "Section suivante" : "Suite"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
