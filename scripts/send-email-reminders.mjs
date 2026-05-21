/**
 * Déclenche les rappels e-mail RDV (24 h / 15 min).
 * Usage : node scripts/send-email-reminders.mjs
 * Prérequis : serveur Next sur NEXTAUTH_URL, MEDSIM_CRON_SECRET dans .env
 */
const base = (process.env.NEXTAUTH_URL || "http://localhost:3001").replace(/\/$/, "");
const secret = process.env.MEDSIM_CRON_SECRET || "dev-cron-local";

const res = await fetch(`${base}/api/cron/email-reminders`, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
});

const text = await res.text();
console.log(res.status, text);
