import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isDemoMode } from "@/lib/is-demo-mode";
import { demoCreateUser, demoUserExists } from "@/lib/demo-store";

const schema = z.object({
  prenom: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  if (isDemoMode()) {
    if (demoUserExists(parsed.data.email)) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }
    const hash = await bcrypt.hash(parsed.data.password, 12);
    const user = demoCreateUser({
      prenom: parsed.data.prenom,
      email: parsed.data.email,
      passwordHash: hash,
    });
    return NextResponse.json({ id: user.id, prenom: user.prenom }, { status: 201 });
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) {
    return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
  }

  const hash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: { prenom: parsed.data.prenom, email: parsed.data.email, password: hash },
  });
  return NextResponse.json({ id: user.id, prenom: user.prenom }, { status: 201 });
}
