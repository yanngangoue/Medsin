"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { connexionSchema, type ConnexionFormValues } from "@/lib/schemas/connexion";
import { defaultHomeForRole } from "@/lib/rbac";
import { resolvePatientPostAuthPath } from "@/lib/onboarding/post-auth-redirect";
import { useAntiAutofillGuard } from "@/lib/hooks/use-anti-autofill";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { MedsimLogo } from "@/components/MedsimLogo";
import { StaffDemoLoginLink } from "@/components/dev/StaffDemoLoginLink";

export function ConnexionFormPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { unlocked, unlock } = useAntiAutofillGuard();

  const emailFromQuery = searchParams.get("email") ?? "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ConnexionFormValues>({
    resolver: zodResolver(connexionSchema),
    mode: "onChange",
    defaultValues: { email: emailFromQuery, password: "" },
  });

  const emailField = register("email");
  const passwordField = register("password");

  useEffect(() => {
    reset({ email: emailFromQuery, password: "" });
  }, [reset, emailFromQuery]);

  async function onSubmit(data: ConnexionFormValues) {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Courriel ou mot de passe incorrect.");
        return;
      }
      const session = await getSession();
      const raw = searchParams.get("callbackUrl");
      const callbackUrl =
        raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\") ? raw : null;
      const serviceGestionPoids = searchParams.get("service") === "gestion-poids";

      const destination =
        session?.user?.role === "PATIENT"
          ? resolvePatientPostAuthPath({ callbackUrl, serviceGestionPoids })
          : session?.user?.role
            ? defaultHomeForRole(session.user.role)
            : callbackUrl ?? "/dashboard/patient";

      router.push(destination);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="px-5 py-5 sm:px-8 sm:py-6">
        <Link href="/" className="inline-block">
          <MedsimLogo />
        </Link>
      </header>

      <main className="flex flex-1 flex-col justify-center px-5 pb-16 sm:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E] sm:text-3xl">Connexion</h1>
            <p className="mt-2 text-sm text-slate-500">
              Accédez à votre espace MedSim de façon sécurisée.
            </p>
          </div>

          {searchParams.get("created") === "1" ? (
            <p className="mb-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Compte créé ! Connectez-vous avec vos identifiants.
            </p>
          ) : searchParams.get("reset") === "ok" ? (
            <p className="mb-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Mot de passe mis à jour. Vous pouvez vous connecter.
            </p>
          ) : null}

          <form
            className="space-y-5"
            onSubmit={handleSubmit((d) => void onSubmit(d))}
            noValidate
            autoComplete="off"
          >
            <div>
              <Label htmlFor="medsim-login-email">Courriel</Label>
              <Input
                id="medsim-login-email"
                type="email"
                inputMode="email"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="votre@courriel.com"
                className="h-12"
                readOnly={!unlocked}
                {...emailField}
                name="medsim-login-email"
                onFocus={() => {
                  unlock();
                }}
              />
              {errors.email ? (
                <p className="mt-1 text-[12px] text-red-600/90">{errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="medsim-login-password">Mot de passe</Label>
              <Input
                id="medsim-login-password"
                type="password"
                autoComplete="off"
                placeholder="••••••••"
                className="h-12"
                readOnly={!unlocked}
                {...passwordField}
                name="medsim-login-password"
                onFocus={() => {
                  unlock();
                }}
              />
              <p className="mt-1.5 text-right">
                <Link
                  href="/connexion/mot-de-passe-oublie"
                  className="text-xs text-slate-500 hover:text-[#1D4D3A] hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </p>
              {errors.password ? (
                <p className="mt-1 text-[12px] text-red-600/90">{errors.password.message}</p>
              ) : null}
            </div>
            <FieldError message={error ?? undefined} />
            <Button type="submit" disabled={!isValid || isSubmitting} className="h-12 w-full">
              {isSubmitting ? "Connexion…" : "Se connecter"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Pas de compte ?{" "}
            <Link
              href={
                searchParams.get("service") === "gestion-poids"
                  ? "/onboarding/inscription?service=gestion-poids"
                  : "/onboarding/inscription"
              }
              className="font-semibold text-[#1D4D3A] hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
          <StaffDemoLoginLink />
        </div>
      </main>
    </div>
  );
}
