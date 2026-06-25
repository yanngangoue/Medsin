import type Stripe from "stripe";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send-email";
import { activateGlp1Membership, GLP1_MONTHLY_PRICE_CENTS } from "@/lib/membership/glp1-membership";
import { createWeightProgram } from "@/lib/patient/weight-program";
import {
  dispatchFulfillmentToPharmacy,
  notifyPharmacyDispatched,
} from "@/lib/pharmacy/fulfillment-notify";
import {
  ensureFulfillmentPdf,
  estimatedDeliveryDate,
} from "@/lib/pharmacy/fulfillment-pdf";
import { prisma } from "@/lib/prisma";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

function subscriptionIdFrom(
  value: string | Stripe.Subscription | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function notifyAdminPharmacyPending(fulfillmentId: string, medication: string): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (admins.length === 0) {
    console.warn("[fulfillment] Aucun admin — commande pharmacie en attente:", fulfillmentId);
    return;
  }

  await prisma.appNotification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "pharmacy_dispatch_pending",
      title: "Commande pharmacie à traiter",
      body: `${medication} — fulfillment ${fulfillmentId}. Aucun endpoint pharmacie configuré.`,
    })),
  });
}

/** Point d'entrée webhook — session Stripe Checkout complétée. */
export async function fulfillmentAfterPayment(session: Stripe.Checkout.Session): Promise<void> {
  const prescriptionId =
    session.metadata?.prescriptionId ?? session.metadata?.fulfillmentId ?? null;

  if (!prescriptionId || session.payment_status !== "paid") return;

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const subscriptionId = subscriptionIdFrom(session.subscription);

  await processFulfillmentPayment(
    prescriptionId,
    session.id,
    paymentIntent,
    subscriptionId,
  );
}

