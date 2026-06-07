import Link from "next/link";
import { requireIpsSession } from "@/lib/ips/auth";
import { ipsQuestionnaireListFilter } from "@/lib/ips/questionnaire-access";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function IpsDashboardPage() {
  const session = await requireIpsSession();
  if (!session) redirect("/connexion?callbackUrl=/dashboard/ips");

  const accessFilter = ipsQuestionnaireListFilter(
    session.user.id,
    session.user.role as "IPS" | "MEDECIN" | "ADMIN",
  );

  const questionnaires = isDemoMode()
    ? []
    : await prisma.medicalQuestionnaire.findMany({
        where: {
          status: { in: ["SUBMITTED", "UNDER_REVIEW", "PRESCRIPTION_ISSUED"] },
          ...accessFilter,
        },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { prenom: true } } },
        take: 30,
      });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E]">Dossiers à traiter</h1>
      <p className="mt-2 text-sm text-[#6B7280]">
        Questionnaires médicaux soumis en attente de révision IPS.
      </p>

      {questionnaires.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-[#6B7280]">
          Aucun dossier en attente pour le moment.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {questionnaires.map((q: (typeof questionnaires)[number]) => (
            <li key={q.id}>
              <Link
                href={`/dashboard/ips/questionnaires/${q.id}`}
                className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm transition hover:border-[#3EBD93]"
              >
                <div>
                  <p className="font-semibold text-[#1A1A2E]">{q.user.prenom}</p>
                  <p className="text-sm text-[#6B7280]">
                    IMC {q.bmi.toFixed(1)} · {q.status}
                  </p>
                </div>
                <span className="text-sm font-medium text-[#1D4D3A]">Ouvrir →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
