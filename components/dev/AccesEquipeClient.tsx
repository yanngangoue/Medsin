"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { MedsimLogo } from "@/components/MedsimLogo";
import type { StaffDemoRole } from "@/lib/staff-demo-login";

type RoleCard = {
  role: StaffDemoRole;
  label: string;
  description: string;
  home: string;
};

export function AccesEquipeClient({ roles }: { roles: RoleCard[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<StaffDemoRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enterAs(role: StaffDemoRole) {
    setBusy(role);
    setError(null);
    try {
      const res = await fetch("/api/dev/staff-demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = (await res.json().catch(() => null)) as {
        email?: string;
        password?: string;
        redirectTo?: string;
        error?: string;
      } | null;
      if (!res.ok || !data?.email || !data.password) {
        setError(data?.error ?? "Connexion démo impossible. Vérifiez que les comptes de test existent.");
        return;
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Identifiants refusés. Utilisez la connexion classique ou contactez l'administrateur.");
        return;
      }
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href="/">
            <MedsimLogo />
          </Link>
          <Link href="/connexion" className="text-xs font-medium text-slate-500 hover:text-slate-800">
            Connexion classique
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-xl font-bold text-[#1A1A2E]">Accès équipe — démo</h1>
        <p className="mt-2 text-sm text-slate-600">
          Connexion en un clic pour tester les espaces professionnels. Réservé au développement et
          staging.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <ul className="mt-6 space-y-3">
          {roles.map((r) => (
            <li key={r.role}>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void enterAs(r.role)}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#6C63FF]/40 hover:shadow disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6C63FF]/10 text-sm font-bold text-[#6C63FF]">
                  {r.label.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#1A1A2E]">
                    {busy === r.role ? "Connexion…" : `Entrer en tant que ${r.label}`}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">{r.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-[11px] text-slate-400">
          La file IPS est préremplie après initialisation des données de démonstration.
        </p>
      </main>
    </div>
  );
}
