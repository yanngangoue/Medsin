import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/session";
import { buildAdminPatientsWhere } from "@/lib/admin/patient-filters";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion?callbackUrl=/admin/dashboard");
  if (!isStaffRole(session.user.role)) redirect("/acces-refuse");

  const glp1QueueWhere = buildAdminPatientsWhere(null, "a_revoir", false);
  const upcomingVisioWhere = {
    status: "SCHEDULED" as const,
    scheduledAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  };

  const [totalPatients, eligible, review, pending, glp1Queue, upcomingVisio] =
    await Promise.all([
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.patientProfile.count({ where: { eligibility: "ELIGIBLE" } }),
      prisma.patientProfile.count({ where: { eligibility: "MEDICAL_REVIEW_REQUIRED" } }),
      prisma.patientProfile.count({ where: { eligibility: "PENDING" } }),
      prisma.user.count({ where: glp1QueueWhere }),
      prisma.appointment.count({ where: upcomingVisioWhere }),
    ]);

  const isDoctor = session.user.role === "MEDECIN";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#16a34a]">
              {isDoctor ? "Espace médecin" : "Back-office"}
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              Tableau de bord — {session.user.prenom ?? session.user.name}
            </h1>
          </div>
          <Link
            href="/admin/patients"
            className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white"
          >
            Liste patients
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        {glp1Queue > 0 ? (
          <Link
            href="/admin/patients?queue=a_revoir"
            className="mb-6 block rounded-2xl border border-amber-200 bg-amber-50/80 p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              File à revoir — GLP-1
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-950">{glp1Queue}</p>
            <p className="mt-1 text-sm text-amber-900/80">
              Dossiers avec évaluation soumise en attente de décision clinique
            </p>
          </Link>
        ) : null}

        {upcomingVisio > 0 ? (
          <Link
            href="/admin/teleconsultations"
            className="mb-6 block rounded-2xl border border-[#C8E6D9] bg-[#F0FBF7] p-5 transition hover:border-[#1D9E75]/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1D9E75]">
              Consultations vidéo
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{upcomingVisio}</p>
            <p className="mt-1 text-sm text-slate-600">
              Rendez-vous à venir — rejoindre la salle avec le patient
            </p>
          </Link>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Patients" value={totalPatients} />
          <StatCard label="Éligibles" value={eligible} />
          <StatCard label="Revue médicale" value={review} />
          <StatCard label="En attente" value={pending} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/patients?queue=a_revoir"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            À revoir (GLP-1)
          </Link>
          <Link
            href="/admin/patients?glp1=1"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Tous avec éval. GLP-1
          </Link>
          <Link
            href="/admin/teleconsultations"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Téléconsultations
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Rôle connecté : {session.user.role}. Ouvrez un dossier pour lire les réponses patient et
          valider l&apos;éligibilité.
        </p>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
