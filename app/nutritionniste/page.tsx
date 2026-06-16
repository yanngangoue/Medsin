import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MedsimLogo } from "@/components/MedsimLogo";
import { SignOutButton } from "@/components/role-portal/SignOutButton";

export default async function NutritionnisteDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/nutritionniste");
  if (session.user.role !== "NUTRITIONNISTE") redirect("/acces-refuse");

  const prenom = session.user.prenom ?? session.user.name ?? "—";

  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      prenom: true,
      name: true,
      createdAt: true,
      profile: {
        select: {
          weightKg: true,
          bmi: true,
          eligibility: true,
        },
      },
      metabolicIntakes: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true, category: true },
      },
    },
  });

  const activePatients = patients.filter(
    (p) => p.profile?.eligibility === "ELIGIBLE",
  );
  const pendingPatients = patients.filter(
    (p) => !p.profile || p.profile.eligibility === "PENDING",
  );

  const ELIGIBILITY_LABEL: Record<string, string> = {
    ELIGIBLE: "Suivi actif",
    PENDING: "En attente",
    NOT_ELIGIBLE: "Non éligible",
    MEDICAL_REVIEW_REQUIRED: "Révision médicale",
  };

  const ELIGIBILITY_COLOR: Record<string, string> = {
    ELIGIBLE: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    NOT_ELIGIBLE: "bg-red-50 text-red-700",
    MEDICAL_REVIEW_REQUIRED: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200/80 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" aria-label="MedSim">
            <MedsimLogo />
          </Link>
          <span className="text-xs font-medium text-slate-500">Espace nutritionniste</span>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bonjour, {prenom}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Suivi comportement alimentaire et métabolique · {patients.length} patients
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Patients actifs", value: activePatients.length, color: "text-emerald-600" },
            { label: "En attente", value: pendingPatients.length, color: "text-amber-600" },
            { label: "Total", value: patients.length, color: "text-slate-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Patients actifs */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Patients en suivi actif ({activePatients.length})
          </h2>
          {activePatients.length === 0 ? (
            <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-10 text-center text-sm text-slate-500">
              Aucun patient en suivi actif pour le moment.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">IMC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Poids</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Dernière activité</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activePatients.map((p) => {
                    const lastIntake = p.metabolicIntakes[0];
                    const eligibility = p.profile?.eligibility ?? "PENDING";
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {p.prenom ?? p.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.profile?.bmi ? p.profile.bmi.toFixed(1) : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.profile?.weightKg ? `${p.profile.weightKg} kg` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {lastIntake
                            ? new Date(lastIntake.createdAt).toLocaleDateString("fr-CA")
                            : "Aucune donnée"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ELIGIBILITY_COLOR[eligibility] ?? "bg-slate-100 text-slate-700"}`}>
                            {ELIGIBILITY_LABEL[eligibility] ?? eligibility}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Note sur les données métaboliques */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <strong>Données métaboliques détaillées :</strong> les journaux alimentaires, sommeil, activité et compléments de chaque patient sont disponibles via l&apos;API{" "}
          <code className="rounded bg-blue-100 px-1 text-xs">/api/interop/v1/metabolic/dashboard/nutritionist/[patientId]</code>.
        </div>
      </main>
    </div>
  );
}
