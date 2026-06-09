import { redirect } from "next/navigation";
import { requireIpsSession } from "@/lib/ips/auth";
import { patientDisplayName } from "@/lib/ips/queue-utils";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";
import { IpsAnneReportsPanel } from "@/components/ips/IpsAnneReportsPanel";

export default async function IpsRapportsAnnePage() {
  const session = await requireIpsSession();
  if (!session) redirect("/connexion?callbackUrl=/dashboard/ips/rapports");

  let patients: { id: string; name: string }[] = [];

  if (!isDemoMode()) {
    const questionnaires = await prisma.medicalQuestionnaire.findMany({
      where: { ipsId: session.user.id },
      include: { user: { select: { id: true, prenom: true, name: true } } },
      distinct: ["userId"],
    });

    patients = questionnaires.map((q) => ({
      id: q.user.id,
      name: patientDisplayName(q.user.prenom ?? "", q.user.name),
    }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-black text-slate-900">Rapports Anne</h1>
        <p className="mt-1 text-sm text-slate-600">
          Synthèses générées par le coach IA après chaque bilan hebdomadaire et chaque vendredi à 8 h.
          Triés par date, filtrables par patient.
        </p>
      </header>

      <IpsAnneReportsPanel patients={patients} />
    </div>
  );
}
