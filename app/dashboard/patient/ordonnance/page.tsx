import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PatientOrdonnanceView } from "@/components/dashboard/patient-space/PatientOrdonnanceView";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

export default async function PatientOrdonnancePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/connexion?callbackUrl=/dashboard/patient/ordonnance");
  }

  const prenom = session.user.prenom ?? session.user.name ?? "";

  let fulfillmentId: string | null = null;

  if (isDemoMode()) {
    fulfillmentId = "demo";
  } else {
    const fulfillment = await prisma.medicationFulfillment.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, paymentStatus: true },
    });

    if (fulfillment?.paymentStatus === "PENDING") {
      redirect(`/paiement?fulfillment=${fulfillment.id}`);
    }

    fulfillmentId = fulfillment?.id ?? null;
  }

  return <PatientOrdonnanceView prenom={prenom} fulfillmentId={fulfillmentId} />;
}
