import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

export type EmailAttachment = {
  filename: string;
  content: string;
};

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  template: string;
  userId?: string | null;
  /** Clé unique pour éviter les doublons (ex. appointment:uuid:reminder_24h). */
  entityKey?: string | null;
  attachments?: EmailAttachment[];
};

export type SendEmailResult = { ok: boolean; skipped?: boolean; error?: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (isDemoMode()) {
    console.info("[Medsim email demo]", input.template, "→", input.to, input.subject);
    return { ok: true, skipped: true };
  }

  if (input.entityKey) {
    const existing = await prisma.emailLog.findUnique({
      where: {
        template_entityKey: { template: input.template, entityKey: input.entityKey },
      },
    });
    if (existing?.status === "sent") {
      return { ok: true, skipped: true };
    }
  }

  const from = process.env.MEDSIM_EMAIL_FROM?.trim() || "MedSim <onboarding@resend.dev>";
  const apiKey = process.env.RESEND_API_KEY?.trim();

  let status: "sent" | "skipped" | "failed" = "skipped";
  let error: string | null = null;

  if (!apiKey) {
    console.info("[Medsim email]", input.template, "→", input.to);
    console.info("  Sujet:", input.subject);
    console.info("  (Configurer RESEND_API_KEY pour envoi réel)");
    status = "skipped";
  } else {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
          text: input.text,
          ...(input.attachments?.length ? { attachments: input.attachments } : {}),
        }),
      });
      if (!res.ok) {
        const raw = await res.text();
        throw new Error(`Resend ${res.status}: ${raw}`);
      }
      status = "sent";
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : "send failed";
      console.error("[Medsim email]", input.template, error);
    }
  }

  try {
    const logData = {
      userId: input.userId ?? null,
      toEmail: input.to,
      template: input.template,
      entityKey: input.entityKey ?? null,
      subject: input.subject,
      status,
      error,
    };
    if (input.entityKey) {
      await prisma.emailLog.upsert({
        where: {
          template_entityKey: { template: input.template, entityKey: input.entityKey },
        },
        create: logData,
        update: { status, error, subject: input.subject },
      });
    } else {
      await prisma.emailLog.create({ data: logData });
    }
  } catch (logErr) {
    console.error("[Medsim email] log failed", logErr);
  }

  return status === "failed" ? { ok: false, error: error ?? undefined } : { ok: true, skipped: status === "skipped" };
}
