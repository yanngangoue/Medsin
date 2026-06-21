import type { FulfillmentStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email/send-email";
import { decryptPharmacyApiKey } from "@/lib/pharmacy/secrets";
import { pdfBase64FromDataUrl } from "@/lib/pharmacy/fulfillment-pdf";
import { resolveCarrierTrackingUrl, carrierLabelFromTracking } from "@/lib/pharmacy/tracking-url";
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
const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

export function formatPrescriptionNumber(fulfillmentId: string): string {
  return `MS-${fulfillmentId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

type PatientContact = {
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
};

function extractPatientContact(
  draftJson: unknown,
  user: { prenom: string; name: string | null; email: string },
): PatientContact {
  const prenom = user.prenom || "Patient";
  const nom = user.name?.trim() || prenom;

  let adresse = `À confirmer — ${user.email}`;
  let telephone = "Non renseigné";

  if (draftJson && typeof draftJson === "object") {
    const d = draftJson as Record<string, unknown>;
    const addrParts = [
      d.deliveryAddress,
      d.adresseLivraison,
      d.address,
      d.street,
      d.city,
      d.ville,
      d.province,
      d.postalCode,
      d.codePostal,
    ].filter((v) => typeof v === "string" && v.trim()) as string[];
    if (addrParts.length > 0) adresse = addrParts.join(", ");

    const phone =
      (typeof d.phone === "string" && d.phone) ||
      (typeof d.telephone === "string" && d.telephone) ||
      (typeof d.mobile === "string" && d.mobile);
    if (phone) telephone = phone;
  }

  return { nom, prenom, adresse, telephone };
}

function pdfAttachmentFromDataUrl(
  pdfUrl: string | null | undefined,
): { filename: string; content: string } | null {
  const content = pdfBase64FromDataUrl(pdfUrl);
  if (!content) return null;
  return { filename: "ordonnance-anne-sante.pdf", content };
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

  const trackingNumber = formatPrescriptionNumber(fulfillmentId);
  const patient = extractPatientContact(
    fulfillment.questionnaire.draftJson,
    fulfillment.user,
  );

  const ips = await prisma.user.findUnique({
    where: { id: fulfillment.ipsId },
    select: { prenom: true, name: true, medecinLicenseNumber: true },
  });

  const prescripteurNom = ips?.prenom ?? ips?.name ?? "IPS Anne-sante";
  const pdfBase64 = pdfBase64FromDataUrl(fulfillment.pdfUrl);

  if (fulfillment.pharmacy?.apiEndpoint) {
    try {
      const pharmacyKey = decryptPharmacyApiKey(fulfillment.pharmacy.apiKey);
      const res = await fetch(fulfillment.pharmacy.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(pharmacyKey ? { Authorization: `Bearer ${pharmacyKey}` } : {}),
        },
        body: JSON.stringify({
          orderId: fulfillmentId,
          patient: {
            nom: patient.nom,
            prenom: patient.prenom,
            adresse: patient.adresse,
            telephone: patient.telephone,
          },
          medication: {
            nom: fulfillment.medication,
            dose: fulfillment.dosage,
            quantite: 1,
          },
          prescripteur: {
            nom: prescripteurNom,
            numero_licence: ips?.medecinLicenseNumber ?? null,
          },
          pdfBase64: pdfBase64 ?? undefined,
          deliveryAddress: patient.adresse,
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
    subject: `Nouvelle ordonnance #${trackingNumber}`,
    html: `<h2>Nouvelle ordonnance Anne-sante — #${trackingNumber}</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
<tr><td style="padding:4px 12px 4px 0;font-weight:bold">Patient</td><td>${patient.prenom} ${patient.nom}</td></tr>
<tr><td style="padding:4px 12px 4px 0;font-weight:bold">Téléphone</td><td>${patient.telephone}</td></tr>
<tr><td style="padding:4px 12px 4px 0;font-weight:bold">Adresse livraison</td><td>${patient.adresse}</td></tr>
<tr><td style="padding:4px 12px 4px 0;font-weight:bold">Médicament</td><td>${fulfillment.medication}</td></tr>
<tr><td style="padding:4px 12px 4px 0;font-weight:bold">Dose</td><td>${fulfillment.dosage}</td></tr>
<tr><td style="padding:4px 12px 4px 0;font-weight:bold">Prescripteur</td><td>${prescripteurNom}${ips?.medecinLicenseNumber ? ` (${ips.medecinLicenseNumber})` : ""}</td></tr>
</table>
<p>Ordonnance PDF en pièce jointe${attachment ? "" : " (non disponible)"}.</p>`,
    text: `Ordonnance #${trackingNumber} — ${patient.prenom} ${patient.nom} — ${fulfillment.medication} ${fulfillment.dosage} — ${patient.adresse}`,
    attachments: attachment ? [attachment] : undefined,
  });

  return false;
}

