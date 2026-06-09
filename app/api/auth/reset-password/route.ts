import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { isDemoMode } from "@/lib/is-demo-mode";
import { demoConsumePasswordResetToken } from "@/lib/demo-password-reset";
import { demoUpdateUserPasswordHash, demoFindUserById } from "@/lib/demo-store";
import { hashPasswordResetToken } from "@/lib/password-reset-token";
import { resetPasswordSchema } from "@/lib/schemas/forgot-password";
import { catchRouteError } from "@/lib/api/catch-route-error";
import { writeAuditLog } from "@/lib/audit";

function clientIp(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

export async function POST(req: Request) {
  return catchRouteError("auth/reset-password", async () => {
  const ip = clientIp(req);
  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { token, password } = parsed.data;

  if (isDemoMode()) {
    const userId = demoConsumePasswordResetToken(token);
    if (!userId || !demoFindUserById(userId)) {
      return NextResponse.json({ error: "Lien invalide ou expiré.", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const hash = await hashPassword(password);
    demoUpdateUserPasswordHash(userId, hash);
    await writeAuditLog({
      userId,
      action: "password_reset_completed",
      entity: "demo",
      ipAddress: ip,
    });
    return NextResponse.json({ ok: true });
  }

  const tokenHash = hashPasswordResetToken(token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!row || row.expiresAt < new Date() || !row.user?.id) {
    if (row) await prisma.passwordResetToken.delete({ where: { id: row.id } }).catch(() => undefined);
    return NextResponse.json({ error: "Lien invalide ou expiré.", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const newHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash: newHash },
    }),
    prisma.passwordResetToken.delete({ where: { id: row.id } }),
  ]);

  await writeAuditLog({
    userId: row.userId,
    action: "password_reset_completed",
    entity: "credentials",
    ipAddress: ip,
  });

  return NextResponse.json({ ok: true });
  });
}
