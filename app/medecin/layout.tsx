import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MedecinSidebar } from "@/components/medecin/MedecinSidebar";
import { MedecinHeader } from "@/components/medecin/MedecinHeader";
import { dossierGlp1Client } from "@/lib/medecin/prisma-dossier";
import { PortalSectionBoundary } from "@/components/layout/PortalSectionBoundary";

export default async function MedecinLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/medecin/file");
  if (session.user.role !== "MEDECIN" && session.user.role !== "ADMIN") {
    redirect("/acces-refuse");
  }

  const prenom = session.user.prenom ?? session.user.name ?? "Médecin";

  const urgentWhere =
    session.user.role === "ADMIN"
      ? {
          status: "EN_ATTENTE_MEDECIN" as const,
          createdAt: { lte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        }
      : {
          status: "EN_ATTENTE_MEDECIN" as const,
          createdAt: { lte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
          OR: [{ medecinId: null }, { medecinId: session.user.id }],
        };

  let urgentCount = 0;
  const dossierDb = dossierGlp1Client();
  if (dossierDb) {
    try {
      urgentCount = await dossierDb.count({ where: urgentWhere });
    } catch (e) {
      console.error("[medecin/layout] urgentCount", e);
    }
  }

  return (
    <div className="min-h-screen bg-white md:flex">
      <MedecinSidebar urgentCount={urgentCount} />
      <div className="flex min-h-screen flex-1 flex-col pb-[max(5rem,calc(4rem+env(safe-area-inset-bottom)))] md:pb-0">
        <MedecinHeader prenom={prenom} urgentCount={urgentCount} />
        <main className="flex-1 bg-[#F8FAFC]">
          <PortalSectionBoundary title="Impossible d'afficher cette section du portail médecin.">
            {children}
          </PortalSectionBoundary>
        </main>
      </div>
    </div>
  );
}
