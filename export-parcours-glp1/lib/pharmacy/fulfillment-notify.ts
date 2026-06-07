import type { FulfillmentStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email/send-email";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<FulfillmentStatus, string> = {
  ISSUED: "Ordonnance émise",
  SENT_TO_PHARMACY: "Envoyée à la pharmacie",
  IN_PREPARATION: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export async function notifyFulfillmentStatusChange(
  fulfillmentId: string,
  newStatus: FulfillmentStatus,
): Promise<void> {
  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillmentId },
    include: { user: { select: { id: true, email: true, prenom: true } } },
  });

  if (!fulfillment) return;

  const label = STATUS_LABELS[newStatus];
  const tracking =
    newStatus === "SHIPPED" && fulfillment.trackingUrl
      ? ` Suivi : ${fulfillment.trackingUrl}`
      : "";

  await prisma.appNotification.create({
    data: {
      userId: fulfillment.userId,
      type: `fulfillment_${newStatus.toLowerCase()}`,
      title: `Livraison — ${label}`,
      body: `Votre commande est maintenant : ${label}.${tracking}`,
    },
  });

  await sendEmail({
    to: fulfillment.user.email,
    template: "fulfillment_status",
    entityKey: `fulfillment_status:${fulfillmentId}:${newStatus}`,
    userId: fulfillment.userId,
    subject: `MedSim — ${label}`,
    html: `<p>Bonjour ${fulfillment.user.prenom},</p><p>Statut de livraison : <strong>${label}</strong>.${tracking ? `<p><a href="${fulfillment.trackingUrl}">Suivre le colis</a></p>` : ""}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/patient/ordonnance">Voir le détail</a></p>`,
    text: `Statut livraison : ${label}${tracking}`,
  });
}
