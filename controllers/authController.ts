import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearAuthCookie, setAuthCookie, signToken } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";

export async function registerUser(body: unknown) {
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
      password: passwordHash,
      prenom: email.split("@")[0] || "Patient",
    },
  });
  const token = await signToken(user);
  await setAuthCookie(token);
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}

export async function loginUser(body: unknown) {
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }
  const token = await signToken(user);
  await setAuthCookie(token);
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}

export async function logoutUser() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}