/** Paiement initial GLP-1 confirmé (MedicationFulfillment). */
export async function processFulfillmentPayment(
  prescriptionId: string,
  stripeSessionId: string,
  stripePaymentIntentId?: string | null,
  stripeSubscriptionId?: string | null,
): Promise<void> {
  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: prescriptionId },
    include: {
      user: { include: { glp1Membership: true } },
      questionnaire: true,
      pharmacy: true,
    },
  });

  if (!fulfillment || fulfillment.paymentStatus === "PAID") return;

  const eta = estimatedDeliveryDate(new Date(), 3);

  await ensureFulfillmentPdf(prescriptionId);

  await prisma.medicationFulfillment.update({
    where: { id: prescriptionId },
    data: {
      paymentStatus: "PAID",
      paidAt: new Date(),
      stripeSessionId,
      stripePaymentIntentId: stripePaymentIntentId ?? null,
      status: "SENT_TO_PHARMACY",
      estimatedDelivery: eta,
    },
  });

  await prisma.fulfillmentStatusHistory.create({
    data: {
      fulfillmentId: prescriptionId,
      status: "SENT_TO_PHARMACY",
      note: "Paiement confirmé — envoi pharmacie",
    },
  });

  await notifyPharmacyDispatched(prescriptionId);

  const pharmacyNotified = await dispatchFulfillmentToPharmacy(prescriptionId);

  if (!pharmacyNotified) {
    await notifyAdminPharmacyPending(prescriptionId, fulfillment.medication);
  }

  await prisma.medicalQuestionnaire.update({
    where: { id: fulfillment.questionnaireId },
    data: { status: "PRESCRIPTION_ISSUED" },
  });

  const q = fulfillment.questionnaire;
  if (q && !fulfillment.user.glp1Membership) {
    await activateGlp1Membership({
      userId: fulfillment.userId,
      stripeSessionId,
      stripeSubscriptionId: stripeSubscriptionId ?? null,
      amountCents: GLP1_MONTHLY_PRICE_CENTS,
    });
  } else if (fulfillment.user.glp1Membership?.status !== "PAID") {
    await prisma.glp1Membership.upsert({
      where: { userId: fulfillment.userId },
      create: {
        userId: fulfillment.userId,
        status: "PAID",
        stripeSessionId,
        stripeSubscriptionId: stripeSubscriptionId ?? null,
        paidAt: new Date(),
        amountCents: GLP1_MONTHLY_PRICE_CENTS,
      },
      update: {
        status: "PAID",
        stripeSessionId,
        stripeSubscriptionId: stripeSubscriptionId ?? null,
        paidAt: new Date(),
      },
    });
  }

  let program = await prisma.weightProgram.findUnique({
    where: { userId: fulfillment.userId },
  });

  if (!program && q) {
    const created = await createWeightProgram(fulfillment.userId, {
      startWeight: q.weight,
      targetWeight: q.targetWeight,
      currentWeight: q.weight,
    });
    program = await prisma.weightProgram.findUnique({ where: { id: created.id } });
  }

  if (program) {
    await prisma.weightProgram.update({
      where: { id: program.id },
      data: {
        ...(stripeSubscriptionId ? { stripeSubId: stripeSubscriptionId } : {}),
        medication: fulfillment.medication,
        currentDose: fulfillment.dosage,
      },
    });

    const checkInDue = new Date();
    checkInDue.setDate(checkInDue.getDate() + 7);
    const existingCheckIn = await prisma.weightCheckIn.findFirst({
      where: { programId: program.id, status: "PENDING" },
    });
    if (!existingCheckIn) {
      await prisma.weightCheckIn.create({
        data: {
          programId: program.id,
          userId: fulfillment.userId,
          weight: q?.weight ?? 0,
          status: "PENDING",
          recordedAt: checkInDue,
        },
      });
    }
  }

  await sendEmail({
    to: fulfillment.user.email,
    subject: "Paiement reçu — votre médicament est en préparation",
    template: "payment_confirmed",
    entityKey: `payment_confirmed:${prescriptionId}`,
    userId: fulfillment.userId,
    html: `<p>Bonjour ${fulfillment.user.prenom},</p>
<p><strong>Votre paiement est confirmé.</strong></p>
<p>Votre ordonnance a été transmise à la pharmacie partenaire. Vous recevrez un courriel dès le début de la préparation.</p>
<p>Livraison estimée : <strong>${eta.toLocaleDateString("fr-CA", { dateStyle: "long" })}</strong></p>
<p><a href="${appUrl()}/dashboard/patient/ordonnance">Suivre ma livraison</a></p>`,
    text: `Bonjour ${fulfillment.user.prenom}, paiement confirmé. Ordonnance transmise à la pharmacie. Livraison estimée : ${eta.toLocaleDateString("fr-CA")}.`,
  });

  await prisma.appNotification.create({
    data: {
      userId: fulfillment.userId,
      type: "PAYMENT_CONFIRMED",
      title: "Paiement confirmé",
      body: "Votre ordonnance a été transmise à la pharmacie 💊. Préparation dès réception par la pharmacie.",
      sentByEmail: true,
    },
  });

  await writeAuditLog({
    userId: fulfillment.userId,
    action: "PAYMENT_CONFIRMED",
    entity: prescriptionId,
  });
}

