"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Glp1IntroHero,
  Glp1NextButton,
  Glp1ProgressBar,
  Glp1QuestionTitle,
  Glp1Reveal,
  Glp1WizardHeader,
  Glp1YesNoCards,
} from "@/components/onboarding/glp1-wizard/Glp1WizardUi";
import { useStaggerReveal } from "@/components/onboarding/glp1-wizard/useStaggerReveal";
import {
  GLP1_BLOOD_PRESSURE_OPTIONS,
  GLP1_ELIGIBILITY_STORAGE_KEY,
  GLP1_HEALTH_1,
  GLP1_HEALTH_2,
  GLP1_HEALTH_3,
  GLP1_HEALTH_NONE_IDS,
  GLP1_HEALTH_NONE_LABEL,
  GLP1_HEART_RATE_OPTIONS,
  GLP1_WIZARD_STEP_COUNT,
  MONTHS_FR,
  glp1HealthStepRevealCount,
  type Glp1EligibilityAnswers,
} from "@/lib/patient/glp1-eligibility-questions";
import { GLP1_WEIGHT_GOAL_OPTIONS } from "@/lib/patient/glp1-weight-goal";
import {
  persistGlp1WizardProgress,
  readGlp1AnswersFromSessionStorage,
  readGlp1WizardProgress,
} from "@/lib/patient/glp1-session-client";
import { GLP1_LANDING_PATH } from "@/lib/patient/glp1-flow-routes";
import {
  hasMeaningfulGlp1Answers,
  inferLastCompletedGlp1Step,
  isGlp1StepComplete,
  seedGlp1SessionForResume,
} from "@/lib/patient/glp1-wizard-progress";
import { Glp1ExclusionScreen } from "@/components/onboarding/Glp1ExclusionScreen";
import { runGlp1PreDiagnosticTriage } from "@/lib/patient/glp1-triage";

const INSCRIPTION_PATH = "/auth/inscription?service=gestion-poids";
const CONFIRMATION_PATH = "/onboarding/confirmation?service=gestion-poids";
const CONNEXION_PATH = `/auth/connexion?callbackUrl=${encodeURIComponent(CONFIRMATION_PATH)}`;

