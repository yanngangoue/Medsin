import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PatientDashboardHome } from "@/components/dashboard/patient-space/PatientDashboardHome";

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion?callbackUrl=/dashboard/patient");
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

  const prenom = session.user.prenom ?? session.user.name ?? "";

  return <PatientDashboardHome prenom={prenom} />;
}
