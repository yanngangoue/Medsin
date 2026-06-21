import type Stripe from "stripe";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send-email";
import { activateGlp1Membership, GLP1_MONTHLY_PRICE_CENTS } from "@/lib/membership/glp1-membership";
import { prisma } from "@/lib/prisma";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

function subscriptionIdFrom(
  value: string | Stripe.Subscription | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** Webhook — abonnement onboarding (avant questionnaire). */
export async function onboardingAfterPayment(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;

  const userId = session.metadata?.userId ?? session.client_reference_id;
  if (!userId) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const subscriptionId = subscriptionIdFrom(session.subscription);

  await activateGlp1Membership({
    userId,
    stripeSessionId: session.id,
    stripeSubscriptionId: subscriptionId,
    amountCents: GLP1_MONTHLY_PRICE_CENTS,
  });

  await sendEmail({
    to: user.email,
    subject: "Bienvenue chez Anne-sante — abonnement confirmé",
    template: "onboarding_payment_confirmed",
    entityKey: `onboarding_payment:${session.id}`,
    userId: user.id,
    html: `<p>Bonjour ${user.prenom},</p>
<p><strong>Votre abonnement Anne-sante GLP-1 est actif.</strong></p>
<p>Prochaine étape : compléter votre questionnaire médical (environ 5 minutes).</p>
<p><a href="${appUrl()}/questionnaire">Commencer le questionnaire</a></p>`,
    text: `Bonjour ${user.prenom}, abonnement confirmé. Questionnaire : ${appUrl()}/questionnaire`,
  });

  await prisma.appNotification.create({
    data: {
      userId: user.id,
      type: "onboarding_payment_confirmed",
      title: "Abonnement confirmé",
      body: "Complétez votre questionnaire médical pour lancer l'examen IPS.",
    },
  });

  await writeAuditLog({
    userId,
    action: "onboarding_subscription_paid",
    entity: session.id,
  });
}
