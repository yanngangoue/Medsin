import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearAuthCookie, setAuthCookie, signToken } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";
import { checkLoginRateLimit } from "@/lib/login-rate-limit";
import { writeAuditLog } from "@/lib/audit";

export type AuthRequestMeta = { ip?: string | null };

export async function registerUser(body: unknown, meta?: AuthRequestMeta) {
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      prenom: email.split("@")[0] || "Patient",
      name: email.split("@")[0] || "Patient",
      emailVerified: new Date(),
    },
  });
  const token = await signToken(user);
  await setAuthCookie(token);
  await writeAuditLog({
    userId: user.id,
    action: "register_api",
    entity: "jwt_cookie",
    ipAddress: meta?.ip ?? null,
  });
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}

export async function loginUser(body: unknown, meta?: AuthRequestMeta) {
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const rateKey = `${meta?.ip ?? "unknown"}:${email.toLowerCase()}`;
  if (!checkLoginRateLimit(rateKey)) {
    await writeAuditLog({ userId: null, action: "login_api_rate_limited", entity: email, ipAddress: meta?.ip ?? null });
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }
  const token = await signToken(user);
  await setAuthCookie(token);
  await writeAuditLog({
    userId: user.id,
    action: "login_api",
    entity: "jwt_cookie",
    ipAddress: meta?.ip ?? null,
  });
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}

export async function logoutUser() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}
