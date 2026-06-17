"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { readEligibilityDraft } from "@/lib/onboarding/eligibility-session";
import { computeBmi } from "@/lib/eligibility";
import { ONBOARDING_SERVICES, serviceConnexionPath } from "@/lib/onboarding/service-routes";
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

/* ── Constantes ──────────────────────────────────────────────── */
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

const GREEN = "#1D4D3A";
const ACCENT = "#3EBD93";

/* ── Styles partagés ─────────────────────────────────────────── */
const INPUT_CLS =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#3EBD93] focus:ring-4 focus:ring-[#3EBD93]/10";

const TEXTAREA_CLS =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#3EBD93] focus:ring-4 focus:ring-[#3EBD93]/10 resize-none";

function pillCls(active: boolean) {
  return `flex-1 rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-150 text-center ${
    active
      ? "border-transparent bg-[#1D4D3A] text-white shadow-md"
      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
  }`;
}

/* ── Typewriter ──────────────────────────────────────────────── */
function Typewriter({ text, className, onDone }: { text: string; className?: string; onDone?: () => void }) {
  const [shown, setShown] = useState("");
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        doneRef.current?.();
      }
    }, 18);
    return () => clearInterval(id);
  }, [text]);

  return (
    <span className={className}>
      {shown}
      {shown.length < text.length && <span className="q-cursor" aria-hidden />}
    </span>
  );
}

/* ── Carte question principale ───────────────────────────────── */
function QuestionSlide({
  stepLabel,
  label,
  hint,
  children,
  direction,
}: {
  stepLabel: string;
  label: string;
  hint?: string;
  children: ReactNode;
  direction: "forward" | "backward";
}) {
  const [typingDone, setTypingDone] = useState(false);
  const animCls = direction === "forward" ? "q-enter-forward" : "q-enter-backward";

  useEffect(() => { setTypingDone(false); }, [label]);

  return (
    <div className={`${animCls} w-full`}>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#3EBD93]">{stepLabel}</p>
      <h2 className="mb-1 font-display text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl">
        <Typewriter text={label} onDone={() => setTypingDone(true)} />
      </h2>
      {hint ? (
        <p className={`mb-6 text-sm text-slate-500 transition-opacity duration-300 ${typingDone ? "opacity-100" : "opacity-0"}`}>
          {hint}
        </p>
      ) : (
        <div className="mb-6" />
      )}
      <div className={`transition-opacity duration-300 ${typingDone ? "opacity-100" : "opacity-0"}`}>
        {children}
      </div>
    </div>
  );
}

/* ── Données questionnaire ───────────────────────────────────── */
function getPromptIds(section: number, form: Partial<MedicalQuestionnaireV2>): string[] {
  switch (section) {
    case 0: return ["gender", "birthDate", "height", "weight", "targetWeight", "waist"];
    case 1: return ["health1"];
    case 2: return ["health2"];
    case 3: return ["health3"];
    case 4: return ["opioids3Months", "bariatricSurgery", "prescriptionMeds"];
    case 5: return ["bloodPressure", "restingHeartRate"];
    case 6: return ["medications", "allergies", "supplements"];
    case 7: return form.triedWeightLoss
      ? ["triedWeightLoss", "previousResults", "motivation", "medicationPreference"]
      : ["triedWeightLoss", "motivation", "medicationPreference"];
    case 8: return ["activity", "diet", "tobacco", "alcohol", "sleep", "stress"];
    case 9: return ["consentMedical", "consentDataSharing", "consentAiCoach", "consentPrivacy"];
    default: return [];
  }
}

function isBirthDateComplete(form: Partial<MedicalQuestionnaireV2>): boolean {
  if (!form.birthMonth?.trim() || !form.birthDay?.trim() || !form.birthYear?.trim()) return false;
  const year = Number(form.birthYear);
  const day = Number(form.birthDay);
  return Number.isFinite(year) && year >= 1920 && year <= 2010 && Number.isFinite(day) && day >= 1 && day <= 31;
}

