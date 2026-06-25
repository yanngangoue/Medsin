import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PaiementCheckout } from "@/components/onboarding/PaiementCheckout";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ fulfillment?: string; paid?: string; cancelled?: string }>;

export default async function PaiementPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const session = await auth();
  const params = searchParams ? await searchParams : {};

  const callbackUrl = new URLSearchParams();
  if (params.fulfillment) callbackUrl.set("fulfillment", params.fulfillment);
  if (params.paid) callbackUrl.set("paid", params.paid);
  if (params.cancelled) callbackUrl.set("cancelled", params.cancelled);
  const qs = callbackUrl.toString();

  if (!session?.user?.id) {
    redirect(`/connexion?callbackUrl=${encodeURIComponent(`/paiement${qs ? `?${qs}` : ""}`)}`);
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

  if (!params.fulfillment && !params.paid) {
    redirect("/dashboard/patient");
  }

  if (params.fulfillment && !params.paid) {
    const fulfillment = await prisma.medicationFulfillment.findFirst({
      where: { id: params.fulfillment, userId: session.user.id },
      include: { questionnaire: { select: { status: true } } },
    });

    if (!fulfillment) {
      redirect("/dashboard/patient");
    }

    const approved =
      fulfillment.questionnaire.status === "APPROVED" ||
      fulfillment.questionnaire.status === "PRESCRIPTION_ISSUED";

    if (!approved) {
      redirect("/dashboard/patient");
    }
  }

  return (
    <Suspense
      fallback={<p className="py-16 text-center text-sm text-slate-500">Chargement…</p>}
    >
      <PaiementCheckout />
    </Suspense>
  );
}
