import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env", "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[k]) process.env[k] = v;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

const evt = await stripe.events.retrieve("evt_1TkmixRrPKC2COnY8Bax0mVP");
console.log("pending_webhooks:", evt.pending_webhooks);
console.log("session:", evt.data.object.id);

const user = await prisma.user.findUnique({
  where: { email: "prod.pay.1782029569906@medsim.test" },
});
if (user) {
  const m = await prisma.glp1Membership.findUnique({ where: { userId: user.id } });
  console.log("Glp1Membership:", m);
}

await prisma.$disconnect();
