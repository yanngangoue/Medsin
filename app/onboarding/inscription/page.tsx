"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCsrfToken, signIn } from "next-auth/react";
import { useCallback, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingInscriptionSchema, type OnboardingInscriptionFormValues } from "@/lib/schemas/inscription";

const WELCOME_AVATAR =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=240&q=90";

const INPUT_CLASS =
  "w-full rounded-2xl border border-[#C8E6D9] bg-white py-4 px-5 text-base text-[#0D1F1A] outline-none transition placeholder:text-slate-400 focus:border-[#0D7A5F] focus:ring-1 focus:ring-[#0D7A5F]";

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4 20 20M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.77 10.77 0 0 1 12 5c7 0 10 7 10 7a18.27 18.27 0 0 1-2.16 3.12M6.53 6.53A18.1 18.1 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 4.52-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function passwordStrength(pw: string): { bars: number; label: string } {
  const len = pw.length;
  if (len === 0) return { bars: 0, label: "" };
  if (len < 8) return { bars: len <= 3 ? 1 : 2, label: "Faible" };
  if (len < 12) return { bars: 3, label: "Moyen" };
  return { bars: 4, label: "Fort" };
}

function StrengthBars({ bars }: { bars: number }) {
  const segmentColors = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
  return (
    <div className="flex gap-1.5">
      {segmentColors.map((color, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${i < bars ? color : "bg-slate-200"}`}
        />
      ))}
    </div>
  );
}

type Phase = "welcome" | "fields";

export default function InscriptionPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [fieldStep, setFieldStep] = useState(1);
  const [animNonce, setAnimNonce] = useState(0);
  const [enterDir, setEnterDir] = useState<"left" | "right">("right");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiEmailError, setApiEmailError] = useState<string | null>(null);
  const [genericApiError, setGenericApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
    clearErrors,
  } = useForm<OnboardingInscriptionFormValues>({
    resolver: zodResolver(onboardingInscriptionSchema),
    mode: "onChange",
    defaultValues: {
      prenom: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const prenomVal = useWatch({ control, name: "prenom", defaultValue: "" }) ?? "";
  const emailVal = useWatch({ control, name: "email", defaultValue: "" }) ?? "";
  const passwordVal = useWatch({ control, name: "password", defaultValue: "" }) ?? "";
  const confirmVal = useWatch({ control, name: "confirmPassword", defaultValue: "" }) ?? "";
  const strength = passwordStrength(passwordVal);
  const passwordsMatch =
    confirmVal.length > 0 && passwordVal.length > 0 && passwordVal === confirmVal;

  const bumpAnimRight = useCallback(() => {
    setEnterDir("right");
    setAnimNonce((n) => n + 1);
  }, []);

  const bumpAnimLeft = useCallback(() => {
    setEnterDir("left");
    setAnimNonce((n) => n + 1);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onValid(data: OnboardingInscriptionFormValues) {
    setGenericApiError(null);
    setApiEmailError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: data.prenom.trim(),
          nom: data.prenom.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });

      if (res.status === 409) {
        setApiEmailError("Cette adresse courriel est déjà utilisée.");
        setFieldStep(2);
        bumpAnimLeft();
        return;
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setGenericApiError(body?.error ?? "Une erreur est survenue.");
        return;
      }

      const emailNorm = data.email.trim().toLowerCase();
      await getCsrfToken();
      const signInResult = await signIn("credentials", {
        email: emailNorm,
        password: data.password,
        redirect: false,
      });
      if (signInResult?.error) {
        setGenericApiError(
          signInResult.error === "CredentialsSignin"
            ? "Compte créé, mais la connexion a échoué. Vérifiez le mot de passe ou connectez-vous depuis la page Connexion."
            : `Compte créé, mais la connexion automatique a échoué (${signInResult.error}). Connectez-vous manuellement.`,
        );
        return;
      }
      router.push("/onboarding/questionnaire");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  function startFields() {
    bumpAnimRight();
    setPhase("fields");
    setFieldStep(1);
  }

  async function goContinue() {
    clearErrors();
    setGenericApiError(null);

    if (fieldStep === 1) {
      const ok = await trigger("prenom");
      if (!ok) return;
      bumpAnimRight();
      setFieldStep(2);
      return;
    }
    if (fieldStep === 2) {
      const ok = await trigger("email");
      if (!ok) return;
      bumpAnimRight();
      setFieldStep(3);
      return;
    }
    if (fieldStep === 3) {
      const ok = await trigger("password");
      if (!ok) return;
      bumpAnimRight();
      setFieldStep(4);
      return;
    }
  }

  function goBack() {
    setGenericApiError(null);
    setApiEmailError(null);
    if (fieldStep === 1) {
      bumpAnimLeft();
      setPhase("welcome");
      return;
    }
    bumpAnimLeft();
    setFieldStep((s) => s - 1);
  }

  const slideClass = enterDir === "right" ? "medsim-slide-in-right" : "medsim-slide-in-left";

  const continueDisabledMidSteps =
    fieldStep === 1
      ? !prenomVal.trim()
      : fieldStep === 2
        ? !emailVal.trim()
        : fieldStep === 3
          ? passwordVal.trim().length < 8
          : false;

  return (
    <div className="mx-auto w-full max-w-[480px] pb-12 pt-2">
      {phase === "welcome" ? (
        <div className="flex flex-col items-center px-1 text-center">
          <div className="relative mx-auto mb-6 h-[120px] w-[120px] shrink-0 overflow-hidden rounded-full shadow-lg ring-4 ring-white">
            <Image
              src={WELCOME_AVATAR}
              alt="Illustration bien-être et parcours santé personnalisé"
              width={120}
              height={120}
              className="object-cover"
              sizes="120px"
            />
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#0D7A5F]/90">
            Parcours santé personnalisé
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-[#0D1F1A]">
            Commençons votre parcours
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
            3 minutes suffisent pour démarrer votre suivi GLP-1 personnalisé.
          </p>
          <div className="mt-6 rounded-full border border-[#C8E6D9] bg-white/90 px-4 py-2 text-xs font-medium text-[#0D1F1A]/85 shadow-sm shadow-teal-900/[0.04] backdrop-blur-sm">
            Confidentiel, Données médicales sécurisées
          </div>
          <button
            type="button"
            onClick={startFields}
            className="mt-10 w-full rounded-full bg-[#0D7A5F] py-3 text-base font-medium text-white shadow-md shadow-teal-900/15 transition hover:bg-[#0b684f]"
          >
            Créer mon dossier
          </button>
          <Link
            href="/connexion"
            className="mt-5 text-sm text-slate-500 underline-offset-4 hover:text-[#0D7A5F] hover:underline"
          >
            J&apos;ai déjà un compte →
          </Link>
        </div>
      ) : (
        <form
          className="px-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (fieldStep === 4) void handleSubmit(onValid)(e);
          }}
        >
          <button
            type="button"
            onClick={goBack}
            className="mb-6 text-left text-xs font-medium text-slate-400 transition hover:text-[#0D7A5F]"
          >
            ← Retour
          </button>

          <div key={animNonce} className={slideClass}>
            {fieldStep === 1 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold text-[#0D1F1A]">Comment vous appelez-vous&nbsp;?</h2>
                <p className="text-center text-xs text-gray-400">Étape 1 sur 4</p>
                <input
                  type="text"
                  autoComplete="given-name"
                  placeholder="Votre prénom"
                  className={INPUT_CLASS}
                  {...register("prenom")}
                />
                <p className="text-xs text-gray-400">
                  Nous personnalisons votre suivi avec votre prénom.
                </p>
                {errors.prenom ? (
                  <p className="flex items-start gap-2 text-sm text-red-600">
                    <span aria-hidden className="shrink-0">
                      ⚠
                    </span>
                    {errors.prenom.message}
                  </p>
                ) : null}
              </div>
            )}

            {fieldStep === 2 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold text-[#0D1F1A]">Votre adresse courriel</h2>
                <p className="text-center text-xs text-gray-400">Étape 2 sur 4</p>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  className={INPUT_CLASS}
                  {...register("email", {
                    onChange: () => {
                      setApiEmailError(null);
                    },
                  })}
                />
                <p className="text-xs text-gray-400">Utilisé uniquement pour votre dossier médical.</p>
                {errors.email ? (
                  <p className="flex items-start gap-2 text-sm text-red-600">
                    <span aria-hidden className="shrink-0">
                      ⚠
                    </span>
                    {errors.email.message}
                  </p>
                ) : null}
                {apiEmailError ? (
                  <div className="flex flex-col gap-2">
                    <p className="flex items-start gap-2 text-sm text-red-600">
                      <span aria-hidden className="shrink-0">
                        ⚠
                      </span>
                      {apiEmailError}
                    </p>
                    <Link
                      href="/connexion"
                      className="text-sm font-medium text-[#0D7A5F] underline-offset-4 hover:underline"
                    >
                      Me connecter →
                    </Link>
                  </div>
                ) : null}
              </div>
            )}

            {fieldStep === 3 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold text-[#0D1F1A]">Choisissez un mot de passe</h2>
                <p className="text-center text-xs text-gray-400">Étape 3 sur 4</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimum 8 caractères"
                    className={`${INPUT_CLASS} pr-12`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <div className="space-y-2">
                  <StrengthBars bars={strength.bars} />
                  {strength.label ? (
                    <p className="text-xs font-medium text-slate-600">
                      Sécurité : <span className="text-[#0D7A5F]">{strength.label}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">Au moins 8 caractères pour continuer.</p>
                  )}
                </div>
                {errors.password ? (
                  <p className="flex items-start gap-2 text-sm text-red-600">
                    <span aria-hidden className="shrink-0">
                      ⚠
                    </span>
                    {errors.password.message}
                  </p>
                ) : null}
              </div>
            )}

            {fieldStep === 4 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold text-[#0D1F1A]">Confirmez votre mot de passe</h2>
                <p className="text-center text-xs text-gray-400">Étape 4 sur 4</p>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Retapez votre mot de passe"
                    className={`${INPUT_CLASS} pr-12`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showConfirm ? "Masquer la confirmation" : "Afficher la confirmation"}
                    aria-pressed={showConfirm}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {passwordsMatch ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <span aria-hidden>✓</span> Les mots de passe correspondent.
                  </p>
                ) : confirmVal.length > 0 ? (
                  <p className="text-xs text-gray-400">Les mots de passe doivent être identiques.</p>
                ) : null}
                {errors.confirmPassword ? (
                  <p className="flex items-start gap-2 text-sm text-red-600">
                    <span aria-hidden className="shrink-0">
                      ⚠
                    </span>
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {genericApiError ? (
            <p className="mt-6 flex items-start gap-2 text-sm text-red-600">
              <span aria-hidden>⚠️</span>
              {genericApiError}
            </p>
          ) : null}

          <div className="mt-10">
            {fieldStep < 4 ? (
              <button
                type="button"
                disabled={continueDisabledMidSteps}
                onClick={() => void goContinue()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0D7A5F] py-3.5 text-base font-medium text-white shadow-md shadow-teal-900/10 transition hover:bg-[#0b684f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuer →
              </button>
            ) : (
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  confirmVal.trim().length === 0 ||
                  passwordVal !== confirmVal ||
                  passwordVal.length < 8
                }
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0D7A5F] py-3.5 text-base font-medium text-white shadow-md shadow-teal-900/10 transition hover:bg-[#0b684f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Création en cours...
                  </>
                ) : (
                  <>Continuer →</>
                )}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
