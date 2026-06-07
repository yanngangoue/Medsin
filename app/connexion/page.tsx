"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { connexionSchema, type ConnexionFormValues } from "@/lib/schemas/connexion";
import { defaultHomeForRole } from "@/lib/rbac";
import { Card } from "@/components/ui/Card";
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
        setError("Email ou mot de passe incorrect.");
        return;
      }
      const session = await getSession();
      const home = session?.user?.role ? defaultHomeForRole(session.user.role) : "/dashboard/patient";
      const raw = searchParams.get("callbackUrl");
      const callbackUrl =
        raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\") ? raw : null;
      router.push(callbackUrl ?? home);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <MedsimLogo />
        </Link>
        <Card>
          <h1 className="text-xl font-semibold text-slate-900">Connexion</h1>
          <p className="mt-1 text-sm text-slate-600">Accédez à votre espace Medsim.</p>

          {searchParams.get("reset") === "ok" ? (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Mot de passe mis à jour. Vous pouvez vous connecter.
            </p>
          ) : null}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit((d) => void onSubmit(d))} noValidate>
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

          <p className="mt-4 text-center text-sm">
            <Link href="/connexion/mot-de-passe-oublie" className="font-medium text-[#1D9E75] hover:underline">
              Mot de passe oublié ?
            </Link>
          </p>

          <p className="mt-6 text-center text-sm text-slate-600">
            Pas encore de compte ?{" "}
            <Link href="/onboarding/inscription" className="font-medium text-[#1D9E75] hover:underline">
              S’inscrire
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-slate-500">
          Chargement…
        </div>
      }
    >
      <ConnexionForm />
    </Suspense>
  );
}
