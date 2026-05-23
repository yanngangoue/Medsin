"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  NutriPlusCardButton,
  NutriPlusNextButton,
  NutriPlusProgressBar,
  NutriPlusQuestionTitle,
  NutriPlusWizardHeader,
} from "@/components/onboarding/nutri-plus-wizard/NutriPlusWizardUi";
import {
  NUTRI_ACTIVITY_OPTIONS,
  NUTRI_BUDGET_OPTIONS,
  NUTRI_COACH_OPTIONS,
  NUTRI_CONSTRAINT_OPTIONS,
  NUTRI_ENERGY_OPTIONS,
  NUTRI_GOAL_OPTIONS,
  NUTRI_SUPPLEMENT_OPTIONS,
  type NutriPlusAnswers,
} from "@/lib/patient/nutri-plus-questions";
import {
  NUTRI_PLUS_CONFIRMATION_PATH,
  NUTRI_PLUS_LANDING_PATH,
  NUTRI_PLUS_QUESTIONNAIRE_PATH,
  NUTRI_PLUS_QUESTIONNAIRE_STEPS,
} from "@/lib/patient/nutri-plus-routes";
import {
  clearNutriPlusAnswers,
  readNutriPlusAnswers,
  writeNutriPlusAnswers,
} from "@/lib/patient/nutri-plus-session";

function toggleConstraint(list: string[], id: string): string[] {
  if (id === "none") return ["none"];
  const withoutNone = list.filter((x) => x !== "none");
  if (withoutNone.includes(id)) return withoutNone.filter((x) => x !== id);
  return [...withoutNone, id];
}

function stepComplete(step: number, a: NutriPlusAnswers): boolean {
  switch (step) {
    case 0:
      return Boolean(a.primaryGoal);
    case 1:
      return Boolean(a.activityLevel && a.supplementExperience);
    case 2:
      return a.dietaryConstraints.length > 0 && Boolean(a.energyFocus);
    case 3:
      return Boolean(a.monthlyBudget && a.coachPreference);
    default:
      return false;
  }
}

