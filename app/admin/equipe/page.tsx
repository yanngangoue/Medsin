import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminTeamPanel } from "@/components/admin/AdminTeamPanel";

export default async function AdminEquipePage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/acces-refuse");
  }

  return (
    <div>
      <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">
        <h1 className="text-xl font-bold text-slate-900">Gestion de l&apos;équipe</h1>
        <p className="mt-1 text-sm text-slate-600">
          Réservé à l&apos;administrateur : invitez des IPS, médecins et pharmaciens partenaires.
          Chaque membre reçoit un identifiant <strong>@medsim.ca</strong> et crée son mot de passe
          via le lien d&apos;activation.
        </p>
      </div>
      <AdminTeamPanel />
    </div>
  );
}
