import Link from "next/link";
import { getAdminStats, getRecentPatients, getRecentUnreadMessages } from "@/lib/admin/stats";
import { buildAdminPatientsWhere } from "@/lib/admin/patient-filters";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { EligibilityBadge } from "@/components/admin/EligibilityBadge";

export default async function AdminDashboardPage() {
  const [stats, recentPatients, recentMessages, reviewCount] = await Promise.all([
    getAdminStats(),
    getRecentPatients(5),
    getRecentUnreadMessages(5),
    prisma.user.count({ where: buildAdminPatientsWhere(null, "a_revoir", false) }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
      <p className="mt-1 text-sm text-slate-600">Vue d&apos;ensemble — parcours GLP-1</p>

      {reviewCount > 0 ? (
        <Link
          href="/admin/patients?queue=a_revoir"
          className="mt-6 block rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm hover:border-amber-300"
        >
          <p className="text-xs font-semibold uppercase text-amber-800">Alertes</p>
          <p className="mt-1 text-lg font-bold text-amber-950">
            {reviewCount} patient(s) en attente de révision médicale
          </p>
        </Link>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Patients inscrits" value={stats.totalPatients} icon="👥" />
        <StatCard label="Éligibles GLP-1" value={stats.eligible} icon="✅" />
        <StatCard
          label="Revue médicale"
          value={stats.pendingReview}
          icon="🔍"
          accent="amber"
        />
        <StatCard
          label="Messages non lus"
          value={stats.unreadMessages}
          icon="💬"
          accent="slate"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Derniers patients</h2>
            <Link href="/admin/patients" className="text-sm text-[#16a34a] hover:underline">
              Voir tout
            </Link>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-2">Nom</th>
                <th className="pb-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2">
                    <Link
                      href={`/admin/patients/${p.id}`}
                      className="font-medium text-[#16a34a] hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-2">
                    <EligibilityBadge status={p.eligibility} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Messages non lus</h2>
            <Link href="/admin/messages" className="text-sm text-[#16a34a] hover:underline">
              Centre messages
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentMessages.length === 0 ? (
              <li className="text-sm text-slate-500">Aucun message non lu.</li>
            ) : (
              recentMessages.map((m) => (
                <li key={m.id} className="border-t border-slate-100 pt-3 first:border-0 first:pt-0">
                  <Link
                    href={`/admin/patients/${m.patient.id}`}
                    className="font-medium text-slate-900 hover:text-[#16a34a]"
                  >
                    {m.patient.name}
                  </Link>
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{m.content}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(m.createdAt).toLocaleString("fr-CA")}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
