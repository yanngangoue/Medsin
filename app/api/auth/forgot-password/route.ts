import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";
import { demoFindUserByEmail } from "@/lib/demo-store";
import { demoCreatePasswordResetToken } from "@/lib/demo-password-reset";
import { hashPasswordResetToken } from "@/lib/password-reset-token";
import { checkForgotPasswordRateLimit } from "@/lib/forgot-password-rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { catchRouteError } from "@/lib/api/catch-route-error";
import { forgotPasswordRequestSchema } from "@/lib/schemas/forgot-password";

function clientIp(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

function appBaseUrl(req: Request): string {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    new URL(req.url).origin
  );
}

const GENERIC_MSG =
  "Si un compte est associé à ce courriel, un lien de réinitialisation a été préparé. Vérifiez votre boîte de réception ou, en environnement de développement, la console du serveur.";

export async function POST(req: Request) {
  return catchRouteError("auth/forgot-password", async () => {
  const ip = clientIp(req) ?? "unknown";
  if (!checkForgotPasswordRateLimit(`forgot:${ip}`)) {
    return NextResponse.json({ ok: true, message: GENERIC_MSG });
  }

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Courriel invalide", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  let rawToken: string | undefined;
  let userFound = false;

  if (isDemoMode()) {
    const u = demoFindUserByEmail(email);
    if (u) {
      userFound = true;
      rawToken = demoCreatePasswordResetToken(u.id);
    }
  } else {
    const u = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (u?.passwordHash) {
      userFound = true;
      await prisma.passwordResetToken.deleteMany({ where: { userId: u.id } });
      const raw = randomBytes(32).toString("hex");
      const tokenHash = hashPasswordResetToken(raw);
      await prisma.passwordResetToken.create({
        data: {
          userId: u.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      rawToken = raw;
    }
  }

  if (userFound && rawToken) {
    const url = `${appBaseUrl(req)}/connexion/reinitialisation?token=${encodeURIComponent(rawToken)}`;
    await writeAuditLog({
      userId: null,
      action: "password_reset_requested",
      entity: email,
      ipAddress: ip,
    });
    if (process.env.NODE_ENV === "development") {
      console.info("[Anne-sante] Lien réinitialisation mot de passe (dev) :", url);
    }
  }

  const payload: { ok: true; message: string; devResetUrl?: string } = {
    ok: true,
    message: GENERIC_MSG,
  };

  if (process.env.NODE_ENV === "development" && process.env.MEDSIM_DEV_PASSWORD_RESET === "true" && userFound && rawToken) {
    payload.devResetUrl = `${appBaseUrl(req)}/connexion/reinitialisation?token=${encodeURIComponent(rawToken)}`;
  }

  return NextResponse.json(payload);
  });
}
