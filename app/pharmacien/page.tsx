import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MedsimLogo } from "@/components/MedsimLogo";
import { SignOutButton } from "@/components/role-portal/SignOutButton";

const STATUS_LABEL: Record<string, string> = {
  ISSUED: "Émise",
  SENT_TO_PHARMACY: "Reçue",
  IN_PREPARATION: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STATUS_COLOR: Record<string, string> = {
  ISSUED: "bg-slate-100 text-slate-700",
  SENT_TO_PHARMACY: "bg-blue-50 text-blue-700",
  IN_PREPARATION: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default async function PharmacienDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/pharmacien");
  if (session.user.role !== "PHARMACIEN") redirect("/acces-refuse");

  const prenom = session.user.prenom ?? session.user.name ?? "—";

  const pharmacien = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { pharmacyPartnerId: true, pharmacyPartner: { select: { name: true } } },
  });

  const fulfillments = await prisma.medicationFulfillment.findMany({
    where: pharmacien?.pharmacyPartnerId
      ? { pharmacyId: pharmacien.pharmacyPartnerId }
      : {},
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { prenom: true, name: true } },
    },
  });

  const pending = fulfillments.filter((f) =>
    ["ISSUED", "SENT_TO_PHARMACY", "IN_PREPARATION"].includes(f.status),
  );
  const shipped = fulfillments.filter((f) => f.status === "SHIPPED");
  const delivered = fulfillments.filter((f) => f.status === "DELIVERED");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200/80 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" aria-label="Anne Santé">
            <MedsimLogo />
          </Link>
          <span className="text-xs font-medium text-slate-500">
            Espace pharmacien
            {pharmacien?.pharmacyPartner?.name
              ? ` · ${pharmacien.pharmacyPartner.name}`
              : ""}
          </span>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bonjour, {prenom}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tableau de bord des ordonnances · Mis à jour en temps réel
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "À préparer", value: pending.length, color: "text-amber-600" },
            { label: "Expédiées", value: shipped.length, color: "text-purple-600" },
            { label: "Livrées", value: delivered.length, color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* File des ordonnances en attente */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Ordonnances actives ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-10 text-center text-sm text-slate-500">
              Aucune ordonnance en attente. Tout est à jour.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Médicament</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Dosage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Reçue le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pending.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {f.user.prenom ?? f.user.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{f.medication}</td>
                      <td className="px-4 py-3 text-slate-600">{f.dosage}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLOR[f.status] ?? "bg-slate-100 text-slate-700"}`}>
                          {STATUS_LABEL[f.status] ?? f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(f.createdAt).toLocaleDateString("fr-CA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Historique récent */}
        {(shipped.length > 0 || delivered.length > 0) ? (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              Historique récent ({shipped.length + delivered.length})
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Médicament</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">N° suivi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...shipped, ...delivered].map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {f.user.prenom ?? f.user.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{f.medication}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLOR[f.status] ?? "bg-slate-100 text-slate-700"}`}>
                          {STATUS_LABEL[f.status] ?? f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {f.trackingNumber ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