function isPromptComplete(id: string, form: Partial<MedicalQuestionnaireV2>): boolean {
  switch (id) {
    case "gender":          return form.gender === "male" || form.gender === "female";
    case "birthDate":       return isBirthDateComplete(form);
    case "height":          return typeof form.height === "number" && form.height >= 100 && form.height <= 250;
    case "weight":          return typeof form.weight === "number" && form.weight >= 30 && form.weight <= 400;
    case "targetWeight":    return typeof form.targetWeight === "number" && form.targetWeight >= 30 && form.targetWeight <= 400;
    case "health1":         return Array.isArray(form.health1) && form.health1.length > 0;
    case "health2":         return Array.isArray(form.health2) && form.health2.length > 0;
    case "health3":         return Array.isArray(form.health3) && form.health3.length > 0;
    case "opioids3Months":
    case "bariatricSurgery":
    case "prescriptionMeds": return form[id] === "oui" || form[id] === "non";
    case "bloodPressure":   return Boolean(form.bloodPressure);
    case "restingHeartRate": return Boolean(form.restingHeartRate);
    case "motivation":      return Boolean(form.motivation?.trim());
    case "consentMedical":  return form.consentMedical === true;
    case "consentDataSharing": return form.consentDataSharing === true;
    case "consentAiCoach":  return form.consentAiCoach === true;
    case "consentPrivacy":  return form.consentPrivacy === true;
    default:                return true;
  }
}

