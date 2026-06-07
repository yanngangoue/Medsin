import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isDemoMode } from "@/lib/is-demo-mode";
import { demoCreateUser, demoUserExists } from "@/lib/demo-store";
import { writeAuditLog } from "@/lib/audit";
import { resetLoginRateLimitForKey } from "@/lib/login-rate-limit";

function clientIp(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

const schema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
  if (isDemoMode()) {
    if (demoUserExists(email)) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
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
    return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
  }

  const prenom = parsed.data.prenom.trim();
  const nom = parsed.data.nom.trim();
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
  resetLoginRateLimitForKey(`${clientIp(req) ?? "unknown"}:${email}`);
  return NextResponse.json({ id: user.id, prenom: user.prenom }, { status: 201 });
  } catch (e) {
    console.error("[inscription]", e);
    return NextResponse.json(
      { error: "Impossible de créer le compte. Réessayez ou contactez le support." },
      { status: 500 },
    );
  }
}
