import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { VideoConsultationRoom } from "@/components/dashboard/patient-space/VideoConsultationRoom";

type Props = { params: Promise<{ id: string }> };

export default async function PatientVideoConsultationPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion?callbackUrl=/dashboard/patient");
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

  const { id } = await params;

  return (
    <VideoConsultationRoom
      appointmentId={id}
      displayName={session.user.prenom ?? session.user.name ?? "Patient"}
      backHref="/dashboard/patient#contact-medical"
      backLabel="← Retour à mon espace"
    />
  );
}
