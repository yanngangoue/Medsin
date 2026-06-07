import type { FulfillmentStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email/send-email";
import { decryptPharmacyApiKey } from "@/lib/pharmacy/secrets";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<FulfillmentStatus, string> = {
  ISSUED: "Ordonnance émise",
  SENT_TO_PHARMACY: "Envoyée à la pharmacie",
  IN_PREPARATION: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const PHARMACY_INBOX = "pharmacy@medsim.ca";

function formatPrescriptionNumber(fulfillmentId: string): string {
  return `MS-${fulfillmentId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function extractDeliveryAddress(draftJson: unknown, userEmail: string): string {
  if (draftJson && typeof draftJson === "object") {
    const d = draftJson as Record<string, unknown>;
    const parts = [
      d.deliveryAddress,
      d.adresseLivraison,
      d.address,
      d.street,
      d.city,
      d.ville,
      d.province,
      d.postalCode,
      d.codePostal,
    ].filter((v) => typeof v === "string" && v.trim());
    if (parts.length > 0) return parts.join(", ");
  }
  return `À confirmer — contacter le patient : ${userEmail}`;
}

function pdfAttachmentFromDataUrl(pdfUrl: string | null | undefined): { filename: string; content: string } | null {
  if (!pdfUrl?.startsWith("data:application/pdf;base64,")) return null;
  const content = pdfUrl.slice("data:application/pdf;base64,".length);
  if (!content) return null;
  return { filename: "ordonnance-medsim.pdf", content };
}

/** Envoie l'ordonnance à la pharmacie partenaire (API ou courriel MVP). */
export async function dispatchFulfillmentToPharmacy(fulfillmentId: string): Promise<boolean> {
  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillmentId },
    include: {
      user: { select: { prenom: true, name: true, email: true } },
      questionnaire: { select: { draftJson: true } },
      pharmacy: true,
    },
  });

  if (!fulfillment) return false;

  const pharmacyKey = decryptPharmacyApiKey(fulfillment.pharmacy?.apiKey);
  const orderNumber = formatPrescriptionNumber(fulfillmentId);
  const patientName = fulfillment.user.prenom || fulfillment.user.name || "Patient";
  const deliveryAddress = extractDeliveryAddress(
    fulfillment.questionnaire.draftJson,
    fulfillment.user.email,
  );

  if (fulfillment.pharmacy?.apiEndpoint) {
    try {
      const res = await fetch(fulfillment.pharmacy.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(pharmacyKey ? { Authorization: `Bearer ${pharmacyKey}` } : {}),
        },
        body: JSON.stringify({
          fulfillmentId,
          orderNumber,
          medication: fulfillment.medication,
          dosage: fulfillment.dosage,
          patientId: fulfillment.userId,
          patientName,
          deliveryAddress,
        }),
      });
      if (res.ok) return true;
    } catch (e) {
      console.error("[pharmacy dispatch API]", e);
    }
  }

  const attachment = pdfAttachmentFromDataUrl(fulfillment.pdfUrl);
  const pharmacyTo = fulfillment.pharmacy?.email?.trim() || PHARMACY_INBOX;

  await sendEmail({
    to: pharmacyTo,
    template: "pharmacy_fulfillment_order",
    entityKey: `pharmacy_order:${fulfillmentId}`,
    subject: `MedSim — Commande ${orderNumber} — ${fulfillment.medication}`,
    html: `<h2>Nouvelle commande MedSim</h2>
<ul>
<li><strong>Numéro de commande :</strong> ${orderNumber}</li>
<li><strong>Patient :</strong> ${patientName}</li>
<li><strong>Adresse de livraison :</strong> ${deliveryAddress}</li>
<li><strong>Médicament :</strong> ${fulfillment.medication}</li>
<li><strong>Dose :</strong> ${fulfillment.dosage}</li>
</ul>
<p>Ordonnance PDF en pièce jointe${attachment ? "" : " (non disponible — générer depuis l'admin)"}.</p>
<p>Mettre à jour le numéro de suivi depuis le tableau de bord admin après expédition.</p>`,
    text: `Commande ${orderNumber} — ${patientName} — ${fulfillment.medication} ${fulfillment.dosage} — Livraison : ${deliveryAddress}`,
    attachments: attachment ? [attachment] : undefined,
  });

  return false;
}

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
