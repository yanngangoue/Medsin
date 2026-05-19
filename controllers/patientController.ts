import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";
import { computeBmi, simulateGlp1Eligibility } from "@/lib/eligibility";
import { onboardingSchema } from "@/lib/validations";

export async function saveOnboarding(body: unknown) {
  const session = await getSessionPayload();
  if (!session?.sub) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { age, weightKg, heightCm, medicalHistory } = parsed.data;
  const bmi = computeBmi(weightKg, heightCm);
  const { status: eligibility } = simulateGlp1Eligibility({
    age,
    bmi,
    medicalHistory,
  });

  const profile = await prisma.patientProfile.upsert({
    where: { userId: session.sub },
    create: {
      userId: session.sub,
      age,
      weightKg,
      heightCm,
      bmi,
      medicalHistory,
      eligibility,
      onboardingDone: true,
    },
    update: {
      age,
      weightKg,
      heightCm,
      bmi,
      medicalHistory,
      eligibility,
      onboardingDone: true,
    },
  });

  return NextResponse.json({ profile });
}

export async function getMe() {
  const session = await getSessionPayload();
  if (!session?.sub) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { profile: true, appointments: { orderBy: { scheduledAt: "asc" }, take: 20 } },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const { passwordHash: _ph, ...safeUser } = user;
  void _ph;
  return NextResponse.json({ user: safeUser });
}
