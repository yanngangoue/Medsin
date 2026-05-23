import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NutriPlusConfirmationPanel } from "@/components/onboarding/NutriPlusConfirmationPanel";
import { NutriPlusFlowHeader } from "@/components/onboarding/NutriPlusFlowHeader";
import { NUTRI_PLUS_LANDING_PATH } from "@/lib/patient/nutri-plus-routes";

export default async function NutriPlusConfirmationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/connexion?callbackUrl=/onboarding/nutri-plus/confirmation`);
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F0EB]">
      <NutriPlusFlowHeader
        back={{ href: NUTRI_PLUS_LANDING_PATH, label: "Retour" }}
      />
      <NutriPlusConfirmationPanel />
    </div>
  );
}
