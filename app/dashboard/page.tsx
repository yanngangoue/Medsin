"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { objectifLabel } from "@/lib/questionnaire-labels";
import { parseQuestionnaireResponse, type QuestionnaireApiPayload } from "@/lib/questionnaire-api";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireApiPayload | null>(null);
  const [questionnaireFetched, setQuestionnaireFetched] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/connexion");
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/questionnaire");
      if (cancelled) return;
      if (res.ok) {
        setQuestionnaire(parseQuestionnaireResponse(await res.json()));
      }
      setQuestionnaireFetched(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [status, router]);

  async function logout() {
    await signOut({ callbackUrl: "/" });
  }

  if (status === "loading" || !session?.user || !questionnaireFetched) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-slate-500">
        Chargement…
      </div>
    );
  }

  const prenom = session.user.prenom ?? session.user.name ?? "—";
  const q = questionnaire;
  const imc = q != null ? String(q.imc) : "—";
  const dateSoumission =
    q?.submittedAt != null
      ? new Date(q.submittedAt).toLocaleDateString("fr-CA", { dateStyle: "medium" })
      : "—";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200/80 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-[680px] items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Medsim
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-sm font-medium text-slate-600 hover:text-[#1D9E75]"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[680px] space-y-6 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Bonjour, {prenom}</h1>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            Dossier en examen
          </span>
        </div>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Statut du dossier</h2>
          <div className="relative mt-6 pl-6">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-slate-200" aria-hidden />
            <ol className="space-y-6">
              <li className="relative flex gap-3">
                <span className="absolute -left-6 mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1D9E75] text-[10px] font-bold text-white">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">Questionnaire complété</p>
                  <p className="text-xs text-slate-500">Étape terminée</p>
                </div>
              </li>
              <li className="relative flex gap-3">
                <span className="absolute -left-6 mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1D9E75] ring-2 ring-[#1D9E75]/30">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                </span>
                <div>
                  <p className="text-sm font-medium text-[#1D9E75]">Examen médical en cours</p>
                  <p className="text-xs text-slate-500">En traitement</p>
                </div>
              </li>
              <li className="relative flex gap-3">
                <span className="absolute -left-6 mt-1 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                <div>
                  <p className="text-sm font-medium text-slate-400">Ordonnance</p>
                  <p className="text-xs text-slate-400">À venir</p>
                </div>
              </li>
            </ol>
          </div>
          <p className="mt-6 text-sm text-slate-600">Votre médecin vous contactera dans les 24h.</p>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Vos informations</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Objectif</dt>
              <dd className="font-medium text-slate-900">{q ? objectifLabel(q.objectif) : "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">IMC</dt>
              <dd className="font-medium text-slate-900">{imc}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Date de soumission</dt>
              <dd className="font-medium text-slate-900">{dateSoumission}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Besoin d’aide ?</h2>
          <p className="mt-2 text-sm text-slate-600">Disponible 7j/7 de 8h à 20h</p>
          <button
            type="button"
            className="mt-4 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Contacter le support
          </button>
        </section>
      </main>
    </div>
  );
}
