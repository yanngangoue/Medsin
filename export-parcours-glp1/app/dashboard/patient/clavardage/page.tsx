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
      description="Échangez avec Anne (coach santé IA) ou votre IPS assignée."
      maxWidth="4xl"
    >
      <PatientClavardage />
    </PatientDashboardPageShell>
  );
}
