import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function MedecinAgendaPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/medecin/agenda");
  if (session.user.role !== "MEDECIN" && session.user.role !== "ADMIN") {
    redirect("/acces-refuse");
  }

  const now = new Date();
  const appointments = await prisma.appointment.findMany({
    where: {
      userId: { not: session.user.id },
      scheduledAt: { gte: now },
      status: "SCHEDULED",
    },
    orderBy: { scheduledAt: "asc" },
    take: 20,
    include: {
      user: { select: { prenom: true, name: true } },
    },
  });

  const past = await prisma.appointment.findMany({
    where: {
      scheduledAt: { lt: now },
      status: { in: ["COMPLETED", "CANCELLED"] },
    },
    orderBy: { scheduledAt: "desc" },
    take: 10,
    include: {
      user: { select: { prenom: true, name: true } },
    },
  });

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("fr-CA", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
          <p className="mt-1 text-sm text-slate-500">
            Téléconsultations à venir · {appointments.length} planifiée{appointments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/teleconsultations"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Vue admin →
        </Link>
      </div>

      {/* Prochains RDV */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Prochains rendez-vous</h2>
        {appointments.length === 0 ? (
          <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-10 text-center text-sm text-slate-500">
            Aucun rendez-vous planifié.
          </div>
        ) : (
          appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {apt.user.prenom ?? apt.user.name ?? "—"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{formatDate(apt.scheduledAt)}</p>
                {apt.isTeleconsult ? (
                  <span className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                    Téléconsultation
                  </span>
                ) : null}
              </div>
              {apt.notes ? (
                <p className="max-w-[200px] text-xs text-slate-400">{apt.notes}</p>
              ) : null}
            </div>
          ))
        )}
      </section>

      {/* Historique */}
      {past.length > 0 ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Historique récent</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {past.map((apt) => (
                  <tr key={apt.id}>
                    <td className="px-4 py-2.5 text-slate-700">
                      {apt.user.prenom ?? apt.user.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{formatDate(apt.scheduledAt)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${apt.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {apt.status === "COMPLETED" ? "Complété" : "Annulé"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
