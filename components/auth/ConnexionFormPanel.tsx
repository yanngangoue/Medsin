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

/* ── Panneau gauche marketing ────────────────────────────────── */
function MarketingPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1D4D3A] via-[#163d2e] to-[#0f2919] px-10 py-10 lg:flex lg:w-[46%]">
      {/* Cercles décoratifs */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute right-10 top-1/3 h-36 w-36 rounded-full border border-white/10" />

      {/* Logo */}
      <div className="relative z-10">
        <Link href="/">
          <MedsimLogo variant="onDark" />
        </Link>
      </div>

      {/* Contenu central */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#3EBD93]">
          Télémedecine GLP-1 · Québec
        </p>
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
          Reprenez le contrôle<br />de votre santé.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          Accédez à votre programme de gestion du poids, suivi par un professionnel de santé et votre coach IA Anne.
        </p>

        <ul className="mt-8 space-y-4">
          {[
            { icon: "⚕️", text: "Prescriptions GLP-1 par IPS agréée" },
            { icon: "🤖", text: "Coach Anne disponible 24 h/24" },
            { icon: "📦", text: "Livraison discrète à domicile" },
            { icon: "📊", text: "Suivi hebdomadaire personnalisé" },
          ].map((item) => (
            <li key={item.text} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-base">
                {item.icon}
              </span>
              <span className="text-sm font-medium text-white/85">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Témoignage */}
      <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm italic leading-relaxed text-white/75">
          &ldquo;En 4 mois avec MedSim, j&apos;ai perdu 18 kg. Le suivi d&apos;Anne est incroyable — comme avoir un coach de santé disponible à toute heure.&rdquo;
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3EBD93] text-xs font-bold text-white">
            M
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Marie-Claude B.</p>
            <p className="text-[11px] text-white/50">Patiente MedSim — Montréal</p>
          </div>
          <div className="ml-auto flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-[#3EBD93] text-xs">★</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Formulaire de connexion ─────────────────────────────────── */
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
    <div className="flex min-h-screen">
      <MarketingPanel />

      {/* Panneau formulaire */}
      <div className="flex flex-1 flex-col bg-white">
        {/* Logo mobile uniquement */}
        <header className="px-6 py-6 lg:hidden">
          <Link href="/" className="inline-block">
            <MedsimLogo />
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center px-6 pb-16 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-sm">
            {/* En-tête */}
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#1A1A2E] sm:text-3xl">
                Bon retour 👋
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Connectez-vous à votre espace MedSim.
              </p>
            </div>

            {/* Bannières contextuelles */}
            {searchParams.get("created") === "1" ? (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span className="text-emerald-500 text-lg">✓</span>
                <p className="text-sm font-medium text-emerald-900">Compte créé ! Connectez-vous pour continuer.</p>
              </div>
            ) : searchParams.get("reset") === "ok" ? (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span className="text-emerald-500 text-lg">✓</span>
                <p className="text-sm font-medium text-emerald-900">Mot de passe mis à jour. Vous pouvez vous connecter.</p>
              </div>
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
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:border-[#3EBD93] focus:bg-white focus:ring-4 focus:ring-[#3EBD93]/10"
                  readOnly={!unlocked}
                  {...emailField}
                  name="medsim-login-email"
                  onFocus={() => { unlock(); }}
                />
                {errors.email ? (
                  <p className="mt-1 text-[12px] text-red-600/90">{errors.email.message}</p>
                ) : null}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="medsim-login-password">Mot de passe</Label>
                  <Link
                    href="/connexion/mot-de-passe-oublie"
                    className="text-xs font-medium text-slate-500 hover:text-[#1D4D3A] hover:underline"
                  >
                    Oublié ?
                  </Link>
                </div>
                <Input
                  id="medsim-login-password"
                  type="password"
                  autoComplete="off"
                  placeholder="••••••••"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:border-[#3EBD93] focus:bg-white focus:ring-4 focus:ring-[#3EBD93]/10"
                  readOnly={!unlocked}
                  {...passwordField}
                  name="medsim-login-password"
                  onFocus={() => { unlock(); }}
                />
                {errors.password ? (
                  <p className="mt-1 text-[12px] text-red-600/90">{errors.password.message}</p>
                ) : null}
              </div>

              <FieldError message={error ?? undefined} />

              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] text-sm font-bold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Connexion…</>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              Pas encore de compte ?{" "}
              <Link
                href={
                  searchParams.get("service") === "gestion-poids"
                    ? "/auth/inscription?service=gestion-poids"
                    : "/auth/inscription"
                }
                className="font-semibold text-[#1D4D3A] hover:underline"
              >
                Commencer gratuitement
              </Link>
            </p>

            <StaffDemoLoginLink />
          </div>
        </main>
      </div>
    </div>
  );
}
