"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { syncGlp1DraftToServer } from "@/lib/patient/glp1-session-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inscriptionSchema, type InscriptionFormValues } from "@/lib/schemas/inscription";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { MedsimLogo } from "@/components/MedsimLogo";
import { BackSection } from "@/components/navigation/BackSection";
import { GLP1_CONFIRMATION_PATH } from "@/lib/patient/glp1-flow-routes";
import { glp1QuestionnaireResumeUrl } from "@/lib/patient/glp1-wizard-progress";

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

  function resolvePostAuthPath() {
    if (safeCallback) return safeCallback;
    if (isGlp1) return GLP1_CONFIRMATION_PATH;
    return "/dashboard/patient";
  }

  useEffect(() => {
    if (status !== "authenticated") return;
    router.replace(resolvePostAuthPath());
  }, [status, isGlp1, safeCallback, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<InscriptionFormValues>({
    resolver: zodResolver(inscriptionSchema),
    mode: "onChange",
    defaultValues: { prenom: "", nom: "", email: "", password: "", confirmPassword: "" },
  });

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
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });
      if (signInResult?.error) {
        setApiError("Compte créé. Connectez-vous depuis la page Connexion.");
        router.push("/auth/connexion");
        return;
      }

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

      router.push(resolvePostAuthPath());
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm text-slate-500">
        Redirection…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <MedsimLogo />
        </Link>
        <div className="mb-4">
          {isGlp1 ? (
            <BackSection
              back={{ href: glp1QuestionnaireResumeUrl(), label: "Retour" }}
              forward={{
                href: GLP1_CONFIRMATION_PATH,
                label: "Suivant",
                disabled: true,
              }}
              hint="Créez votre compte pour accéder à la confirmation (Suivant)."
            />
          ) : (
            <BackSection
              back={{ href: "/", label: "Retour" }}
              hint="Retour à l'accueil MedSim."
            />
          )}
        </div>
        <Card>
          <h1 className="text-xl font-semibold text-slate-900">Créer un compte</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isGlp1 ? (
              <>
                Dernière étape du parcours <span className="font-medium">GLP-1</span> : enregistrez vos
                réponses sur un compte patient.
              </>
            ) : (
              <>Créez votre compte patient MedSim pour suivre votre parcours de santé.</>
            )}
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit((d) => void onSubmit(d))} noValidate>
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
                <p className="mt-1 text-[11px] text-slate-500">8 caractères minimum, avec lettres et chiffres.</p>
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

          <p className="mt-6 text-center text-sm text-slate-600">
            Déjà inscrit ?{" "}
            <Link href="/auth/connexion" className="font-medium text-[#16a34a] hover:underline">
              Se connecter
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function AuthInscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-500">Chargement…</div>
      }
    >
      <AuthInscriptionForm />
    </Suspense>
  );
}
