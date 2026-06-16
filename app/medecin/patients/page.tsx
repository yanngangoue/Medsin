import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function MedecinPatientsPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/medecin/patients");
  if (session.user.role !== "MEDECIN" && session.user.role !== "ADMIN") {
    redirect("/acces-refuse");
  }

  const dossiers = await prisma.dossierGlp1.findMany({
    where: session.user.role === "MEDECIN"
      ? { medecinId: session.user.id }
      : {},
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      patient: { select: { prenom: true, name: true, email: true } },
    },
  });

  const STATUS_LABEL: Record<string, string> = {
    EN_ATTENTE_MEDECIN: "En attente",
    EN_COURS_REVISION: "En révision",
    INFO_REQUISE: "Info requise",
    EN_ATTENTE_CONSULTATION: "Consultation",
    APPROUVE: "Approuvé",
    REFUSE: "Refusé",
    ANNULE: "Annulé",
    EXCLU_PRE_DIAGNOSTIC: "Exclu",
  };

  const STATUS_COLOR: Record<string, string> = {
    EN_ATTENTE_MEDECIN: "bg-amber-50 text-amber-700",
    EN_COURS_REVISION: "bg-blue-50 text-blue-700",
    APPROUVE: "bg-emerald-50 text-emerald-700",
    REFUSE: "bg-red-50 text-red-700",
    INFO_REQUISE: "bg-orange-50 text-orange-700",
    EN_ATTENTE_CONSULTATION: "bg-purple-50 text-purple-700",
    ANNULE: "bg-slate-100 text-slate-500",
    EXCLU_PRE_DIAGNOSTIC: "bg-slate-100 text-slate-500",
  };

  const active = dossiers.filter((d) =>
    ["EN_ATTENTE_MEDECIN", "EN_COURS_REVISION", "INFO_REQUISE", "EN_ATTENTE_CONSULTATION"].includes(d.status),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes patients</h1>
          <p className="mt-1 text-sm text-slate-500">
            {dossiers.length} dossier{dossiers.length !== 1 ? "s" : ""} ·{" "}
            {active.length} en cours
          </p>
        </div>
        <Link
          href="/medecin/file"
          className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-medium text-white hover:bg-[#15803d]"
        >
          File de travail →
        </Link>
      </div>

      {dossiers.length === 0 ? (
        <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-12 text-center">
          <p className="text-slate-500">Aucun dossier patient assigné.</p>
          <Link href="/medecin/file" className="mt-3 inline-block text-sm font-medium text-[#16a34a] hover:underline">
            Voir la file de travail →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Mis à jour</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dossiers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">
                      {d.patient.prenom ?? d.patient.name ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400">{d.patient.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLOR[d.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(d.updatedAt).toLocaleDateString("fr-CA")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/medecin/dossier/${d.id}`}
                      className="text-xs font-medium text-[#16a34a] hover:underline"
                    >
                      Ouvrir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
