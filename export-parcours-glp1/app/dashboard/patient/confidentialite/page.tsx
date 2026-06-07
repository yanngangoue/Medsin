import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { PatientPrivacyPanel } from "@/components/patient/PatientPrivacyPanel";
import { PatientDashboardPageShell } from "@/components/dashboard/patient-space/PatientDashboardPageShell";

export default async function PatientConfidentialitePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/connexion?callbackUrl=/dashboard/patient/confidentialite");
  }

  return (
    <PatientDashboardPageShell
      eyebrow="Loi 25"
      title="Confidentialité et consentements"
      description="Gérez vos données personnelles et vos droits en vertu de la Loi 25."
    >
      <p className="text-sm text-[#6B7280]">
        <Link href="/confidentialite" className="font-semibold text-[#1D4D3A] hover:underline">
          Lire la politique complète →
        </Link>
      </p>
      <div className="mt-4">
        <PatientPrivacyPanel />
      </div>
    </PatientDashboardPageShell>
  );
}
