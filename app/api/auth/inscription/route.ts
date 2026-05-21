import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isDemoMode } from "@/lib/is-demo-mode";
import { demoCreateUser, demoUserExists } from "@/lib/demo-store";
import { writeAuditLog } from "@/lib/audit";
import { resetLoginRateLimitForKey } from "@/lib/login-rate-limit";
import { notifyWelcome } from "@/lib/email/notify";

function clientIp(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

const schema = z.object({
  prenom: z.string().trim().min(1).max(80),
  nom: z.string().trim().min(1).max(80),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/),
});

function formatFullName(prenom: string, nom: string): string {
  return `${prenom.trim()} ${nom.trim()}`.replace(/\s+/g, " ").trim();
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const fullName = formatFullName(parsed.data.prenom, parsed.data.nom);

  if (isDemoMode()) {
    if (demoUserExists(email)) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }
    const hash = await bcrypt.hash(parsed.data.password, 12);
    const user = demoCreateUser({
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
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

  try {
    const hash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        prenom: parsed.data.prenom,
        name: parsed.data.nom,
        email,
        passwordHash: hash,
        emailVerified: new Date(),
        role: "PATIENT",
        profile: {
          create: {
            fullName,
            eligibility: "PENDING",
          },
        },
      },
    });
    await writeAuditLog({
      userId: user.id,
      action: "register",
      entity: "credentials",
      ipAddress: clientIp(req),
    });
    resetLoginRateLimitForKey(`${clientIp(req) ?? "unknown"}:${email}`);
    void notifyWelcome({
      userId: user.id,
      email: user.email,
      prenom: user.prenom,
    });
    return NextResponse.json(
      { id: user.id, prenom: user.prenom, nom: user.name, fullName },
      { status: 201 },
    );
  } catch (e) {
    console.error("[inscription]", e);
    const message =
      process.env.NODE_ENV === "development"
        ? "Impossible d'enregistrer le compte (base de données). Vérifiez Supabase et redémarrez le serveur."
        : "Une erreur est survenue. Réessayez dans quelques instants.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
