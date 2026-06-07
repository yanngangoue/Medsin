import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PatientClavardage } from "@/components/chat/PatientClavardage";
import { PatientDashboardPageShell } from "@/components/dashboard/patient-space/PatientDashboardPageShell";

export default async function PatientClavardagePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/connexion?callbackUrl=/dashboard/patient/clavardage");
  }

  return (
    <PatientDashboardPageShell
      eyebrow="Messagerie"
      title="Clavardage"
      description="Messagerie sécurisée avec votre IPS — réponse généralement en moins de 24 h."
      maxWidth="4xl"
    >
      <PatientClavardage />
    </PatientDashboardPageShell>
  );
}