/** Renouvellement mensuel Stripe (invoice.payment_succeeded, cycle). */
export async function handleSubscriptionRenewal(
  stripeSubscriptionId: string,
  stripeInvoiceId: string,
): Promise<void> {
  const program = await prisma.weightProgram.findFirst({
    where: { stripeSubId: stripeSubscriptionId, isActive: true },
    include: { user: true },
  });

  if (!program) return;

  await writeAuditLog({
    userId: program.userId,
    action: "subscription_renewed",
    entity: stripeInvoiceId,
  });

  await prisma.appNotification.create({
    data: {
      userId: program.userId,
      type: "subscription_renewed",
      title: "Abonnement renouvelé",
      body: "Votre abonnement mensuel Anne-sante a été renouvelé. Un récépissé vous a été envoyé par courriel.",
    },
  });

  await sendEmail({
    to: program.user.email,
    subject: "Récépissé — abonnement Anne-sante renouvelé",
    template: "subscription_renewed",
    entityKey: `subscription_renewed:${stripeInvoiceId}`,
    userId: program.userId,
    html: `<p>Bonjour ${program.user.prenom},</p>
<p>Votre renouvellement mensuel Anne-sante a bien été traité.</p>
<p>Facture Stripe : ${stripeInvoiceId}</p>
<p>Merci de votre confiance.</p>`,
    text: `Bonjour ${program.user.prenom}, votre abonnement Anne-sante a été renouvelé. Facture : ${stripeInvoiceId}`,
  });
}

/** Échec de paiement récurrent (invoice.payment_failed). */
export async function handlePaymentFailed(
  stripeSubscriptionId: string,
  stripeInvoiceId: string,
): Promise<void> {
  const program = await prisma.weightProgram.findFirst({
    where: { stripeSubId: stripeSubscriptionId },
    include: { user: true },
  });

  if (!program) return;

  const portalHint = `${appUrl()}/dashboard/patient`;

  await prisma.appNotification.create({
    data: {
      userId: program.userId,
      type: "payment_failed",
      title: "Échec de paiement",
      body: "Votre dernier prélèvement a échoué. Mettez à jour votre mode de paiement pour conserver votre programme.",
    },
  });

  await sendEmail({
    to: program.user.email,
    subject: "Échec de paiement — action requise",
    template: "payment_failed",
    entityKey: `payment_failed:${stripeInvoiceId}`,
    userId: program.userId,
    html: `<p>Bonjour ${program.user.prenom},</p>
<p>Le prélèvement de votre abonnement Anne-sante n'a pas pu être complété.</p>
<p>Mettez à jour votre carte bancaire dans votre espace client Stripe ou contactez-nous pour éviter une interruption de service.</p>
<p><a href="${portalHint}">Accéder à mon espace</a></p>`,
    text: `Bonjour ${program.user.prenom}, votre paiement Anne-sante a échoué. Mettez à jour votre mode de paiement : ${portalHint}`,
  });

  await writeAuditLog({
    userId: program.userId,
    action: "payment_failed",
    entity: stripeInvoiceId,
  });
}

/** Abonnement annulé (customer.subscription.deleted). */
export async function deactivateWeightProgramBySubscription(
  stripeSubscriptionId: string,
): Promise<void> {
  const program = await prisma.weightProgram.findFirst({
    where: { stripeSubId: stripeSubscriptionId },
    include: { user: true },
  });

  if (!program) return;

  await prisma.weightProgram.update({
    where: { id: program.id },
    data: {
      isActive: false,
      status: "CANCELLED",
    },
  });

  await prisma.appNotification.create({
    data: {
      userId: program.userId,
      type: "subscription_cancelled",
      title: "Abonnement terminé",
      body: "Votre abonnement Anne-sante a été désactivé. Contactez-nous pour toute question.",
    },
  });

  await sendEmail({
    to: program.user.email,
    subject: "Votre abonnement Anne-sante est terminé",
    template: "subscription_cancelled",
    entityKey: `subscription_cancelled:${stripeSubscriptionId}`,
    userId: program.userId,
    html: `<p>Bonjour ${program.user.prenom},</p>
<p>Votre abonnement Anne-sante a été annulé ou expiré. Votre programme de suivi est désactivé.</p>
<p>Pour toute question, répondez à ce courriel ou contactez votre IPS via Anne-sante.</p>`,
    text: `Bonjour ${program.user.prenom}, votre abonnement Anne-sante a été désactivé.`,
  });

  await writeAuditLog({
    userId: program.userId,
    action: "subscription_cancelled",
    entity: stripeSubscriptionId,
  });
}