/** Notification patient — ordonnance transmise à la pharmacie. */
export async function notifyPharmacyDispatched(fulfillmentId: string): Promise<void> {
  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillmentId },
    include: {
      user: { select: { id: true, email: true, prenom: true } },
      pharmacy: { select: { name: true } },
    },
  });

  if (!fulfillment) return;

  const pharmacyName = fulfillment.pharmacy?.name ?? "notre pharmacie partenaire";

  await prisma.appNotification.create({
    data: {
      userId: fulfillment.userId,
      type: "fulfillment_sent_to_pharmacy",
      title: "Ordonnance envoyée à la pharmacie 💊",
      body: `Votre ordonnance a été transmise à ${pharmacyName}. Votre médicament est en cours de préparation.`,
    },
  });
}

/** Email patient — médicament en préparation + date estimée. */
export async function notifyPatientPreparationEmail(
  fulfillmentId: string,
  estimatedDelivery: Date,
): Promise<void> {
  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillmentId },
    include: { user: { select: { email: true, prenom: true } } },
  });

  if (!fulfillment) return;

  const eta = estimatedDelivery.toLocaleDateString("fr-CA", { dateStyle: "long" });
  const ordonnanceUrl = `${appUrl()}/dashboard/patient/ordonnance`;

  await sendEmail({
    to: fulfillment.user.email,
    template: "fulfillment_preparation",
    entityKey: `fulfillment_preparation:${fulfillmentId}`,
    userId: fulfillment.userId,
    subject: "Votre médicament est en préparation — Anne-sante",
    html: `<p>Bonjour ${fulfillment.user.prenom},</p>
<p><strong>Votre médicament est en préparation.</strong></p>
<p>Livraison estimée : <strong>${eta}</strong></p>
<p><a href="${ordonnanceUrl}">Suivre ma livraison</a></p>`,
    text: `Bonjour ${fulfillment.user.prenom}, votre médicament est en préparation. Livraison estimée : ${eta}. Suivi : ${ordonnanceUrl}`,
  });
}

export async function notifyFulfillmentStatusChange(
  fulfillmentId: string,
  newStatus: FulfillmentStatus,
): Promise<void> {
  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillmentId },
    include: {
      user: { select: { id: true, email: true, prenom: true } },
      pharmacy: { select: { name: true } },
    },
  });

  if (!fulfillment) return;

  const label = STATUS_LABELS[newStatus];
  const trackingUrl = resolveCarrierTrackingUrl(
    fulfillment.trackingNumber,
    fulfillment.trackingUrl,
  );
  const carrier = carrierLabelFromTracking(fulfillment.trackingNumber);

  let details = `Nouveau statut : ${label}.`;
  if (newStatus === "SHIPPED" && fulfillment.trackingNumber) {
    details += ` Numéro de suivi : ${fulfillment.trackingNumber}.`;
  }
  if (newStatus === "DELIVERED") {
    details += " Signature requise à la réception.";
  }

  await prisma.appNotification.create({
    data: {
      userId: fulfillment.userId,
      type: `fulfillment_${newStatus.toLowerCase()}`,
      title: `Livraison — ${label}`,
      body: details,
    },
  });

  const ordonnanceUrl = `${appUrl()}/dashboard/patient/ordonnance`;

  await sendEmail({
    to: fulfillment.user.email,
    template: "fulfillment_status",
    entityKey: `fulfillment_status:${fulfillmentId}:${newStatus}`,
    userId: fulfillment.userId,
    subject: "Mise à jour de votre livraison Anne-sante",
    html: `<p>Bonjour ${fulfillment.user.prenom},</p>
<p><strong>Mise à jour de votre livraison Anne-sante</strong></p>
<p>${details}</p>
${trackingUrl ? `<p><a href="${trackingUrl}">Suivre sur ${carrier} →</a></p>` : ""}
<p><a href="${ordonnanceUrl}">Voir le détail de ma commande</a></p>`,
    text: `${details}${trackingUrl ? ` Suivi : ${trackingUrl}` : ""}`,
  });
}
