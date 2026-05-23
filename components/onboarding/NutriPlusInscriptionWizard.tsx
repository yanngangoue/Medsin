"use client";

import { useRouter } from "next/navigation";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  NutriPlusNextButton,
  NutriPlusProgressBar,
  NutriPlusQuestionTitle,
  NutriPlusWizardHeader,
} from "@/components/onboarding/nutri-plus-wizard/NutriPlusWizardUi";
import { NUTRI_PLUS_INSCRIPTION_STEPS as INSCRIPTION_STEP_META } from "@/lib/patient/nutri-plus-content";
import {
  NUTRI_PLUS_INSCRIPTION_STEPS,
  NUTRI_PLUS_LANDING_PATH,
  NUTRI_PLUS_QUESTIONNAIRE_PATH,
} from "@/lib/patient/nutri-plus-routes";

type FormState = {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const EMPTY: FormState = {
  prenom: "",
  nom: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isPasswordValid(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

export function NutriPlusInscriptionWizard() {
  const router = useRouter();
  const { status } = useSession();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(NUTRI_PLUS_QUESTIONNAIRE_PATH);
    }
  }, [status, router]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setApiError(null);
  }

  const canAdvance =
    step === 0
      ? form.prenom.trim().length > 0 && form.nom.trim().length > 0
      : step === 1
        ? isEmailValid(form.email)
        : step === 2
          ? isPasswordValid(form.password)
          : form.confirmPassword === form.password && isPasswordValid(form.password);

  async function createAccount() {
    if (!canAdvance) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch("/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      if (res.status === 409) {
        setApiError("Cette adresse courriel est déjà utilisée.");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setApiError(body?.error ?? "Une erreur est survenue.");
        return;
      }

      await getCsrfToken();
      const signInResult = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });
      if (signInResult?.error) {
        setApiError("Compte créé. Connectez-vous depuis la page Connexion.");
        return;
      }

      router.push(NUTRI_PLUS_QUESTIONNAIRE_PATH);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (step < NUTRI_PLUS_INSCRIPTION_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    void createAccount();
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
    else router.push(NUTRI_PLUS_LANDING_PATH);
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#F5F0EB] text-sm text-slate-500">
        Redirection…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F0EB]">
      <NutriPlusWizardHeader
        back={{ onClick: handleBack, label: "Retour" }}
        forward={{
          onClick: handleNext,
          label: step === NUTRI_PLUS_INSCRIPTION_STEPS - 1 ? "Créer" : "Suivant",
          disabled: !canAdvance || submitting,
        }}
        subtitle="Création de votre compte Nutri+"
      />
      <NutriPlusProgressBar
        stepIndex={step}
        totalSteps={NUTRI_PLUS_INSCRIPTION_STEPS}
        labelPrefix="Création du compte · étape"
      />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:px-6">
        <div className="mb-6 rounded-2xl border border-[#C8E6D9]/50 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#1D9E75]">
            {INSCRIPTION_STEP_META[step]?.label ?? "Étape"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{INSCRIPTION_STEP_META[step]?.hint}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
        {step === 0 && (
          <div className="space-y-4">
            <NutriPlusQuestionTitle>Prénom et nom</NutriPlusQuestionTitle>
            <p className="text-sm text-slate-600">
              Votre identité pour orienter vos compléments Nutri+ (gélules ou poudre) MedSim.
            </p>
            <label className="block text-sm font-medium text-slate-700">
              Prénom
              <input
                type="text"
                autoComplete="given-name"
                value={form.prenom}
                onChange={(e) => update("prenom", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Nom
              <input
                type="text"
                autoComplete="family-name"
                value={form.nom}
                onChange={(e) => update("nom", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <NutriPlusQuestionTitle>Votre courriel</NutriPlusQuestionTitle>
            <p className="text-sm text-slate-600">Utilisé pour vous connecter à votre espace patient.</p>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <NutriPlusQuestionTitle>Mot de passe</NutriPlusQuestionTitle>
            <p className="text-sm text-slate-600">8 caractères minimum, avec une lettre et un chiffre.</p>
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <NutriPlusQuestionTitle>Confirmation du mot de passe</NutriPlusQuestionTitle>
            <p className="text-sm text-slate-600">Saisissez à nouveau le même mot de passe pour valider.</p>
            <input
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
            />
            {form.confirmPassword && form.confirmPassword !== form.password ? (
              <p className="text-sm text-red-600">Les mots de passe ne correspondent pas.</p>
            ) : null}
          </div>
        )}

        {apiError ? <p className="mt-4 text-sm text-red-600">{apiError}</p> : null}
        </div>

        <NutriPlusNextButton
          onClick={handleNext}
          disabled={!canAdvance || submitting}
          label={
            submitting
              ? "Création…"
              : step === NUTRI_PLUS_INSCRIPTION_STEPS - 1
                ? "Créer mon compte"
                : "Continuer"
          }
        />

        <p className="mt-6 text-center text-[10px] leading-relaxed text-slate-400">
          Vos données sont traitées de façon confidentielle. Prochaine étape : questionnaire Nutri+
          (environ 5 minutes).
        </p>
      </main>
    </div>
  );
}
