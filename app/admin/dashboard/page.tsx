import Link from "next/link";
import { getAdminStats, getRecentPatients, getRecentUnreadMessages } from "@/lib/admin/stats";
import { buildAdminPatientsWhere } from "@/lib/admin/patient-filters";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { EligibilityBadge } from "@/components/admin/EligibilityBadge";

function formatCad(cents: number): string {
  return `${(cents / 100).toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

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
      <p className="mt-1 text-sm text-slate-600">Vue d&apos;ensemble — parcours clinique GLP-1 Anne-sante</p>

      {(reviewCount > 0 || stats.pendingIpsQueue > 0 || stats.pendingPayments > 0) ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reviewCount > 0 ? (
            <Link
              href="/admin/patients?queue=a_revoir"
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm hover:border-amber-300"
            >
              <p className="text-xs font-semibold uppercase text-amber-800">Revue médicale</p>
              <p className="mt-1 text-lg font-bold text-amber-950">{reviewCount} patient(s)</p>
            </Link>
          ) : null}
          {stats.pendingIpsQueue > 0 ? (
            <Link
              href="/admin/ips"
              className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm hover:border-blue-300"
            >
              <p className="text-xs font-semibold uppercase text-blue-800">File IPS</p>
              <p className="mt-1 text-lg font-bold text-blue-950">{stats.pendingIpsQueue} dossier(s)</p>
            </Link>
          ) : null}
          {stats.pendingPayments > 0 ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-violet-800">Paiements en attente</p>
              <p className="mt-1 text-lg font-bold text-violet-950">{stats.pendingPayments} ordonnance(s)</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Patients inscrits" value={stats.totalPatients} icon="👥" />
        <StatCard label="Abonnés actifs" value={stats.activePatients} icon="✅" accent="green" />
        <StatCard
          label="Ordonnances en cours"
          value={stats.pendingFulfillments}
          icon="💊"
          accent="amber"
        />
        <StatCard
          label="Revenus (mois)"
          value={formatCad(stats.stripeRevenueCentsThisMonth)}
          icon="💳"
          accent="green"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Éligibles GLP-1" value={stats.eligible} icon="📋" />
        <StatCard label="Revue médicale" value={stats.pendingReview} icon="🔍" accent="amber" />
        <StatCard label="File IPS" value={stats.pendingIpsQueue} icon="👩‍⚕️" />
        <StatCard
          label="Messages non lus"
          value={stats.unreadMessages}
          icon="💬"
          accent="slate"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
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
                <th className="pb-2 hidden sm:table-cell">Inscription</th>
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
                  <td className="hidden py-2 text-xs text-slate-400 sm:table-cell">
                    {new Date(p.createdAt).toLocaleDateString("fr-CA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Actions rapides</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/admin/equipe" className="font-medium text-[#16a34a] hover:underline">
                  Créer un compte IPS ou pharmacie
                </Link>
              </li>
              <li>
                <Link href="/admin/patients" className="font-medium text-[#16a34a] hover:underline">
                  Gérer les patients
                </Link>
              </li>
              <li>
                <Link href="/admin/pharmacies" className="font-medium text-[#16a34a] hover:underline">
                  Suivi pharmacie
                </Link>
              </li>
              <li>
                <Link href="/admin/messages" className="font-medium text-[#16a34a] hover:underline">
                  Centre de messages
                </Link>
              </li>
            </ul>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Messages non lus</h2>
              <Link href="/admin/messages" className="text-sm text-[#16a34a] hover:underline">
                Tout voir
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
                  </li>
                ))
              )}
            </ul>
          </section>
        </section>
      </div>
    </div>
  );
}
