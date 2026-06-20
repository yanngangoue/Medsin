"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordRequestSchema, type ForgotPasswordRequestValues } from "@/lib/schemas/forgot-password";
import { useAntiAutofillGuard } from "@/lib/hooks/use-anti-autofill";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { MedsimLogo } from "@/components/MedsimLogo";

function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { unlocked, unlock } = useAntiAutofillGuard();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordRequestValues>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const emailField = register("email");

  async function onSubmit(data: ForgotPasswordRequestValues) {
    setError(null);
    setDevUrl(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.trim().toLowerCase() }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        devResetUrl?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Demande impossible.");
        return;
      }
      if (typeof json.devResetUrl === "string") {
        setDevUrl(json.devResetUrl);
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-[#F8FAFC] px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 flex justify-center">
            <MedsimLogo />
          </Link>
          <Card>
            <h1 className="text-xl font-semibold text-slate-900">Demande enregistrée</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Si un compte existe pour ce courriel, suivez les instructions reçues. En production, un e-mail serait
              envoyé depuis votre fournisseur (SendGrid, Resend, etc.).
            </p>
            {devUrl ? (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-medium">Mode dev (`MEDSIM_DEV_PASSWORD_RESET=true`)</p>
                <p className="mt-2 break-all">
                  <Link href={devUrl} className="text-[#1D9E75] underline">
                    Ouvrir le lien de réinitialisation
                  </Link>
                </p>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500">
                En local, le lien peut aussi être affiché dans le <strong>terminal</strong> du serveur (`npm run dev`)
                si <code className="rounded bg-slate-100 px-1">NODE_ENV=development</code>.
              </p>
            )}
            <Link
              href="/connexion"
              className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#1D9E75] text-sm font-semibold text-white hover:opacity-95"
            >
              Retour à la connexion
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
          <h1 className="text-xl font-semibold text-slate-900">Mot de passe oublié</h1>
          <p className="mt-1 text-sm text-slate-600">
            Saisissez le courriel associé à votre compte Anne-sante. Nous vous indiquerons la suite.
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit((d) => void onSubmit(d))}
            noValidate
            autoComplete="off"
          >
            <div>
              <Label htmlFor="medsim-forgot-email">Courriel</Label>
              <Input
                id="medsim-forgot-email"
                type="email"
                inputMode="email"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="h-12"
                readOnly={!unlocked}
                {...emailField}
                name="medsim-forgot-email"
                onFocus={unlock}
              />
              {errors.email ? (
                <p className="mt-1 text-[12px] text-red-600/90">{errors.email.message}</p>
              ) : null}
            </div>
            <FieldError message={error ?? undefined} />
            <Button type="submit" disabled={!isValid || submitting} className="h-12 w-full">
              {submitting ? "Envoi…" : "Continuer"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link href="/connexion" className="font-medium text-[#1D9E75] hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function MotDePasseOubliePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-slate-500">Chargement…</div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
