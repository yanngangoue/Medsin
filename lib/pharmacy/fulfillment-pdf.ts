import { generatePrescriptionPdf } from "@/lib/pdf-generator";
import { prisma } from "@/lib/prisma";

/** Génère et persiste le PDF d'ordonnance si absent. */
export async function ensureFulfillmentPdf(fulfillmentId: string): Promise<string | null> {
  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillmentId },
    include: {
      user: { select: { prenom: true, name: true } },
    },
  });

  if (!fulfillment) return null;
  if (fulfillment.pdfUrl?.startsWith("data:application/pdf;base64,")) {
    return fulfillment.pdfUrl;
  }

  const ips = await prisma.user.findUnique({
    where: { id: fulfillment.ipsId },
    select: { prenom: true, name: true, medecinLicenseNumber: true },
  });

  const issuedAt = fulfillment.pdfGeneratedAt ?? fulfillment.createdAt;
  const pdfBuffer = generatePrescriptionPdf({
    patientName: fulfillment.user.prenom || fulfillment.user.name || "Patient",
    medication: fulfillment.medication,
    dosage: fulfillment.dosage,
    durationMonths: fulfillment.duration,
    refills: fulfillment.refills,
    instructions: fulfillment.instructions,
    ipsName: ips?.prenom ?? ips?.name ?? "IPS MedSim",
    ipsLicense: ips?.medecinLicenseNumber ?? undefined,
    issuedAt,
  });

  const pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

  await prisma.medicationFulfillment.update({
    where: { id: fulfillmentId },
    data: { pdfUrl, pdfGeneratedAt: issuedAt },
  });

  return pdfUrl;
}

export function pdfBase64FromDataUrl(pdfUrl: string | null | undefined): string | null {
  if (!pdfUrl?.startsWith("data:application/pdf;base64,")) return null;
  return pdfUrl.slice("data:application/pdf;base64,".length) || null;
}

export function estimatedDeliveryDate(from = new Date(), days = 3): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}
