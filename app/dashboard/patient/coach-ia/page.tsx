import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AnneCoachChat } from "@/components/dashboard/patient-space/AnneCoachChat";

export default async function CoachIaPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/connexion?callbackUrl=/dashboard/patient/coach-ia");
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

  const prenom = session.user.prenom ?? session.user.name ?? "";

  return <AnneCoachChat prenom={prenom} />;
}
