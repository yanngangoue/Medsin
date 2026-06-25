import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { staffEmailDomain } from "@/lib/admin/staff-email";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isDemoMode } from "@/lib/is-demo-mode";
import { demoCreateUser, demoUserExists } from "@/lib/demo-store";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send-email";
import { resetLoginRateLimitForKey } from "@/lib/login-rate-limit";
import { checkApiRateLimit } from "@/lib/api-rate-limit";

/** Escape HTML special characters to prevent HTML injection in email bodies. */
function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function clientIp(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

const schema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  return catchRouteError("auth/inscription/POST", async () => {
    if (!checkApiRateLimit("inscription", clientIp(req) ?? "unknown", 10)) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans 15 minutes.", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: "Corps de requête invalide", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      const email = parsed.data.email.trim().toLowerCase();
      const staffDomain = staffEmailDomain();

      if (email.endsWith(`@${staffDomain}`)) {
        return NextResponse.json(
          {
            error:
              "Les courriels professionnels Anne-sante sont réservés à l'équipe. Utilisez votre courriel personnel ou contactez l'administrateur.",
            code: "FORBIDDEN",
          },
          { status: 403 },
        );
      }
    
      try {
      if (isDemoMode()) {
        if (demoUserExists(email)) {
          return NextResponse.json({ error: "Courriel déjà utilisé", code: "CONFLICT" }, { status: 409 });
        }
        const hash = await bcrypt.hash(parsed.data.password, 12);
        const user = demoCreateUser({
          prenom: parsed.data.prenom,
          email,
          passwordHash: hash,
        });
        resetLoginRateLimitForKey(`${clientIp(req) ?? "unknown"}:${email}`);
        return NextResponse.json({ id: user.id, prenom: user.prenom }, { status: 201 });
      }
    
      const exists = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });
      if (exists) {
        return NextResponse.json({ error: "Courriel déjà utilisé", code: "CONFLICT" }, { status: 409 });
      }
    
      const prenom = parsed.data.prenom.trim();
      const nom = (parsed.data.nom?.trim() || prenom).trim();
      const hash = await bcrypt.hash(parsed.data.password, 12);
      const user = await prisma.user.create({
        data: {
          prenom,
          name: `${prenom} ${nom}`,
          email,
          passwordHash: hash,
          emailVerified: new Date(),
        },
      });
      await writeAuditLog({
        userId: user.id,
        action: "register",
        entity: "credentials",
        ipAddress: clientIp(req),
      });

      const baseUrl =
        process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
        "http://localhost:3001";

      await sendEmail({
        to: user.email,
        subject: "Bienvenue chez Anne-sante",
        template: "patient_registration",
        entityKey: `patient_registration:${user.id}`,
        userId: user.id,
        html: `<p>Bonjour ${escHtml(user.prenom ?? "")},</p>
<p>Bienvenue chez Anne-sante ! Votre compte a été créé avec succès.</p>
<p>Prochaine étape : complétez votre questionnaire médical gratuit (environ 5 minutes) pour qu'une IPS examine votre dossier.</p>
<p><a href="${baseUrl}/questionnaire" style="display:inline-block;background:#1D4D3A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Compléter mon questionnaire</a></p>`,
        text: `Bonjour ${user.prenom}, bienvenue chez Anne-sante. Questionnaire : ${baseUrl}/questionnaire`,
      });

      resetLoginRateLimitForKey(`${clientIp(req) ?? "unknown"}:${email}`);
      return NextResponse.json({ id: user.id, prenom: user.prenom }, { status: 201 });
      } catch (e) {
        // Handle race-condition duplicate (unique constraint violation)
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          return NextResponse.json({ error: "Courriel déjà utilisé", code: "CONFLICT" }, { status: 409 });
        }
        console.error("[inscription]", e);
        return NextResponse.json(
          { error: "Impossible de créer le compte. Réessayez ou contactez le support.", code: "INTERNAL_ERROR" },
          { status: 500 },
        );
      }
  });
}