/* ── Composant principal ─────────────────────────────────────── */
export function MedicalQuestionnaireWizard() {
  const router = useRouter();
  const { status } = useSession();

  const [section, setSection] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [form, setForm] = useState<Partial<MedicalQuestionnaireV2>>({
    health1: [], health2: [], health3: [], medications: [],
    triedWeightLoss: false, activityDays: "1-2",
    tobacco: "never", alcohol: "none", sleepHours: 7, stressLevel: 3,
    medicationPreference: "none",
  });
  const formRef = useRef(form);
  formRef.current = form;

  /* Charger brouillon */
  useEffect(() => {
    const elig = readEligibilityDraft();
    if (elig) setForm(f => ({ ...f, height: elig.heightCm, weight: elig.weightKg, targetWeight: Math.max(60, elig.weightKg - 10) }));
    void (async () => {
      const res = await fetch("/api/onboarding/medical-questionnaire");
      if (!res.ok) return;
      const data = await res.json() as { draft?: Partial<MedicalQuestionnaireV2> | null };
      if (data.draft) setForm(f => ({ ...f, ...data.draft }));
    })();
  }, []);

  /* Auth redirect */
  useEffect(() => {
    if (status === "unauthenticated")
      router.replace(serviceConnexionPath(ONBOARDING_SERVICES.GLP1, "/questionnaire"));
  }, [status, router]);

  /* Autosave */
  const autosave = useCallback(async () => {
    const res = await fetch("/api/onboarding/medical-questionnaire", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formRef.current),
    });
    if (res.ok) setSavedAt(new Date());
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    const id = setInterval(() => void autosave(), 30_000);
    return () => clearInterval(id);
  }, [status, autosave]);

  /* Réinitialiser promptIndex au changement de section */
  useEffect(() => { setPromptIndex(0); }, [section]);

  const promptIds = getPromptIds(section, form);
  const currentId = promptIds[promptIndex] ?? promptIds[0];
  const canContinue = isPromptComplete(currentId, form);
  const isLastPrompt = promptIndex >= promptIds.length - 1;
  const isLastSection = section === SECTIONS.length - 1;

  /* Progression globale */
  const totalPrompts = SECTIONS.reduce((acc, _, i) => acc + getPromptIds(i, form).length, 0);
  const donePrompts = SECTIONS.slice(0, section).reduce((acc, _, i) => acc + getPromptIds(i, form).length, 0) + promptIndex;
  const progressPct = Math.round((donePrompts / totalPrompts) * 100);

  const bmi = form.height && form.weight ? computeBmi(form.weight, form.height) : null;

  function goBack() {
    setDirection("backward");
    if (promptIndex > 0) { setPromptIndex(i => i - 1); return; }
    if (section > 0) {
      const prev = section - 1;
      setSection(prev);
      setPromptIndex(Math.max(0, getPromptIds(prev, form).length - 1));
    }
  }

  function goForward() {
    setDirection("forward");
    if (!isLastPrompt) { setPromptIndex(i => i + 1); return; }
    void autosave();
    setSection(s => s + 1);
    setPromptIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setSaving(true); setError(null);
    const res = await fetch("/api/onboarding/medical-questionnaire", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form as MedicalQuestionnaireV2),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null) as { error?: string } | null;
      setError(body?.error ?? "Soumission impossible."); setSaving(false); return;
    }
    router.push("/examen-en-cours");
  }

  /* ── Rendu de chaque question ──────────────────────────────── */
  function renderQuestion() {
    const stepLabel = `Section ${section + 1} / ${SECTIONS.length} · ${SECTIONS[section]}`;

    switch (currentId) {
      case "gender":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quel est votre sexe à la naissance ?" hint="Requis pour l'évaluation clinique GLP-1." direction={direction}>
            <div className="flex gap-3">
              {([["male","Homme"],["female","Femme"]] as const).map(([v, l]) => (
                <button key={v} type="button" className={pillCls(form.gender === v)} onClick={() => setForm(f => ({ ...f, gender: v }))}>
                  {v === "male" ? "👨 " : "👩 "}{l}
                </button>
              ))}
            </div>
          </QuestionSlide>
        );

      case "birthDate":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quelle est votre date de naissance ?" hint="Mois, jour et année (ex. Janvier, 15, 1985)." direction={direction}>
            <BirthDateFields birthMonth={form.birthMonth} birthDay={form.birthDay} birthYear={form.birthYear} onChange={patch => setForm(f => ({ ...f, ...patch }))} />
          </QuestionSlide>
        );

      case "height":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quelle est votre taille ?" hint="En centimètres." direction={direction}>
            <div className="relative">
              <input type="number" inputMode="numeric" className={INPUT_CLS} placeholder="170" value={form.height ?? ""} onChange={e => setForm(f => ({ ...f, height: Number(e.target.value) }))} />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">cm</span>
            </div>
          </QuestionSlide>
        );

      case "weight":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quel est votre poids actuel ?" hint="En kilogrammes." direction={direction}>
            <div className="relative">
              <input type="number" inputMode="decimal" className={INPUT_CLS} placeholder="80" value={form.weight ?? ""} onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))} />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">kg</span>
            </div>
            {bmi ? (
              <div className="mt-3 rounded-xl bg-[#F0F7F4] px-4 py-2.5 text-sm text-slate-700">
                IMC estimé : <span className="font-bold text-[#1D4D3A]">{bmi.toFixed(1)}</span>
              </div>
            ) : null}
          </QuestionSlide>
        );

      case "targetWeight":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quel est votre poids cible ?" hint="L'objectif que vous souhaitez atteindre." direction={direction}>
            <div className="relative">
              <input type="number" inputMode="decimal" className={INPUT_CLS} placeholder="70" value={form.targetWeight ?? ""} onChange={e => setForm(f => ({ ...f, targetWeight: Number(e.target.value) }))} />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">kg</span>
            </div>
          </QuestionSlide>
        );

      case "waist":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Tour de taille (optionnel)" hint="En centimètres — aide à évaluer votre profil métabolique." direction={direction}>
            <div className="relative">
              <input type="number" inputMode="numeric" className={INPUT_CLS} placeholder="90" value={form.waistCm ?? ""} onChange={e => setForm(f => ({ ...f, waistCm: Number(e.target.value) }))} />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">cm</span>
            </div>
          </QuestionSlide>
        );

      case "health1":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Parmi ces situations, lesquelles vous concernent ?" hint="Sélectionnez tout ce qui s'applique, ou « Aucune »." direction={direction}>
            <HealthChecklist items={GLP1_HEALTH_1} noneId={GLP1_HEALTH_NONE_IDS.health1} selected={form.health1 ?? []} onChange={health1 => setForm(f => ({ ...f, health1 }))} />
          </QuestionSlide>
        );

      case "health2":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Antécédents médicaux — partie 1" hint="Sélectionnez tout ce qui vous concerne." direction={direction}>
            <HealthChecklist items={GLP1_HEALTH_2} noneId={GLP1_HEALTH_NONE_IDS.health2} selected={form.health2 ?? []} onChange={health2 => setForm(f => ({ ...f, health2 }))} />
          </QuestionSlide>
        );

      case "health3":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Antécédents médicaux — partie 2" hint="Diabète, thyroïde, pancréatite, MEN2, etc." direction={direction}>
            <HealthChecklist items={GLP1_HEALTH_3} noneId={GLP1_HEALTH_NONE_IDS.health3} selected={form.health3 ?? []} onChange={health3 => setForm(f => ({ ...f, health3 }))} />
          </QuestionSlide>
        );

      case "opioids3Months":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Avez-vous pris des opioïdes ces 3 derniers mois ?" hint="Codéine, morphine, oxycodone, fentanyl, etc." direction={direction}>
            <YesNoSelect value={form.opioids3Months} onChange={v => setForm(f => ({ ...f, opioids3Months: v }))} />
          </QuestionSlide>
        );

      case "bariatricSurgery":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Avez-vous déjà subi une chirurgie bariatrique ?" hint="Bypass gastrique, sleeve gastrectomie, anneau gastrique…" direction={direction}>
            <YesNoSelect value={form.bariatricSurgery} onChange={v => setForm(f => ({ ...f, bariatricSurgery: v }))} />
          </QuestionSlide>
        );

      case "prescriptionMeds":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Prenez-vous des médicaments sur ordonnance en ce moment ?" direction={direction}>
            <YesNoSelect value={form.prescriptionMeds} onChange={v => setForm(f => ({ ...f, prescriptionMeds: v }))} />
          </QuestionSlide>
        );

      case "bloodPressure":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quelle est votre tension artérielle habituelle ?" hint="D'après votre dernière mesure ou suivi médical." direction={direction}>
            <BloodPressureSelect value={form.bloodPressure} onChange={v => setForm(f => ({ ...f, bloodPressure: v }))} />
          </QuestionSlide>
        );

      case "restingHeartRate":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quelle est votre fréquence cardiaque au repos ?" direction={direction}>
            <HeartRateSelect value={form.restingHeartRate} onChange={v => setForm(f => ({ ...f, restingHeartRate: v }))} />
          </QuestionSlide>
        );

      case "medications":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quels médicaments prenez-vous actuellement ?" hint="Un par ligne : nom, dosage, fréquence. Laissez vide si aucun." direction={direction}>
            <textarea rows={5} className={TEXTAREA_CLS} placeholder={"Ramipril 5 mg, 1×/jour\nMetformine 500 mg, 2×/jour"} value={form.medications?.map(m => m.name).join("\n") ?? ""} onChange={e => setForm(f => ({ ...f, medications: e.target.value.split("\n").filter(Boolean).map(l => ({ name: l.trim() })) }))} />
          </QuestionSlide>
        );

      case "allergies":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Avez-vous des allergies médicamenteuses ?" hint="Laissez vide si aucune." direction={direction}>
            <input className={INPUT_CLS} placeholder="Ex. Pénicilline, iode…" value={form.allergies ?? ""} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} />
          </QuestionSlide>
        );

      case "supplements":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Prenez-vous des suppléments ou vitamines ?" hint="Laissez vide si aucun." direction={direction}>
            <input className={INPUT_CLS} placeholder="Ex. Vitamine D 2000 UI, Oméga-3…" value={form.supplements ?? ""} onChange={e => setForm(f => ({ ...f, supplements: e.target.value }))} />
          </QuestionSlide>
        );

      case "triedWeightLoss":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Avez-vous déjà essayé de perdre du poids ?" hint="Régimes, exercice, médicaments, programmes…" direction={direction}>
            <div className="flex gap-3">
              {([["true","Oui"],["false","Non"]] as const).map(([v, l]) => (
                <button key={v} type="button" className={pillCls(String(form.triedWeightLoss) === v)} onClick={() => setForm(f => ({ ...f, triedWeightLoss: v === "true" }))}>
                  {l}
                </button>
              ))}
            </div>
          </QuestionSlide>
        );

      case "previousResults":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quels résultats avez-vous obtenus ?" direction={direction}>
            <textarea rows={4} className={TEXTAREA_CLS} placeholder="Décrivez brièvement vos expériences passées…" value={form.previousResults ?? ""} onChange={e => setForm(f => ({ ...f, previousResults: e.target.value }))} />
          </QuestionSlide>
        );

      case "motivation":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Pourquoi souhaitez-vous perdre du poids maintenant ?" hint="Requis — partagez votre motivation principale." direction={direction}>
            <textarea rows={4} required className={TEXTAREA_CLS} placeholder="Ex. Ma santé, mon énergie, un événement à venir…" value={form.motivation ?? ""} onChange={e => setForm(f => ({ ...f, motivation: e.target.value }))} />
          </QuestionSlide>
        );

      case "medicationPreference":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Avez-vous une préférence de médicament GLP-1 ?" direction={direction}>
            <div className="grid grid-cols-2 gap-3">
              {([["none","Sans préférence"],["ozempic","Ozempic®"],["wegovy","Wegovy®"],["generic","Générique"]] as const).map(([v, l]) => (
                <button key={v} type="button" className={pillCls((form.medicationPreference ?? "none") === v)} onClick={() => setForm(f => ({ ...f, medicationPreference: v }))}>
                  {l}
                </button>
              ))}
            </div>
          </QuestionSlide>
        );

      case "activity":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Combien de jours par semaine faites-vous de l'activité physique ?" direction={direction}>
            <div className="grid grid-cols-4 gap-3">
              {([["0","0 jour"],["1-2","1–2"],["3-4","3–4"],["5+","5+"]] as const).map(([v, l]) => (
                <button key={v} type="button" className={`${pillCls((form.activityDays ?? "1-2") === v)} flex-col gap-1 py-4`} onClick={() => setForm(f => ({ ...f, activityDays: v }))}>
                  <span className="text-lg font-bold">{l.split(" ")[0]}</span>
                  {l.includes(" ") && <span className="text-[10px] opacity-70">{l.split(" ").slice(1).join(" ")}</span>}
                </button>
              ))}
            </div>
          </QuestionSlide>
        );

      case "diet":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Des notes sur votre alimentation ?" hint="Optionnel — habitudes, restrictions, préférences." direction={direction}>
            <textarea rows={4} className={TEXTAREA_CLS} placeholder="Ex. Je mange peu de sucre, végétarien, intolérant au lactose…" value={form.dietNotes ?? ""} onChange={e => setForm(f => ({ ...f, dietNotes: e.target.value }))} />
          </QuestionSlide>
        );

      case "tobacco":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quel est votre rapport au tabac ?" direction={direction}>
            <div className="flex gap-3">
              {([["never","Jamais fumé"],["former","Ex-fumeur·se"],["current","Fumeur·se"]] as const).map(([v, l]) => (
                <button key={v} type="button" className={pillCls((form.tobacco ?? "never") === v)} onClick={() => setForm(f => ({ ...f, tobacco: v }))}>
                  {l}
                </button>
              ))}
            </div>
          </QuestionSlide>
        );

      case "alcohol":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quelle est votre consommation d'alcool ?" direction={direction}>
            <div className="flex gap-3">
              {([["none","Aucune"],["occasional","Occasionnelle"],["regular","Régulière"]] as const).map(([v, l]) => (
                <button key={v} type="button" className={pillCls((form.alcohol ?? "none") === v)} onClick={() => setForm(f => ({ ...f, alcohol: v }))}>
                  {l}
                </button>
              ))}
            </div>
          </QuestionSlide>
        );

      case "sleep":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Combien d'heures dormez-vous par nuit en moyenne ?" direction={direction}>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <span className="font-display text-5xl font-bold text-[#1D4D3A]">{form.sleepHours ?? 7}<span className="text-xl font-medium text-slate-400">h</span></span>
              </div>
              <input type="range" min={3} max={12} step={0.5} className="w-full cursor-pointer accent-[#1D4D3A]" value={form.sleepHours ?? 7} onChange={e => setForm(f => ({ ...f, sleepHours: Number(e.target.value) }))} />
              <div className="flex justify-between text-xs text-slate-400">
                <span>3h</span><span>6h</span><span>9h</span><span>12h</span>
              </div>
            </div>
          </QuestionSlide>
        );

      case "stress":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Comment évaluez-vous votre niveau de stress habituel ?" hint="1 = très calme · 5 = très élevé" direction={direction}>
            <div className="flex gap-2">
              {([1,2,3,4,5] as const).map(level => {
                const emoji = ["😌","🙂","😐","😟","😰"][level - 1];
                const active = (form.stressLevel ?? 3) === level;
                return (
                  <button key={level} type="button" onClick={() => setForm(f => ({ ...f, stressLevel: level }))}
                    className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl border-2 py-4 transition-all ${active ? "border-[#1D4D3A] bg-[#1D4D3A] text-white shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
                    <span className="text-2xl">{emoji}</span>
                    <span className={`text-sm font-bold ${active ? "text-white" : "text-slate-600"}`}>{level}</span>
                  </button>
                );
              })}
            </div>
          </QuestionSlide>
        );

      case "consentMedical":
      case "consentDataSharing":
      case "consentAiCoach":
      case "consentPrivacy": {
        const CONSENTS: Record<string, { title: string; desc: string; icon: string }> = {
          consentMedical:     { title: "Soins par IPS", desc: "Je consens à être pris·e en charge par une infirmière praticienne spécialisée (IPS) via télémédecine.", icon: "🩺" },
          consentDataSharing: { title: "Partage de dossier", desc: "J'autorise le partage de mon dossier avec les professionnels de santé impliqués dans mon suivi.", icon: "🔒" },
          consentAiCoach:     { title: "Coach Anne (IA)", desc: "J'accepte l'accompagnement personnalisé par Anne, coach santé IA de MedSim.", icon: "💬" },
          consentPrivacy:     { title: "Politique de confidentialité", desc: "J'ai lu et j'accepte la politique de confidentialité MedSim, conforme à la Loi 25.", icon: "📋" },
        };
        const c = CONSENTS[currentId];
        const checked = form[currentId as keyof MedicalQuestionnaireV2] === true;
        return (
          <QuestionSlide stepLabel={stepLabel} label={c.title} hint={c.desc} direction={direction}>
            <button type="button" onClick={() => setForm(f => ({ ...f, [currentId]: checked ? undefined : true }))}
              className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200 ${checked ? "border-[#1D4D3A] bg-[#F0F7F4] shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-all ${checked ? "bg-[#1D4D3A] shadow-sm" : "bg-slate-100"}`}>
                {checked ? "✓" : c.icon}
              </span>
              <div>
                <p className={`font-semibold ${checked ? "text-[#1D4D3A]" : "text-slate-700"}`}>
                  {checked ? "Accepté" : "Appuyer pour accepter"}
                </p>
                <p className="text-sm text-slate-500">{c.title}</p>
              </div>
            </button>
          </QuestionSlide>
        );
      }

      default: return null;
    }
  }

  /* ── États de chargement / non-auth ─────────────────────────── */
  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1D4D3A] border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">Redirection vers la connexion…</p>
      </div>
    );
  }

  /* ── Rendu principal ─────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      {/* Header fixe */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 py-3">
          {/* Ligne indicateurs */}
          <div className="mb-2.5 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3EBD93] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3EBD93]" />
              </span>
              <span className="text-[#1D4D3A]">Consultation en direct</span>
            </span>
            <span className="flex items-center gap-3">
              {savedAt && (
                <span className="text-slate-400">
                  Sauvegardé {savedAt.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <span className="font-bold text-slate-700">{progressPct} %</span>
            </span>
          </div>
          {/* Barre de progression */}
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3EBD93] to-[#1D4D3A] transition-all duration-500 ease-out"
              style={{ width: `${Math.max(2, progressPct)}%` }}
            />
          </div>
          {/* Pastilles de sections */}
          <div className="mt-2 flex items-center gap-0.5 overflow-x-auto pb-0.5">
            {SECTIONS.map((name, i) => (
              <div
                key={i}
                title={name}
                className={`h-1 min-w-[1.5rem] flex-1 rounded-full transition-all duration-300 ${
                  i < section ? "bg-[#1D4D3A]" : i === section ? "bg-[#3EBD93]" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Zone question */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="overflow-hidden">
          {renderQuestion()}
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
      </main>

      {/* Barre de navigation fixe en bas */}
      <div className="sticky bottom-0 z-20 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {/* Bouton Précédent */}
          <button
            type="button"
            disabled={section === 0 && promptIndex === 0}
            onClick={goBack}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Bouton principal */}
          {isLastSection && isLastPrompt ? (
            <button
              type="button"
              disabled={saving || !isPromptComplete(currentId, form)}
              onClick={() => void submit()}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] text-sm font-bold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Envoi…</>
              ) : (
                <>Soumettre mon dossier médical →</>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={!canContinue}
              onClick={goForward}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] text-sm font-bold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLastPrompt ? (
                <>Section suivante <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></>
              ) : (
                <>Continuer <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
