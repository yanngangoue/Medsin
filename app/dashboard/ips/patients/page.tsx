import Link from "next/link";
import { redirect } from "next/navigation";
import { requireIpsSession } from "@/lib/ips/auth";
import { ipsQuestionnaireListFilter } from "@/lib/ips/questionnaire-access";
import { patientDisplayName, patientInitials } from "@/lib/ips/queue-utils";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

export default async function IpsPatientsPage() {
  const session = await requireIpsSession();
  if (!session) redirect("/connexion?callbackUrl=/dashboard/ips/patients");

  const accessFilter = ipsQuestionnaireListFilter(
    session.user.id,
    session.user.role as "IPS" | "MEDECIN" | "ADMIN",
  );

  const patients = isDemoMode()
    ? []
    : await prisma.medicalQuestionnaire.findMany({
        where: {
          status: { in: ["PRESCRIPTION_ISSUED", "APPROVED", "UNDER_REVIEW"] },
          ...accessFilter,
        },
        orderBy: { updatedAt: "desc" },
        include: {
          user: { select: { prenom: true, name: true, email: true } },
          medicationFulfillment: { select: { medication: true, status: true } },
        },
        take: 50,
      });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-black text-slate-900">Mes patients</h1>
        <p className="mt-1 text-sm text-slate-600">
          Patients sous votre suivi IPS avec ordonnance ou dossier actif.
        </p>
      </header>

      {patients.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Aucun patient assigné pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {patients.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/ips/questionnaires/${p.id}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#3EBD93]/50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D4D3A]/10 text-xs font-bold text-[#1D4D3A]">
                  {patientInitials(p.user.prenom, p.user.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {patientDisplayName(p.user.prenom, p.user.name)}
                  </p>
                  <p className="text-xs text-slate-500">
                    IMC {p.bmi.toFixed(1)}
                    {p.medicationFulfillment
                      ? ` · ${p.medicationFulfillment.medication}`
                      : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#1D4D3A]">Dossier →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