export function NutriPlusQuestionnaireWizard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const prenom = session?.user?.prenom ?? "";
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<NutriPlusAnswers>(() => readNutriPlusAnswers());
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const setAnswer = useCallback(<K extends keyof NutriPlusAnswers>(key: K, value: NutriPlusAnswers[K]) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      writeNutriPlusAnswers(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(
        `/auth/connexion?callbackUrl=${encodeURIComponent(NUTRI_PLUS_QUESTIONNAIRE_PATH)}`,
      );
    }
  }, [status, router]);

  async function submitDossier() {
    if (!stepComplete(3, answers)) return;
    setFinishing(true);
    setFinishError(null);
    try {
      const res = await fetch("/api/onboarding/nutri-plus/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setFinishError(body?.error ?? "Enregistrement impossible.");
        return;
      }
      clearNutriPlusAnswers();
      router.push(NUTRI_PLUS_CONFIRMATION_PATH);
      router.refresh();
    } finally {
      setFinishing(false);
    }
  }

  function handleNext() {
    if (step < NUTRI_PLUS_QUESTIONNAIRE_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    void submitDossier();
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
    else router.push(NUTRI_PLUS_LANDING_PATH);
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#F5F0EB] text-sm text-slate-500">
        Chargement…
      </div>
    );
  }

  const canAdvance = stepComplete(step, answers);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F0EB]">
      <NutriPlusWizardHeader
        back={{ onClick: handleBack, label: "Retour" }}
        forward={{
          onClick: handleNext,
          label: step === NUTRI_PLUS_QUESTIONNAIRE_STEPS - 1 ? "Terminer" : "Suivant",
          disabled: !canAdvance || finishing,
        }}
        subtitle="Questionnaire Nutri+"
      />
      <NutriPlusProgressBar
        stepIndex={step}
        totalSteps={NUTRI_PLUS_QUESTIONNAIRE_STEPS}
        labelPrefix="Questionnaire · étape"
      />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:px-6">
        {prenom && step === 0 ? (
          <p className="mb-4 text-sm text-slate-600">
            Bonjour <span className="font-semibold text-slate-900">{prenom}</span>, précisez votre
            profil nutritionnel.
          </p>
        ) : null}

        {step === 0 && (
          <div className="space-y-3">
            <NutriPlusQuestionTitle>Quel est votre objectif principal ?</NutriPlusQuestionTitle>
            {NUTRI_GOAL_OPTIONS.map((opt) => (
              <NutriPlusCardButton
                key={opt.id}
                selected={answers.primaryGoal === opt.id}
                onClick={() => setAnswer("primaryGoal", opt.id)}
              >
                <span className="text-sm font-medium text-slate-900">{opt.label}</span>
              </NutriPlusCardButton>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <NutriPlusQuestionTitle>Niveau d&apos;activité physique</NutriPlusQuestionTitle>
              {NUTRI_ACTIVITY_OPTIONS.map((opt) => (
                <NutriPlusCardButton
                  key={opt.id}
                  selected={answers.activityLevel === opt.id}
                  onClick={() => setAnswer("activityLevel", opt.id)}
                >
                  <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                </NutriPlusCardButton>
              ))}
            </div>
            <div className="space-y-3">
              <NutriPlusQuestionTitle>Expérience avec les compléments</NutriPlusQuestionTitle>
              {NUTRI_SUPPLEMENT_OPTIONS.map((opt) => (
                <NutriPlusCardButton
                  key={opt.id}
                  selected={answers.supplementExperience === opt.id}
                  onClick={() => setAnswer("supplementExperience", opt.id)}
                >
                  <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                </NutriPlusCardButton>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <NutriPlusQuestionTitle>Restrictions ou préférences</NutriPlusQuestionTitle>
              <p className="text-sm text-slate-600">Plusieurs choix possibles.</p>
              {NUTRI_CONSTRAINT_OPTIONS.map((opt) => (
                <NutriPlusCardButton
                  key={opt.id}
                  selected={answers.dietaryConstraints.includes(opt.id)}
                  onClick={() =>
                    setAnswer("dietaryConstraints", toggleConstraint(answers.dietaryConstraints, opt.id))
                  }
                >
                  <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                </NutriPlusCardButton>
              ))}
            </div>
            <div className="space-y-3">
              <NutriPlusQuestionTitle>Votre énergie au quotidien</NutriPlusQuestionTitle>
              {NUTRI_ENERGY_OPTIONS.map((opt) => (
                <NutriPlusCardButton
                  key={opt.id}
                  selected={answers.energyFocus === opt.id}
                  onClick={() => setAnswer("energyFocus", opt.id)}
                >
                  <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                </NutriPlusCardButton>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <NutriPlusQuestionTitle>Budget mensuel envisagé</NutriPlusQuestionTitle>
              {NUTRI_BUDGET_OPTIONS.map((opt) => (
                <NutriPlusCardButton
                  key={opt.id}
                  selected={answers.monthlyBudget === opt.id}
                  onClick={() => setAnswer("monthlyBudget", opt.id)}
                >
                  <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                </NutriPlusCardButton>
              ))}
            </div>
            <div className="space-y-3">
              <NutriPlusQuestionTitle>Mode d&apos;accompagnement préféré</NutriPlusQuestionTitle>
              {NUTRI_COACH_OPTIONS.map((opt) => (
                <NutriPlusCardButton
                  key={opt.id}
                  selected={answers.coachPreference === opt.id}
                  onClick={() => setAnswer("coachPreference", opt.id)}
                >
                  <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                </NutriPlusCardButton>
              ))}
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Notes (optionnel)
              <textarea
                value={answers.notes}
                onChange={(e) => setAnswer("notes", e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
                placeholder="Allergies, produits déjà utilisés, etc."
              />
            </label>
          </div>
        )}

        {finishError ? <p className="mt-4 text-sm text-red-600">{finishError}</p> : null}

        <NutriPlusNextButton
          onClick={handleNext}
          disabled={!canAdvance || finishing}
          label={finishing ? "Enregistrement…" : step === 3 ? "Enregistrer mon profil" : "Continuer"}
        />
      </main>
    </div>
  );
}
