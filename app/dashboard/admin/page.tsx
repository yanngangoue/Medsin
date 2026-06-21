import Link from "next/link";
import { getAdminStats, getRecentPatients } from "@/lib/admin/stats";
import { StatCard } from "@/components/admin/StatCard";

function formatCad(cents: number): string {
  return `${(cents / 100).toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

export default async function DashboardAdminPage() {
  const [stats, recentPatients] = await Promise.all([getAdminStats(), getRecentPatients(5)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Administration Anne-sante</h1>
      <p className="mt-1 text-sm text-slate-600">Vue globale — parcours clinique GLP-1</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Patients actifs (abonnés)" value={stats.activePatients} icon="👥" />
        <StatCard
          label="Ordonnances en attente"
          value={stats.pendingFulfillments}
          icon="💊"
          accent="amber"
        />
        <StatCard
          label="Revenus Stripe (mois)"
          value={formatCad(stats.stripeRevenueCentsThisMonth)}
          icon="💳"
          accent="green"
        />
        <StatCard label="Patients inscrits" value={stats.totalPatients} icon="📋" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Gestion équipe</h2>
            <Link href="/admin/equipe" className="text-sm text-[#16a34a] hover:underline">
              IPS & pharmacie
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Créez des comptes IPS (@anne-sante.ca) et pharmacie, envoyez les invitations et désactivez
            les accès si nécessaire.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Derniers patients</h2>
            <Link href="/admin/patients" className="text-sm text-[#16a34a] hover:underline">
              Voir tout
            </Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {recentPatients.map((p) => (
              <li key={p.id} className="flex justify-between border-t border-slate-100 pt-2 first:border-0 first:pt-0">
                <Link href={`/admin/patients/${p.id}`} className="font-medium text-[#16a34a] hover:underline">
                  {p.name}
                </Link>
                <span className="text-xs text-slate-400">
                  {new Date(p.createdAt).toLocaleDateString("fr-CA")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
