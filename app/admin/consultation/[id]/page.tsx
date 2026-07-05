import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isStaffRole } from "@/lib/session";
import { VideoConsultationRoom } from "@/components/dashboard/patient-space/VideoConsultationRoom";

type Props = { params: Promise<{ id: string }> };

export default async function AdminVideoConsultationPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/admin/teleconsultations");
  if (!isStaffRole(session.user.role)) redirect("/acces-refuse");

  const { id } = await params;

  return (
    <VideoConsultationRoom
      appointmentId={id}
      displayName={session.user.prenom ?? session.user.name ?? "Médecin"}
      backHref="/admin/teleconsultations"
      backLabel="← Retour aux consultations"
    />
  );
}
