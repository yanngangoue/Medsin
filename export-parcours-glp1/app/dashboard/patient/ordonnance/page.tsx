import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OrderTrackingLive } from "@/components/patient/OrderTrackingLive";
import { PatientDashboardPageShell } from "@/components/dashboard/patient-space/PatientDashboardPageShell";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

export default async function PatientOrdonnancePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/connexion?callbackUrl=/dashboard/patient/ordonnance");
  }

  let fulfillmentId: string | null = null;

  if (!isDemoMode()) {
    const fulfillment = await prisma.medicationFulfillment.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    fulfillmentId = fulfillment?.id ?? null;
  } else {
    fulfillmentId = "demo";
  }

  return (
    <PatientDashboardPageShell
      eyebrow="Ma prescription"
      title="Suivi de livraison"
      description="Suivez en temps réel la préparation et l'expédition de votre médicament."
      maxWidth="2xl"
    >
      {fulfillmentId ? (
        <OrderTrackingLive fulfillmentId={fulfillmentId} />
      ) : (
        <p className="text-sm text-[#6B7280]">
          Aucune ordonnance en cours de livraison. Votre IPS vous avisera lorsque la prescription
          sera prête.
        </p>
      )}
    </PatientDashboardPageShell>
  );
}
