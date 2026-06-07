import { redirect } from "next/navigation";
import { requireIpsSession } from "@/lib/ips/auth";
import { patientDisplayName } from "@/lib/ips/queue-utils";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

export default async function IpsRapportsAnnePage() {
  const session = await requireIpsSession();
  if (!session) redirect("/connexion?callbackUrl=/dashboard/ips/rapports");

  let reports: {
    id: string;
    userId: string;
    aiReport: string | null;
    recordedAt: Date;
    user: { prenom: string | null; name: string | null };
  }[] = [];

  if (!isDemoMode()) {
    const ipsPatients = await prisma.medicalQuestionnaire.findMany({
      where: { ipsId: session.user.id },
      select: { userId: true },
      distinct: ["userId"],
    });
    const userIds = ipsPatients.map((p) => p.userId);

    if (userIds.length > 0) {
      const rows = await prisma.weightCheckIn.findMany({
        where: {
          aiReport: { not: null },
          userId: { in: userIds },
        },
        orderBy: { recordedAt: "desc" },
        take: 30,
      });

      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, prenom: true, name: true },
      });
      const userById = new Map(users.map((u) => [u.id, u]));

      reports = rows.map((r) => ({
        ...r,
        user: userById.get(r.userId) ?? { prenom: null, name: null },
      }));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-black text-slate-900">Rapports Anne</h1>
        <p className="mt-1 text-sm text-slate-600">
          Synthèses hebdomadaires générées par le coach IA pour vos patients.
        </p>
      </header>

      {reports.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Aucun rapport Anne pour le moment. Les rapports apparaîtront après les check-ins
          hebdomadaires.
        </p>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-[#3EBD93]/25 bg-gradient-to-br from-[#F0F7F4] to-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3EBD93] text-xs font-bold text-white">
                  A
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {patientDisplayName(r.user.prenom ?? "", r.user.name)}
                  <span className="font-normal text-slate-500">
                    {" "}
                    · {new Date(r.recordedAt).toLocaleDateString("fr-CA")}
                  </span>
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {r.aiReport}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
