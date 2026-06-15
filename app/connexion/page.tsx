"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { connexionSchema, type ConnexionFormValues } from "@/lib/schemas/connexion";
import { defaultHomeForRole } from "@/lib/rbac";
import { resolvePatientPostAuthPath } from "@/lib/onboarding/post-auth-redirect";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { MedsimLogo } from "@/components/MedsimLogo";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ConnexionFormValues>({
    resolver: zodResolver(connexionSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

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
          <h1 className="mb-8 text-center text-2xl font-bold tracking-tight text-[#1A1A2E] sm:text-3xl">
            Bienvenue à nouveau sur MedSim !
          </h1>

          {searchParams.get("reset") === "ok" ? (
            <p className="mb-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Mot de passe mis à jour. Vous pouvez vous connecter.
            </p>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit((d) => void onSubmit(d))} noValidate>
            <div>
              <Label htmlFor="email">Courriel</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="h-12"
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
                autoComplete="current-password"
                className="h-12"
                {...register("password")}
              />
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
              href="/onboarding/inscription"
              className="font-semibold text-[#1D4D3A] hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-slate-500">
          Chargement…
        </div>
      }
    >
      <ConnexionForm />
    </Suspense>
  );
}
