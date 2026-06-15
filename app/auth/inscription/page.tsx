"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { syncGlp1DraftToServer } from "@/lib/patient/glp1-session-client";
import {
  getEligibilitySessionIdForLink,
  resolvePatientPostAuthPath,
} from "@/lib/onboarding/post-auth-redirect";
import { inscriptionSchema, type InscriptionFormValues } from "@/lib/schemas/inscription";
import {
  ONBOARDING_SERVICES,
  serviceConnexionPath,
} from "@/lib/onboarding/service-routes";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { MedsimLogo } from "@/components/MedsimLogo";

function AuthInscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const isGlp1 = searchParams.get("service") === "gestion-poids";
  const rawCallback = searchParams.get("callbackUrl");
  const safeCallback =
    rawCallback &&
    rawCallback.startsWith("/") &&
    !rawCallback.startsWith("//") &&
    !rawCallback.includes("\\")
      ? rawCallback
      : null;
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postAuthPath = useCallback(
    () =>
      resolvePatientPostAuthPath({
        callbackUrl: safeCallback,
        serviceGestionPoids: isGlp1,
      }),
    [safeCallback, isGlp1],
  );

  useEffect(() => {
    if (status !== "authenticated") return;
    router.replace(postAuthPath());
  }, [status, router, postAuthPath]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<InscriptionFormValues>({
    resolver: zodResolver(inscriptionSchema),
    mode: "onChange",
    defaultValues: { prenom: "", nom: "", email: "", password: "", confirmPassword: "" },
  });

  async function linkEligibilitySession(): Promise<void> {
    const sessionId = getEligibilitySessionIdForLink();
    if (!sessionId) return;
    await fetch("/api/onboarding/eligibilite/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
  }

  async function onSubmit(data: InscriptionFormValues) {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: data.prenom.trim(),
          nom: data.nom.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });

      if (res.status === 409) {
        setApiError("Cette adresse courriel est déjà utilisée. Connectez-vous avec ce compte.");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setApiError(body?.error ?? "Une erreur est survenue.");
        return;
      }

      await getCsrfToken();
      const signInResult = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });
      if (signInResult?.error) {
        setApiError("Compte créé. Connectez-vous depuis la page Connexion.");
        router.push("/connexion");
        return;
      }

      await linkEligibilitySession();

      if (isGlp1) {
        const sync = await syncGlp1DraftToServer();
        if (!sync.ok) {
          setApiError(
            sync.error ??
              "Compte créé, mais l'évaluation n'a pas pu être enregistrée. Reconnectez-vous et réessayez depuis votre espace.",
          );
          return;
        }
      }

      router.push(postAuthPath());
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500">
        Redirection…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="px-5 py-5 sm:px-8 sm:py-6">
        <Link href="/" className="inline-block">
          <MedsimLogo />
        </Link>
      </header>

      <main className="flex flex-1 flex-col justify-center px-5 pb-16 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-[#1A1A2E] sm:text-3xl">
            Créer un compte
          </h1>
          <p className="mb-8 text-center text-sm text-slate-600">
            {isGlp1 ? (
              <>
                Dernière étape avant le questionnaire médical GLP-1, vos réponses d&apos;éligibilité
                seront conservées.
              </>
            ) : (
              <>Créez votre compte patient MedSim pour suivre votre parcours de santé.</>
            )}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit((d) => void onSubmit(d))} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  autoComplete="given-name"
                  className="h-11"
                  {...register("prenom")}
                />
                {errors.prenom ? (
                  <p className="mt-1 text-[12px] text-red-600/90">{errors.prenom.message}</p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="nom">Nom de famille</Label>
                <Input
                  id="nom"
                  autoComplete="family-name"
                  className="h-11"
                  {...register("nom")}
                />
                {errors.nom ? (
                  <p className="mt-1 text-[12px] text-red-600/90">{errors.nom.message}</p>
                ) : null}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Courriel</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="h-11"
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-1 text-[12px] text-red-600/90">{errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                className="h-11"
                {...register("password")}
              />
              {errors.password ? (
                <p className="mt-1 text-[12px] text-red-600/90">{errors.password.message}</p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-500">
                  8 caractères minimum, avec lettres et chiffres.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="h-11"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-[12px] text-red-600/90">{errors.confirmPassword.message}</p>
              ) : null}
            </div>
            {apiError ? <p className="text-sm text-red-600">{apiError}</p> : null}
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="h-12 w-full bg-[#16a34a] hover:bg-green-700"
            >
              {isSubmitting ? "Création…" : "Créer mon compte"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Déjà inscrit ?{" "}
            <Link
              href={serviceConnexionPath(
                isGlp1 ? ONBOARDING_SERVICES.GLP1 : undefined,
                safeCallback ?? undefined,
              )}
              className="font-semibold text-[#1D4D3A] hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AuthInscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-slate-500">
          Chargement…
        </div>
      }
    >
      <AuthInscriptionForm />
    </Suspense>
  );
}
