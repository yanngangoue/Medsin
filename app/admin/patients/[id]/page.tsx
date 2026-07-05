import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isStaffRole } from "@/lib/session";
import { PatientDossier } from "@/components/admin/PatientDossier";

type Props = { params: Promise<{ id: string }> };

export default async function AdminPatientDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  if (!isStaffRole(session.user.role)) redirect("/acces-refuse");

  const { id } = await params;

  return <PatientDossier patientId={id} staffUserId={session.user.id} />;
}
