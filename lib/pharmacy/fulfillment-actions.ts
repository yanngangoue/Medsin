import type { FulfillmentStatus } from "@prisma/client";
import { buildCoachWelcomeMessage } from "@/lib/patient/ai-coach";
import { createWeightProgram } from "@/lib/patient/weight-program";
import {
  notifyFulfillmentStatusChange,
  notifyPatientPreparationEmail,
} from "@/lib/pharmacy/fulfillment-notify";
import { estimatedDeliveryDate } from "@/lib/pharmacy/fulfillment-pdf";
import { prisma } from "@/lib/prisma";

export type PharmacyAction = "confirm_receipt" | "mark_shipped" | "confirm_delivery";

const TRANSITIONS: Record<
  PharmacyAction,
  { from: FulfillmentStatus[]; to: FulfillmentStatus }
> = {
  confirm_receipt: { from: ["ISSUED", "SENT_TO_PHARMACY"], to: "IN_PREPARATION" },
  mark_shipped: { from: ["IN_PREPARATION"], to: "SHIPPED" },
  confirm_delivery: { from: ["SHIPPED"], to: "DELIVERED" },
};

export async function applyPharmacyFulfillmentAction(
  fulfillmentId: string,
  action: PharmacyAction,
  opts?: { trackingNumber?: string; note?: string },
): Promise<{ ok: true; status: FulfillmentStatus } | { ok: false; error: string }> {
  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillmentId },
    include: {
      user: true,
      questionnaire: true,
      statusHistory: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!fulfillment) return { ok: false, error: "Introuvable" };

  const rule = TRANSITIONS[action];
  if (!rule.from.includes(fulfillment.status)) {
    return { ok: false, error: `Action impossible depuis le statut ${fulfillment.status}` };
  }

  if (action === "mark_shipped" && !opts?.trackingNumber?.trim()) {
    return { ok: false, error: "Numéro de suivi requis" };
  }

  const now = new Date();
  const updateData: {
    status: FulfillmentStatus;
    trackingNumber?: string;
    trackingUrl?: string | null;
    shippedAt?: Date;
    deliveredAt?: Date;
    estimatedDelivery?: Date;
  } = { status: rule.to };

  if (action === "mark_shipped" && opts?.trackingNumber) {
    updateData.trackingNumber = opts.trackingNumber.trim();
    updateData.shippedAt = now;
  }
  if (action === "confirm_delivery") {
    updateData.deliveredAt = now;
  }
  if (action === "confirm_receipt" && !fulfillment.estimatedDelivery) {
    updateData.estimatedDelivery = estimatedDeliveryDate(now, 3);
  }

  await prisma.medicationFulfillment.update({
    where: { id: fulfillmentId },
    data: updateData,
  });

  await prisma.fulfillmentStatusHistory.create({
    data: {
      fulfillmentId,
      status: rule.to,
      note: opts?.note ?? `Action pharmacie : ${action}`,
    },
  });

  if (action === "confirm_receipt" && updateData.estimatedDelivery) {
    await notifyPatientPreparationEmail(fulfillmentId, updateData.estimatedDelivery);
  }

  if (action === "mark_shipped" || action === "confirm_delivery") {
    await notifyFulfillmentStatusChange(fulfillmentId, rule.to);
  }

  if (action === "confirm_delivery") {
    await triggerCoachOnDelivery(fulfillmentId);
  }

  return { ok: true, status: rule.to };
}

/** Premier message proactif coach Anne — à la livraison confirmée. */
export async function triggerCoachOnDelivery(fulfillmentId: string): Promise<void> {
  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillmentId },
    include: { user: true, questionnaire: true },
  });
  if (!fulfillment) return;

  let program = await prisma.weightProgram.findUnique({
    where: { userId: fulfillment.userId },
    include: { aiMessages: { take: 1 } },
  });

  if (!program) {
    const q = fulfillment.questionnaire;
    const created = await createWeightProgram(fulfillment.userId, {
      startWeight: q.weight,
      targetWeight: q.targetWeight,
      currentWeight: q.weight,
    });
    program = await prisma.weightProgram.findUnique({
      where: { id: created.id },
      include: { aiMessages: { take: 1 } },
    });
  }

  if (!program) return;

  await prisma.weightProgram.update({
    where: { id: program.id },
    data: {
      isActive: true,
      status: "ACTIVE",
      medication: fulfillment.medication,
      currentDose: fulfillment.dosage,
    },
  });

  if (program.aiMessages.length > 0) return;

  await prisma.aiCoachMessage.create({
    data: {
      programId: program.id,
      userId: fulfillment.userId,
      role: "assistant",
      content: buildCoachWelcomeMessage(fulfillment.user.prenom),
      isProactive: true,
    },
  });

  await prisma.glp1Membership.upsert({
    where: { userId: fulfillment.userId },
    create: { userId: fulfillment.userId, status: "PENDING", coachActivatedAt: new Date() },
    update: { coachActivatedAt: new Date() },
  });

  const { sendEmail } = await import("@/lib/email/send-email");
  await sendEmail({
    to: fulfillment.user.email,
    subject: "Votre médicament est arrivé — Anne vous accompagne",
    template: "fulfillment_delivered_coach",
    entityKey: `coach_delivery:${fulfillmentId}`,
    userId: fulfillment.userId,
    html: `<p>Bonjour ${fulfillment.user.prenom},</p>
<p>Votre traitement GLP-1 est arrivé. Je suis Anne, votre coach IA — rendez-vous dans votre espace pour commencer ensemble.</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"}/dashboard/patient/coach-ia">Parler à Anne</a></p>`,
    text: `Bonjour ${fulfillment.user.prenom}, votre médicament est arrivé. Anne vous accompagne.`,
  });

  await prisma.appNotification.create({
    data: {
      userId: fulfillment.userId,
      type: "coach_welcome_delivery",
      title: "Anne vous écrit 💬",
      body: "Votre médicament est livré — votre coach IA démarre votre suivi personnalisé.",
    },
  });
}
