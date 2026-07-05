import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DossierComplet } from "@/components/medecin/DossierComplet";

type Props = { params: Promise<{ id: string }> };

export default async function MedecinDossierPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/medecin/file");

  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <DossierComplet dossierId={id} staffUserId={session.user.id} />
    </div>
  );
}
