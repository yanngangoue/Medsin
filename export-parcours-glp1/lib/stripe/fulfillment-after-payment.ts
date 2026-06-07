import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send-email";
import { notifyFulfillmentStatusChange } from "@/lib/pharmacy/fulfillment-notify";
import { decryptPharmacyApiKey } from "@/lib/pharmacy/secrets";
import { createWeightProgram } from "@/lib/patient/weight-program";
import { prisma } from "@/lib/prisma";

export async function processFulfillmentPayment(
  fulfillmentId: string,
  stripeSessionId: string,
  stripePaymentIntentId?: string | null,
): Promise<void> {
  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillmentId },
    include: {
      user: true,
      questionnaire: true,
      pharmacy: true,
    },
  });

  if (!fulfillment || fulfillment.paymentStatus === "PAID") return;

  await prisma.medicationFulfillment.update({
    where: { id: fulfillmentId },
    data: {
      paymentStatus: "PAID",
      paidAt: new Date(),
      stripeSessionId,
      stripePaymentIntentId: stripePaymentIntentId ?? null,
      status: "SENT_TO_PHARMACY",
    },
  });

  await prisma.fulfillmentStatusHistory.create({
    data: {
      fulfillmentId,
      status: "SENT_TO_PHARMACY",
      note: "Paiement confirmé — envoi pharmacie",
    },
  });
  await notifyFulfillmentStatusChange(fulfillmentId, "SENT_TO_PHARMACY");

  const pharmacyKey = decryptPharmacyApiKey(fulfillment.pharmacy?.apiKey);

  if (fulfillment.pharmacy?.apiEndpoint) {
    try {
      await fetch(fulfillment.pharmacy.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(pharmacyKey ? { Authorization: `Bearer ${pharmacyKey}` } : {}),
        },
        body: JSON.stringify({
          fulfillmentId,
          medication: fulfillment.medication,
          dosage: fulfillment.dosage,
          patientId: fulfillment.userId,
        }),
      });
    } catch (e) {
      console.error("[pharmacy dispatch]", e);
    }
  }

  await prisma.medicationFulfillment.update({
    where: { id: fulfillmentId },
    data: { status: "IN_PREPARATION" },
  });

  await prisma.fulfillmentStatusHistory.create({
    data: { fulfillmentId, status: "IN_PREPARATION" },
  });
  await notifyFulfillmentStatusChange(fulfillmentId, "IN_PREPARATION");

  const q = fulfillment.questionnaire;
  let program = await prisma.weightProgram.findUnique({
    where: { userId: fulfillment.userId },
  });

  if (!program) {
    const created = await createWeightProgram(fulfillment.userId, {
      startWeight: q.weight,
      targetWeight: q.targetWeight,
      currentWeight: q.weight,
    });
    program = await prisma.weightProgram.findUnique({ where: { id: created.id } });
  }

  if (program) {
    const checkInDue = new Date();
    checkInDue.setDate(checkInDue.getDate() + 7);
    await prisma.weightCheckIn.create({
      data: {
        programId: program.id,
        userId: fulfillment.userId,
        weight: q.weight,
        status: "PENDING",
        recordedAt: checkInDue,
      },
    });
  }

  await sendEmail({
    to: fulfillment.user.email,
    subject: "Votre médicament est en préparation",
    template: "medication_preparing",
    entityKey: `medication_preparing:${fulfillmentId}`,
    userId: fulfillment.userId,
    html: `<p>Bonjour ${fulfillment.user.prenom},</p><p>Nous avons bien reçu votre paiement. Votre pharmacie partenaire prépare votre commande.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/patient/ordonnance">Suivre la livraison</a></p>`,
    text: `Bonjour ${fulfillment.user.prenom}, votre médicament est en préparation.`,
  });

  await writeAuditLog({
    userId: fulfillment.userId,
    action: "fulfillment_paid",
    entity: fulfillmentId,
  });
}
