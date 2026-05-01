import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../lib/password";
import { signToken } from "../../lib/auth";
import { loginSchema, registerSchema } from "../../lib/validations";

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email déjà utilisé" });
    return;
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
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email },
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    res.status(401).json({ error: "Identifiants incorrects" });
    return;
  }
  const token = await signToken(user);
  res.json({
    token,
    user: { id: user.id, email: user.email },
  });
}
