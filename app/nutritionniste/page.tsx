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

  // Patients avec programme de poids actif — seuls patients pertinents pour le suivi nutritionnel
  const programs = await prisma.weightProgram.findMany({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
    take: 60,
    select: {
      id: true,
      status: true,
      startWeight: true,
      currentWeight: true,
      targetWeight: true,
      medication: true,
      startDate: true,
      userId: true,
      user: {
        select: {
          id: true,
          prenom: true,
          name: true,
          profile: { select: { bmi: true, eligibility: true } },
        },
      },
      checkIns: {
        orderBy: { recordedAt: "desc" },
        take: 1,
        select: { recordedAt: true, weight: true, isEscalation: true },
      },
    },
  });

  const escalations = programs.filter((p) => p.checkIns[0]?.isEscalation);
  const totalLoss = programs.reduce(
    (s, p) => s + (p.startWeight && p.currentWeight ? p.startWeight - p.currentWeight : 0),
    0,
  );
  const avgLoss = programs.length > 0 ? Math.round((totalLoss / programs.length) * 10) / 10 : 0;

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
          <Link href="/" aria-label="Anne-sante">
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
            Suivi comportemental et métabolique · {programs.length} patient{programs.length !== 1 ? "s" : ""} actif{programs.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Patients actifs", value: programs.length, color: "text-emerald-600" },
            { label: "Alertes escalade", value: escalations.length, color: escalations.length > 0 ? "text-red-600" : "text-slate-400" },
            { label: "Perte moy. (kg)", value: avgLoss, color: "text-slate-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Alertes escalade */}
        {escalations.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-red-600">
              Alertes — Effets secondaires signalés ({escalations.length})
            </h2>
            <div className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-red-50 bg-red-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-600">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-600">Médicament</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-600">Dernier check-in</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50">
                  {escalations.map((p) => (
                    <tr key={p.id} className="hover:bg-red-50/40">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {p.user.prenom ?? p.user.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.medication ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {p.checkIns[0]
                          ? new Date(p.checkIns[0].recordedAt).toLocaleDateString("fr-CA")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/nutritionniste/patients/${p.user.id}`}
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Voir dossier
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tous les patients actifs */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Patients en suivi ({programs.length})
          </h2>
          {programs.length === 0 ? (
            <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-10 text-center text-sm text-slate-500">
              Aucun patient avec programme actif pour le moment.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">IMC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Perte (kg)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Médicament</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Dernier check-in</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programs.map((p) => {
                    const lastCheckIn = p.checkIns[0];
                    const eligibility = p.user.profile?.eligibility ?? "PENDING";
                    const weightLoss =
                      p.startWeight && p.currentWeight
                        ? Math.round((p.startWeight - p.currentWeight) * 10) / 10
                        : null;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {p.user.prenom ?? p.user.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.user.profile?.bmi ? p.user.profile.bmi.toFixed(1) : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {weightLoss !== null ? (
                            <span className={weightLoss > 0 ? "text-emerald-600" : "text-slate-400"}>
                              {weightLoss > 0 ? "-" : ""}{Math.abs(weightLoss)} kg
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{p.medication ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {lastCheckIn
                            ? new Date(lastCheckIn.recordedAt).toLocaleDateString("fr-CA")
                            : "Aucun"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ELIGIBILITY_COLOR[eligibility] ?? "bg-slate-100 text-slate-700"}`}>
                            {eligibility === "ELIGIBLE" ? "Suivi actif" : eligibility}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/nutritionniste/patients/${p.user.id}`}
                            className="rounded-lg bg-[#1D4D3A] px-3 py-1 text-xs font-medium text-white hover:bg-[#163d2e]"
                          >
                            Dossier
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <strong>Données métaboliques détaillées :</strong> disponibles via l&apos;API{" "}
          <code className="rounded bg-blue-100 px-1 text-xs">/api/nutritionniste/patients/[id]</code>{" "}
          et le tableau de bord interop{" "}
          <code className="rounded bg-blue-100 px-1 text-xs">/api/interop/v1/metabolic/dashboard/nutritionist/[patientId]</code>.
        </div>
      </main>
    </div>
  );
}
