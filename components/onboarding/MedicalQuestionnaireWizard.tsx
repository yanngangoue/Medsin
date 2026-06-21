"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { readEligibilityDraft } from "@/lib/onboarding/eligibility-session";
import { computeBmi, isValidHeightCm } from "@/lib/eligibility";
import { HeightFeetInchesInput } from "@/components/onboarding/HeightFeetInchesInput";
import { ONBOARDING_SERVICES, serviceConnexionPath } from "@/lib/onboarding/service-routes";
import type { MedicalQuestionnaireV2 } from "@/lib/schemas/medical-questionnaire-v2";
import {
  BirthDateFields,
  GLP1_HEALTH_3,
  GLP1_HEALTH_NONE_IDS,
  toggleHealthList,
} from "@/components/onboarding/MedicalQuestionnaireClinicalFields";

/** Antécédents ciblés — étape 2 du wizard (5 étapes). */
const WIZARD_MEDICAL_IDS = [
  "t2_non_insulin",
  "t2_insulin",
  "t1",
  "retinopathy",
  "hypertension",
  "chf",
  "cad_recent",
  "high_cholesterol",
  "qt_prolongation",
  "hypothyroid_untreated",
  "thyroid_cancer_history",
  "pancreatitis",
] as const;

const WIZARD_MEDICAL_ITEMS = GLP1_HEALTH_3.filter((item) =>
  (WIZARD_MEDICAL_IDS as readonly string[]).includes(item.id),
);

const WIZARD_MEDICAL_GROUPS: { title: string; ids: string[] }[] = [
  { title: "Diabète", ids: ["t2_non_insulin", "t2_insulin", "t1", "retinopathy"] },
  {
    title: "Maladies cardiovasculaires",
    ids: ["hypertension", "chf", "cad_recent", "high_cholesterol", "qt_prolongation"],
  },
  { title: "Thyroïde", ids: ["hypothyroid_untreated", "thyroid_cancer_history"] },
  { title: "Pancréas", ids: ["pancreatitis"] },
];

/* ── Constantes ──────────────────────────────────────────────── */
const SECTIONS = [
  "Informations de base",
  "Antécédents médicaux",
  "Médicaments actuels",
  "Objectifs",
  "Adresse de livraison",
] as const;

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
    case 0:
      return ["gender", "birthDate", "height", "weight"];
    case 1:
      return ["medicalHistory"];
    case 2:
      return ["medications"];
    case 3:
      return ["targetWeight", "targetTimeline", "medicationPreference"];
    case 4:
      return ["deliveryAddress", "consents"];
    default:
      return [];
  }
}

