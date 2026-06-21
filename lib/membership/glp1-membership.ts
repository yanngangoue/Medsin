import { prisma } from "@/lib/prisma";

export const GLP1_MONTHLY_PRICE_CENTS = 14999;

export async function getGlp1Membership(userId: string) {
  return prisma.glp1Membership.findUnique({ where: { userId } });
}

export async function hasActiveGlp1Membership(userId: string): Promise<boolean> {
  const m = await getGlp1Membership(userId);
  return m?.status === "PAID";
}

export async function activateGlp1Membership(input: {
  userId: string;
  stripeSessionId: string;
  stripeSubscriptionId?: string | null;
  amountCents?: number;
}) {
  return prisma.glp1Membership.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      status: "PAID",
      stripeSessionId: input.stripeSessionId,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      paidAt: new Date(),
      amountCents: input.amountCents ?? GLP1_MONTHLY_PRICE_CENTS,
    },
    update: {
      status: "PAID",
      stripeSessionId: input.stripeSessionId,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      paidAt: new Date(),
      amountCents: input.amountCents ?? GLP1_MONTHLY_PRICE_CENTS,
    },
  });
}
