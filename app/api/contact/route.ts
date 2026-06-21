import { NextResponse } from "next/server";
import { catchRouteError } from "@/lib/api/catch-route-error";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send-email";
import { APP_BRAND } from "@/lib/brand/app-brand";
import { checkApiRateLimit, clientIp } from "@/lib/api-rate-limit";

const schema = z.object({
  prenom: z.string().min(1).max(100).trim(),
  nom: z.string().min(1).max(100).trim(),
  email: z.string().email(),
  sujet: z.string().min(1).max(200).trim(),
  message: z.string().min(10).max(5000).trim(),
});

export async function POST(req: Request) {
  return catchRouteError("contact/POST", async () => {
    if (!checkApiRateLimit("contact", clientIp(req), 5)) {
      return NextResponse.json(
        { error: "Trop de demandes. Réessayez dans 15 minutes." },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", issues: parsed.error.issues }, { status: 400 });
    }

    const { prenom, nom, email, sujet, message } = parsed.data;
    const adminEmail = process.env.MEDSIM_ADMIN_EMAIL?.trim() ?? APP_BRAND.supportEmail;

    await sendEmail({
      to: adminEmail,
      subject: `[Anne-sante Contact] ${sujet}`,
      template: "contact",
      entityKey: null,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#0D7A5F">Nouveau message de contact — Anne-sante</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#64748B;font-size:13px">Nom</td><td style="font-size:13px">${prenom} ${nom}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B;font-size:13px">Courriel</td><td style="font-size:13px">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B;font-size:13px">Sujet</td><td style="font-size:13px">${sujet}</td></tr>
          </table>
          <hr style="margin:16px 0;border-color:#E2E8F0" />
          <p style="font-size:14px;line-height:1.6;color:#1E293B">${message.replace(/\n/g, "<br />")}</p>
          <hr style="margin:16px 0;border-color:#E2E8F0" />
          <p style="font-size:11px;color:#94A3B8">Anne-sante · Formulaire de contact</p>
        </div>
      `,
      text: `Nouveau message de contact Anne-sante\n\nNom : ${prenom} ${nom}\nCourriel : ${email}\nSujet : ${sujet}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  });
}