function persistGlp1Answers(answers: Glp1EligibilityAnswers) {
  try {
    sessionStorage.setItem(GLP1_ELIGIBILITY_STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* ignore */
  }
}

type Phase = "intro" | "questions" | "excluded";

function toggleInList(list: string[], id: string, noneId?: string): string[] {
  if (noneId && id === noneId) return [noneId];
  const withoutNone = noneId ? list.filter((x) => x !== noneId) : list;
  if (withoutNone.includes(id)) return withoutNone.filter((x) => x !== id);
  return [...withoutNone, id];
}

export function Glp1EligibilityWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeQuestions = searchParams.get("resume") === "questions";
  const startQuestionsParam = searchParams.get("start") === "questions";
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const prenom = session?.user?.prenom ?? session?.user?.name ?? "";
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [skipStagger, setSkipStagger] = useState(false);
  const [answers, setAnswers] = useState<Glp1EligibilityAnswers>({});
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [exclusionReasons, setExclusionReasons] = useState<
    ReturnType<typeof runGlp1PreDiagnosticTriage>["reasons"]
  >([]);

  const patch = useCallback((partial: Partial<Glp1EligibilityAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...partial }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let stored = readGlp1AnswersFromSessionStorage();

      if (
        resumeQuestions &&
        !hasMeaningfulGlp1Answers(stored) &&
        status === "authenticated"
      ) {
        const res = await fetch("/api/onboarding/glp1-dossier");
        if (!cancelled && res.ok) {
          const data = (await res.json()) as {
            answers?: Glp1EligibilityAnswers | null;
          };
          if (data.answers && hasMeaningfulGlp1Answers(data.answers)) {
            stored = data.answers;
            seedGlp1SessionForResume(stored);
          }
        }
      }

      if (cancelled) return;

      if (stored && hasMeaningfulGlp1Answers(stored)) {
        setAnswers(stored);
        if (resumeQuestions) {
          setPhase("questions");
          const progress = readGlp1WizardProgress();
          const step =
            progress?.phase === "questions"
              ? Math.min(progress.step, GLP1_WIZARD_STEP_COUNT - 1)
              : inferLastCompletedGlp1Step(stored);
          setStep(step);
          setSkipStagger(true);
        } else if (startQuestionsParam) {
          setPhase("questions");
          setStep(0);
          setSkipStagger(true);
        } else {
          const progress = readGlp1WizardProgress();
          if (progress) {
            setPhase(progress.phase);
            setStep(Math.min(progress.step, GLP1_WIZARD_STEP_COUNT - 1));
          }
        }
      } else if (startQuestionsParam) {
        setPhase("questions");
        setStep(0);
        setSkipStagger(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resumeQuestions, startQuestionsParam, status]);

  useEffect(() => {
    persistGlp1Answers(answers);
    if (phase === "intro" || phase === "questions") {
      persistGlp1WizardProgress({ phase, step });
    }
  }, [answers, phase, step]);

  const staggerKey = phase === "questions" ? step : -1;
  const itemCount = useMemo(() => {
    switch (step) {
      case 0:
        return GLP1_WEIGHT_GOAL_OPTIONS.length + 1;
      case 1:
        return 4;
      case 2:
        return 3;
      case 3:
        return 2;
      case 4:
        return glp1HealthStepRevealCount(GLP1_HEALTH_1.length);
      case 5:
        return glp1HealthStepRevealCount(GLP1_HEALTH_2.length);
      case 6:
        return glp1HealthStepRevealCount(GLP1_HEALTH_3.length);
      case 7:
      case 8:
      case 9:
        return 3;
      case 10:
        return GLP1_BLOOD_PRESSURE_OPTIONS.length + 1;
      case 11:
        return GLP1_HEART_RATE_OPTIONS.length + 1;
      default:
        return 1;
    }
  }, [step]);

  const staggerVisible = useStaggerReveal(itemCount, 42, phase === "questions", staggerKey);
  const visibleCount = skipStagger ? itemCount : staggerVisible;

  const canNext = useMemo(() => isGlp1StepComplete(step, answers), [step, answers]);
  const isLastStep = step >= GLP1_WIZARD_STEP_COUNT - 1;

  function startQuestions() {
    setPhase("questions");
    setStep(0);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  async function finishEvaluation() {
    setFinishError(null);
    setFinishing(true);
    try {
      const triage = runGlp1PreDiagnosticTriage(answers);
      if (triage.excluded) {
        setExclusionReasons(triage.reasons);
        setPhase("excluded");
        if (isAuthenticated) {
          await fetch("/api/onboarding/glp1-dossier", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers }),
          });
        }
        return;
      }

      try {
        sessionStorage.setItem(GLP1_ELIGIBILITY_STORAGE_KEY, JSON.stringify(answers));
      } catch {
        /* ignore */
      }

      if (isAuthenticated) {
        const res = await fetch("/api/onboarding/glp1-dossier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          setFinishError(body?.error ?? "Impossible d'enregistrer votre dossier.");
          return;
        }
        seedGlp1SessionForResume(answers);
        router.push(CONFIRMATION_PATH);
        return;
      }

      seedGlp1SessionForResume(answers);
      router.push(INSCRIPTION_PATH);
    } finally {
      setFinishing(false);
    }
  }

  function goNext() {
    setSkipStagger(false);
    if (step >= GLP1_WIZARD_STEP_COUNT - 1) {
      void finishEvaluation();
      return;
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const finishButtonLabel = isAuthenticated
    ? "Soumettre mon dossier →"
    : "Continuer →";

  function goPrev() {
    if (step <= 0) {
      setPhase("intro");
      setStep(0);
      setSkipStagger(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSkipStagger(true);
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderCheckboxStep(
    title: string,
    subtitle: string,
    items: readonly { id: string; label: string }[],
    selected: string[] | undefined,
    onToggle: (id: string) => void,
    noneId?: string,
    noneLabel = GLP1_HEALTH_NONE_LABEL,
    startRevealAt = 1,
  ) {
    const sel = selected ?? [];
    return (
      <div>
        <Glp1Reveal index={0} visibleCount={visibleCount}>
          <Glp1QuestionTitle>{title}</Glp1QuestionTitle>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </Glp1Reveal>
        <ul className="mt-4 space-y-2">
          {items.map((item, i) => (
            <Glp1Reveal key={item.id} index={startRevealAt + i} visibleCount={visibleCount}>
              <li>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[var(--teal-900)]"
                    checked={sel.includes(item.id)}
                    onChange={() => onToggle(item.id)}
                  />
                  <span className="text-[13px] leading-snug text-slate-800">{item.label}</span>
                </label>
              </li>
            </Glp1Reveal>
          ))}
          {noneId && (
            <Glp1Reveal index={startRevealAt + items.length} visibleCount={visibleCount}>
              <li>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[var(--teal-900)]"
                    checked={sel.includes(noneId)}
                    onChange={() => onToggle(noneId)}
                  />
                  <span className="text-[13px] font-medium leading-snug text-slate-800">{noneLabel}</span>
                </label>
              </li>
            </Glp1Reveal>
          )}
        </ul>
      </div>
    );
  }

  const headerBack =
    phase === "intro"
      ? { href: GLP1_LANDING_PATH, label: "Retour" }
      : { onClick: goPrev, label: step === 0 ? "Introduction" : "Retour" };

  const headerForward =
    phase === "intro"
      ? { onClick: startQuestions, label: "Commencer" }
      : {
          onClick: goNext,
          label: finishing
            ? "Enregistrement…"
            : isLastStep
              ? isAuthenticated
                ? "Terminer"
                : "Continuer"
              : "Suivant",
          disabled: !canNext || finishing,
        };

  return (
    <div className="min-h-screen bg-white">
      <Glp1WizardHeader back={headerBack} forward={headerForward} />

      {phase === "excluded" ? (
        <main>
          <Glp1ExclusionScreen reasons={exclusionReasons} />
        </main>
      ) : phase === "intro" ? (
        <main className="mx-auto max-w-lg px-4 pb-12 pt-2 sm:px-6">
          <div className="flex gap-1.5 pt-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-slate-200" aria-hidden />
            ))}
          </div>

          <Glp1IntroHero />

          <h1 className="mt-8 text-center text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
            Atteignez rapidement votre poids idéal{" "}
            <span className="text-[#1D9E75]">sans régimes restrictifs ni exercices intensifs</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-slate-600">
            Formulaire de santé détaillé : un tri automatique pré-diagnostique vérifiera votre
            admissibilité avant transmission à un professionnel de santé.
          </p>

          {isAuthenticated && prenom ? (
            <p className="mx-auto mt-4 max-w-md rounded-lg bg-[#F0FBF7] px-4 py-2.5 text-center text-sm text-[#166534]">
              Vous êtes connecté{prenom ? ` (${prenom})` : ""}. À la fin, votre dossier sera enregistré
              sans recréer de compte.
            </p>
          ) : null}

          <button
            type="button"
            onClick={startQuestions}
            className="mt-8 w-full rounded-xl bg-[#1D9E75] py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#178f6a]"
          >
            Commencer
          </button>

          <p className="mt-6 text-center text-xs text-slate-500">
            <Link href="/onboarding/gestion-poids" className="text-[#1D9E75] hover:underline">
              ← Retour à la présentation GLP-1
            </Link>
          </p>
        </main>
      ) : (
        <main className="mx-auto max-w-lg px-4 pb-12 sm:px-6">
          <Glp1ProgressBar stepIndex={step} />

          <div key={staggerKey} className="mt-6">
            {step === 0 && (
              <>
                <Glp1Reveal index={0} visibleCount={visibleCount}>
                  <Glp1QuestionTitle>Quel est votre objectif de perte de poids ?</Glp1QuestionTitle>
                </Glp1Reveal>
                <ul className="mt-4 space-y-2">
                  {GLP1_WEIGHT_GOAL_OPTIONS.map((opt, i) => (
                    <Glp1Reveal key={opt.id} index={i + 1} visibleCount={visibleCount}>
                      <li>
                        <button
                          type="button"
                          onClick={() => patch({ weightGoal: opt.id })}
                          className={`w-full rounded-xl border bg-white px-4 py-3 text-left text-[13px] font-medium shadow-sm ${
                            answers.weightGoal === opt.id
                              ? "border-[#5B9FD4] ring-2 ring-[#5B9FD4]/25"
                              : "border-slate-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    </Glp1Reveal>
                  ))}
                </ul>
              </>
            )}

            {step === 1 && (
              <>
                <Glp1Reveal index={0} visibleCount={visibleCount}>
                  <Glp1QuestionTitle>Quelle est votre taille et votre poids ?</Glp1QuestionTitle>
                </Glp1Reveal>
                <Glp1Reveal index={1} visibleCount={visibleCount} className="mt-4">
                  <label className="block text-xs font-semibold text-slate-600">Taille (cm)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={answers.heightCm ?? ""}
                    onChange={(e) => patch({ heightCm: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    placeholder="170"
                  />
                </Glp1Reveal>
                <Glp1Reveal index={2} visibleCount={visibleCount} className="mt-3">
                  <label className="block text-xs font-semibold text-slate-600">Poids actuel (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={answers.weightKg ?? ""}
                    onChange={(e) => patch({ weightKg: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    placeholder="90"
                  />
                </Glp1Reveal>
                <Glp1Reveal index={3} visibleCount={visibleCount} className="mt-4">
                  <Glp1QuestionTitle>Quel est votre poids idéal ?</Glp1QuestionTitle>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={answers.idealWeightKg ?? ""}
                    onChange={(e) => patch({ idealWeightKg: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    placeholder="75"
                  />
                </Glp1Reveal>
              </>
            )}

            {step === 2 && (
              <>
                <Glp1Reveal index={0} visibleCount={visibleCount}>
                  <Glp1QuestionTitle>Êtes-vous un homme ou une femme ?</Glp1QuestionTitle>
                </Glp1Reveal>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {(
                    [
                      { id: "male" as const, label: "Homme", symbol: "♂", ring: "border-sky-200 bg-sky-50 text-sky-600" },
                      {
                        id: "female" as const,
                        label: "Femme",
                        symbol: "♀",
                        ring: "border-pink-200 bg-pink-50 text-pink-600",
                      },
                    ] as const
                  ).map((g, i) => (
                    <Glp1Reveal key={g.id} index={i + 1} visibleCount={visibleCount}>
                      <button
                        type="button"
                        onClick={() => patch({ gender: g.id })}
                        className={`flex w-full flex-col items-center gap-2 rounded-xl border bg-white px-4 py-6 shadow-sm ${
                          answers.gender === g.id
                            ? "border-[#5B9FD4] ring-2 ring-[#5B9FD4]/25"
                            : "border-slate-200"
                        }`}
                      >
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${g.ring}`}
                        >
                          {g.symbol}
                        </span>
                        <span className="text-sm font-semibold">{g.label}</span>
                      </button>
                    </Glp1Reveal>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <Glp1Reveal index={0} visibleCount={visibleCount}>
                  <Glp1QuestionTitle>Quelle est votre date de naissance ?</Glp1QuestionTitle>
                </Glp1Reveal>
                <Glp1Reveal index={1} visibleCount={visibleCount} className="mt-4 grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Mois</label>
                    <select
                      value={answers.birthMonth ?? ""}
                      onChange={(e) => patch({ birthMonth: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2.5 text-sm"
                    >
                      <option value="">—</option>
                      {MONTHS_FR.map((m, i) => (
                        <option key={m} value={String(i + 1)}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Jour</label>
                    <select
                      value={answers.birthDay ?? ""}
                      onChange={(e) => patch({ birthDay: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2.5 text-sm"
                    >
                      <option value="">—</option>
                      {Array.from({ length: 31 }, (_, d) => (
                        <option key={d + 1} value={String(d + 1)}>
                          {d + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Année</label>
                    <input
                      type="number"
                      value={answers.birthYear ?? ""}
                      onChange={(e) => patch({ birthYear: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2.5 text-sm"
                      placeholder="1990"
                    />
                  </div>
                </Glp1Reveal>
              </>
            )}

            {step === 4 &&
              renderCheckboxStep(
                "Questions de santé 1",
                "Est-ce que l'une de ces situations vous concerne ?",
                GLP1_HEALTH_1,
                answers.health1,
                (id) =>
                  patch({
                    health1: toggleInList(answers.health1 ?? [], id, GLP1_HEALTH_NONE_IDS.health1),
                  }),
                GLP1_HEALTH_NONE_IDS.health1,
              )}

            {step === 5 &&
              renderCheckboxStep(
                "Questions de santé 2",
                "Est-ce que l'une de ces situations vous concerne ?",
                GLP1_HEALTH_2,
                answers.health2,
                (id) =>
                  patch({
                    health2: toggleInList(answers.health2 ?? [], id, GLP1_HEALTH_NONE_IDS.health2),
                  }),
                GLP1_HEALTH_NONE_IDS.health2,
              )}

            {step === 6 &&
              renderCheckboxStep(
                "Questions de santé 3",
                "Est-ce que l'une de ces situations vous concerne ?",
                GLP1_HEALTH_3,
                answers.health3,
                (id) =>
                  patch({
                    health3: toggleInList(answers.health3 ?? [], id, GLP1_HEALTH_NONE_IDS.health3),
                  }),
                GLP1_HEALTH_NONE_IDS.health3,
              )}

            {step === 7 && (
              <>
                <Glp1Reveal index={0} visibleCount={visibleCount}>
                  <Glp1QuestionTitle>
                    Avez-vous pris des analgésiques opiacés ou des drogues de rue à base
                    d&apos;opiacés au cours des 3 derniers mois ?
                  </Glp1QuestionTitle>
                </Glp1Reveal>
                <Glp1YesNoCards
                  value={answers.opioids3Months}
                  onChange={(v) => patch({ opioids3Months: v })}
                  revealIndex={1}
                  visibleCount={visibleCount}
                />
              </>
            )}

            {step === 8 && (
              <>
                <Glp1Reveal index={0} visibleCount={visibleCount}>
                  <Glp1QuestionTitle>
                    Avez-vous déjà subi une intervention chirurgicale pour perdre du poids ?
                  </Glp1QuestionTitle>
                </Glp1Reveal>
                <Glp1YesNoCards
                  value={answers.bariatricSurgery}
                  onChange={(v) => patch({ bariatricSurgery: v })}
                  revealIndex={1}
                  visibleCount={visibleCount}
                />
              </>
            )}

            {step === 9 && (
              <>
                <Glp1Reveal index={0} visibleCount={visibleCount}>
                  <Glp1QuestionTitle>
                    Prenez-vous actuellement des médicaments sur ordonnance ?
                  </Glp1QuestionTitle>
                </Glp1Reveal>
                <Glp1YesNoCards
                  value={answers.prescriptionMeds}
                  onChange={(v) => patch({ prescriptionMeds: v })}
                  revealIndex={1}
                  visibleCount={visibleCount}
                />
              </>
            )}

            {step === 10 && (
              <>
                <Glp1Reveal index={0} visibleCount={visibleCount}>
                  <Glp1QuestionTitle>Quelle est votre plage de tension artérielle ?</Glp1QuestionTitle>
                </Glp1Reveal>
                <ul className="mt-4 space-y-2">
                  {GLP1_BLOOD_PRESSURE_OPTIONS.map((opt, i) => (
                    <Glp1Reveal key={opt.id} index={i + 1} visibleCount={visibleCount}>
                      <li>
                        <button
                          type="button"
                          onClick={() => patch({ bloodPressure: opt.id })}
                          className={`flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm ${
                            answers.bloodPressure === opt.id
                              ? "border-[#5B9FD4] ring-2 ring-[#5B9FD4]/25"
                              : "border-slate-200"
                          }`}
                        >
                          <span className="text-lg">🩸</span>
                          <span>
                            <span className="block text-sm font-bold text-slate-900">{opt.label}</span>
                            <span className="text-xs font-medium text-slate-500">{opt.hint}</span>
                          </span>
                        </button>
                      </li>
                    </Glp1Reveal>
                  ))}
                </ul>
              </>
            )}

            {step === 11 && (
              <>
                <Glp1Reveal index={0} visibleCount={visibleCount}>
                  <Glp1QuestionTitle>
                    Quelle est votre fréquence cardiaque moyenne au repos ?
                  </Glp1QuestionTitle>
                </Glp1Reveal>
                <ul className="mt-4 space-y-2">
                  {GLP1_HEART_RATE_OPTIONS.map((opt, i) => (
                    <Glp1Reveal key={opt.id} index={i + 1} visibleCount={visibleCount}>
                      <li>
                        <button
                          type="button"
                          onClick={() => patch({ restingHeartRate: opt.id })}
                          className={`flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm ${
                            answers.restingHeartRate === opt.id
                              ? "border-[#5B9FD4] ring-2 ring-[#5B9FD4]/25"
                              : "border-slate-200"
                          }`}
                        >
                          <span className="text-lg">♥</span>
                          <span>
                            <span className="block text-sm font-bold text-slate-900">{opt.label}</span>
                            <span className="text-xs font-medium text-slate-500">{opt.hint}</span>
                          </span>
                        </button>
                      </li>
                    </Glp1Reveal>
                  ))}
                </ul>
              </>
            )}

            {visibleCount >= itemCount && (
              <>
                {finishError ? (
                  <p className="mt-4 text-center text-sm text-red-600">{finishError}</p>
                ) : null}
                <Glp1NextButton
                  onClick={goNext}
                  disabled={!canNext || finishing}
                  label={
                    finishing
                      ? "Enregistrement…"
                      : isLastStep
                        ? finishButtonLabel
                        : "Suivant →"
                  }
                />
                {isLastStep && !isAuthenticated ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
                    <p className="font-medium text-slate-800">Prochaine étape</p>
                    <p className="mt-1 text-xs leading-relaxed">
                      Créez un compte ou connectez-vous pour enregistrer vos réponses sur votre dossier.
                    </p>
                    <p className="mt-3 text-xs">
                      Déjà inscrit ?{" "}
                      <Link href={CONNEXION_PATH} className="font-semibold text-[#1D9E75] hover:underline">
                        Se connecter
                      </Link>
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