function prepareSubmit(form: Partial<MedicalQuestionnaireV2>): MedicalQuestionnaireV2 {
  const health3 =
    form.health3 && form.health3.length > 0 ? form.health3 : [GLP1_HEALTH_NONE_IDS.health3];
  return {
    sessionId: form.sessionId,
    gender: form.gender!,
    birthMonth: form.birthMonth!,
    birthDay: form.birthDay!,
    birthYear: form.birthYear!,
    height: form.height!,
    weight: form.weight!,
    targetWeight: form.targetWeight!,
    waistCm: form.waistCm,
    health1: [GLP1_HEALTH_NONE_IDS.health1],
    health2: [GLP1_HEALTH_NONE_IDS.health2],
    health3,
    opioids3Months: "non",
    bariatricSurgery: "non",
    prescriptionMeds: (form.medications?.length ?? 0) > 0 ? "oui" : "non",
    bloodPressure: "normal",
    restingHeartRate: "normal",
    medications: (form.medications ?? []).filter((m) => m.name.trim()),
    allergies: form.allergies,
    supplements: form.supplements,
    triedWeightLoss: false,
    previousResults: form.previousResults,
    motivation: form.motivation?.trim() || "Améliorer ma santé et atteindre mon poids cible",
    medicationPreference: form.medicationPreference ?? "none",
    activityDays: "1-2",
    dietNotes: form.dietNotes,
    tobacco: "never",
    alcohol: "none",
    sleepHours: 7,
    stressLevel: 3,
    consentMedical: true,
    consentDataSharing: true,
    consentAiCoach: true,
    consentPrivacy: true,
    deliveryStreet: form.deliveryStreet!,
    deliveryCity: form.deliveryCity!,
    deliveryProvince: form.deliveryProvince!,
    deliveryPostalCode: form.deliveryPostalCode!,
    deliveryPhone: form.deliveryPhone!,
    targetTimelineMonths: form.targetTimelineMonths!,
  };
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
    case "height":          return typeof form.height === "number" && isValidHeightCm(form.height);
    case "weight":          return typeof form.weight === "number" && form.weight >= 30 && form.weight <= 400;
    case "targetWeight":    return typeof form.targetWeight === "number" && form.targetWeight >= 30 && form.targetWeight <= 400;
    case "medicalHistory":  return Array.isArray(form.health3) && form.health3.length > 0;
    case "medications":     return true;
    case "targetTimeline":  return form.targetTimelineMonths === "3" || form.targetTimelineMonths === "6" || form.targetTimelineMonths === "12" || form.targetTimelineMonths === "18";
    case "deliveryAddress":
      return Boolean(
        form.deliveryStreet?.trim() &&
          form.deliveryCity?.trim() &&
          form.deliveryProvince?.trim()?.length === 2 &&
          (form.deliveryPostalCode?.trim()?.length ?? 0) >= 6 &&
          (form.deliveryPhone?.trim()?.length ?? 0) >= 10,
      );
    case "consents":
      return (
        form.consentMedical === true &&
        form.consentDataSharing === true &&
        form.consentAiCoach === true &&
        form.consentPrivacy === true
      );
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
    deliveryProvince: "QC",
    targetTimelineMonths: "6",
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
    const payload = prepareSubmit(form);
    const res = await fetch("/api/onboarding/medical-questionnaire", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null) as { error?: string } | null;
      setError(body?.error ?? "Soumission impossible."); setSaving(false); return;
    }
    router.push("/examen-en-cours");
  }

  /* ── Rendu de chaque question ──────────────────────────────── */
  function renderQuestion() {
    const stepLabel = `Étape ${section + 1} / ${SECTIONS.length} · ${SECTIONS[section]}`;

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
          <QuestionSlide stepLabel={stepLabel} label="Quelle est votre taille ?" hint="En pieds et pouces (ex. 5 pi 7 po)." direction={direction}>
            <HeightFeetInchesInput
              valueCm={form.height}
              onChangeCm={(cm) => setForm((f) => ({ ...f, height: cm ?? undefined }))}
              inputClassName={INPUT_CLS}
            />
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
          <QuestionSlide stepLabel={stepLabel} label="Quel est votre poids cible ?" hint="L'objectif que vous souhaitez atteindre avec le programme GLP-1." direction={direction}>
            <div className="relative">
              <input type="number" inputMode="decimal" className={INPUT_CLS} placeholder="70" value={form.targetWeight ?? ""} onChange={e => setForm(f => ({ ...f, targetWeight: Number(e.target.value) }))} />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">kg</span>
            </div>
            {form.weight && form.targetWeight ? (
              <p className="mt-3 text-sm text-slate-600">
                Objectif : perdre <span className="font-bold text-[#1D4D3A]">{Math.max(0, form.weight - form.targetWeight).toFixed(1)} kg</span>
              </p>
            ) : null}
          </QuestionSlide>
        );

      case "medicalHistory":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Avez-vous l'un de ces antécédents médicaux ?" hint="Diabète, maladies cardiovasculaires, thyroïde ou pancréas. Cochez tout ce qui s'applique, ou « Aucune »." direction={direction}>
            <div className="space-y-4">
              {WIZARD_MEDICAL_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{group.title}</p>
                  <div className="space-y-1.5">
                    {WIZARD_MEDICAL_ITEMS.filter((item) => group.ids.includes(item.id)).map((item) => {
                      const checked = (form.health3 ?? []).includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className={`flex cursor-pointer gap-2 rounded-xl border-2 px-3 py-2.5 text-sm transition ${checked ? "border-[#1D4D3A] bg-[#F0F7F4]" : "border-slate-200 bg-white hover:border-slate-300"}`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-[#1D4D3A]"
                            checked={checked}
                            onChange={() =>
                              setForm((f) => ({
                                ...f,
                                health3: toggleHealthList(f.health3 ?? [], item.id, GLP1_HEALTH_NONE_IDS.health3),
                              }))
                            }
                          />
                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              <label className={`flex cursor-pointer gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium ${(form.health3 ?? []).includes(GLP1_HEALTH_NONE_IDS.health3) ? "border-emerald-400 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white"}`}>
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-emerald-600"
                  checked={(form.health3 ?? []).includes(GLP1_HEALTH_NONE_IDS.health3)}
                  onChange={() =>
                    setForm((f) => ({
                      ...f,
                      health3: toggleHealthList(f.health3 ?? [], GLP1_HEALTH_NONE_IDS.health3, GLP1_HEALTH_NONE_IDS.health3),
                    }))
                  }
                />
                <span>Aucun de ces antécédents</span>
              </label>
            </div>
          </QuestionSlide>
        );

      case "medications":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Quels médicaments prenez-vous actuellement ?" hint="Nom et dosage pour chaque médicament. Laissez vide si aucun." direction={direction}>
            <div className="space-y-3">
              {(form.medications?.length ? form.medications : [{ name: "", dosage: "" }]).map((med, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-2">
                  <input
                    className={INPUT_CLS}
                    placeholder="Nom (ex. Metformine)"
                    value={med.name}
                    onChange={(e) => {
                      const meds = [...(form.medications?.length ? form.medications : [{ name: "", dosage: "" }])];
                      meds[idx] = { ...meds[idx], name: e.target.value };
                      setForm((f) => ({ ...f, medications: meds }));
                    }}
                  />
                  <input
                    className={INPUT_CLS}
                    placeholder="Dosage (ex. 500 mg 2×/jour)"
                    value={med.dosage ?? ""}
                    onChange={(e) => {
                      const meds = [...(form.medications?.length ? form.medications : [{ name: "", dosage: "" }])];
                      meds[idx] = { ...meds[idx], dosage: e.target.value };
                      setForm((f) => ({ ...f, medications: meds }));
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="text-sm font-semibold text-[#1D4D3A] hover:underline"
                onClick={() => setForm((f) => ({ ...f, medications: [...(f.medications ?? []), { name: "", dosage: "" }] }))}
              >
                + Ajouter un médicament
              </button>
              <input className={INPUT_CLS} placeholder="Allergies médicamenteuses (optionnel)" value={form.allergies ?? ""} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} />
            </div>
          </QuestionSlide>
        );

      case "targetTimeline":
        return (
          <QuestionSlide stepLabel={stepLabel} label="En combien de temps souhaitez-vous atteindre votre objectif ?" direction={direction}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([["3", "3 mois"], ["6", "6 mois"], ["12", "12 mois"], ["18", "18 mois"]] as const).map(([v, l]) => (
                <button key={v} type="button" className={pillCls(form.targetTimelineMonths === v)} onClick={() => setForm(f => ({ ...f, targetTimelineMonths: v }))}>
                  {l}
                </button>
              ))}
            </div>
          </QuestionSlide>
        );

      case "deliveryAddress":
        return (
          <QuestionSlide stepLabel={stepLabel} label="Où souhaitez-vous recevoir votre médicament ?" hint="Livraison discrète à domicile partout au Québec." direction={direction}>
            <div className="space-y-3">
              <input className={INPUT_CLS} placeholder="Adresse (rue et numéro)" value={form.deliveryStreet ?? ""} onChange={e => setForm(f => ({ ...f, deliveryStreet: e.target.value }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={INPUT_CLS} placeholder="Ville" value={form.deliveryCity ?? ""} onChange={e => setForm(f => ({ ...f, deliveryCity: e.target.value }))} />
                <input className={INPUT_CLS} placeholder="Province (QC)" maxLength={2} value={form.deliveryProvince ?? "QC"} onChange={e => setForm(f => ({ ...f, deliveryProvince: e.target.value.toUpperCase().slice(0, 2) }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={INPUT_CLS} placeholder="Code postal (H2X 1Y4)" value={form.deliveryPostalCode ?? ""} onChange={e => setForm(f => ({ ...f, deliveryPostalCode: e.target.value.toUpperCase() }))} />
                <input className={INPUT_CLS} placeholder="Téléphone" type="tel" value={form.deliveryPhone ?? ""} onChange={e => setForm(f => ({ ...f, deliveryPhone: e.target.value }))} />
              </div>
            </div>
          </QuestionSlide>
        );

      case "consents": {
        const allConsents =
          form.consentMedical &&
          form.consentDataSharing &&
          form.consentAiCoach &&
          form.consentPrivacy;
        const CONSENT_ITEMS = [
          { key: "consentMedical" as const, title: "Soins par IPS", desc: "Prise en charge par une IPS via télémédecine.", icon: "🩺" },
          { key: "consentDataSharing" as const, title: "Partage de dossier", desc: "Partage avec les professionnels impliqués.", icon: "🔒" },
          { key: "consentAiCoach" as const, title: "Coach Anne (IA)", desc: "Accompagnement personnalisé par Anne.", icon: "💬" },
          { key: "consentPrivacy" as const, title: "Confidentialité Loi 25", desc: "Politique de confidentialité Anne-sante.", icon: "📋" },
        ];
        return (
          <QuestionSlide stepLabel={stepLabel} label="Dernière étape — consentements requis" hint="Cochez les 4 cases pour soumettre votre dossier à l'IPS." direction={direction}>
            <div className="space-y-3">
              {CONSENT_ITEMS.map(({ key, title, desc, icon }) => {
                const checked = form[key] === true;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, [key]: !checked }))}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${checked ? "border-[#1D4D3A] bg-[#F0F7F4]" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${checked ? "bg-[#1D4D3A] text-white" : "bg-slate-100"}`}>
                      {checked ? "✓" : icon}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${checked ? "text-[#1D4D3A]" : "text-slate-800"}`}>{title}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </button>
                );
              })}
              {allConsents ? (
                <p className="text-center text-xs font-medium text-emerald-600">✓ Tous les consentements acceptés</p>
              ) : null}
            </div>
          </QuestionSlide>
        );
      }

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
                <>Étape suivante <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></>
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
