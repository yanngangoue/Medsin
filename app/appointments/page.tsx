import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isStaffRole } from "@/lib/session";

/** Ancienne page rendez-vous → espace patient ou file médecin. */
export default async function AppointmentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/connexion?callbackUrl=/dashboard/patient");
  }
  if (session.user.role === "PATIENT") {
    redirect("/dashboard/patient#contact-medical");
  }
  if (isStaffRole(session.user.role)) {
    redirect("/admin/teleconsultations");
  }
  redirect("/acces-refuse");
}
