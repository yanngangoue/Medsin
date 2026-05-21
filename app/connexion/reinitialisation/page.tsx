"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/schemas/forgot-password";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { MedsimLogo } from "@/components/MedsimLogo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { token: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    setValue("token", token, { shouldValidate: !!token });
  }, [token, setValue]);

  async function onSubmit(data: ResetPasswordValues) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: data.token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: unknown; ok?: boolean };
      if (!res.ok) {
        const msg =
          typeof json.error === "string"
            ? json.error
            : typeof json.error === "object" && json.error !== null && "formErrors" in json.error
              ? "Données invalides."
              : "Réinitialisation impossible.";
        setError(msg);
        return;
      }
      router.push("/auth/connexion?reset=ok");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-[#F8FAFC] px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 flex justify-center">
            <MedsimLogo />
          </Link>
          <Card>
            <h1 className="text-xl font-semibold text-slate-900">Lien manquant</h1>
            <p className="mt-2 text-sm text-slate-600">Ouvrez le lien reçu après votre demande, ou demandez-en un nouveau.</p>
            <Link
              href="/connexion/mot-de-passe-oublie"
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#1D9E75] text-sm font-semibold text-white hover:opacity-95"
            >
              Mot de passe oublié
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <MedsimLogo />
        </Link>
        <Card>
          <h1 className="text-xl font-semibold text-slate-900">Nouveau mot de passe</h1>
          <p className="mt-1 text-sm text-slate-600">Choisissez un mot de passe d’au moins 8 caractères.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit((d) => void onSubmit(d))} noValidate>
            <input type="hidden" {...register("token")} />
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" autoComplete="new-password" className="h-12" {...register("password")} />
              {errors.password ? (
                <p className="mt-1 text-[12px] text-red-600/90">{errors.password.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmation</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="h-12"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-[12px] text-red-600/90">{errors.confirmPassword.message}</p>
              ) : null}
            </div>
            <FieldError message={error ?? undefined} />
            <Button type="submit" disabled={!isValid || submitting} className="h-12 w-full">
              {submitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link href="/auth/connexion" className="font-medium text-[#1D9E75] hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function ReinitialisationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-slate-500">Chargement…</div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
