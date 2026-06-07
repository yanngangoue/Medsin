import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

export default async function PatientAnneReportsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/connexion?callbackUrl=/dashboard/patient/coach-ia/rapports");
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

  let reports: { id: string; kind: string; content: string; createdAt: Date; isEscalation: boolean }[] =
    [];

  if (!isDemoMode()) {
    reports = await prisma.anneIpsReport.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        kind: true,
        content: true,
        createdAt: true,
        isEscalation: true,
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <Link
          href="/dashboard/patient/coach-ia"
          className="text-sm text-[#1D4D3A] hover:underline"
        >
          ← Retour à Anne
        </Link>
        <h1 className="mt-3 text-2xl font-black text-slate-900">Historique des rapports</h1>
        <p className="mt-1 text-sm text-slate-600">
          Rapports transmis à votre IPS par Anne après vos check-ins et chaque semaine.
        </p>
      </header>

      {reports.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Aucun rapport pour le moment. Faites votre premier check-in avec Anne pour démarrer le
          suivi.
        </p>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-[#3EBD93]/25 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[#1D4D3A]">
                  {r.kind === "WEEKLY" ? "Rapport hebdomadaire" : "Après check-in"}
                </span>
                · {new Date(r.createdAt).toLocaleDateString("fr-CA")}
                {r.isEscalation ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Suivi renforcé
                  </span>
                ) : null}
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                {r.content}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
