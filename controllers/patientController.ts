import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { computeBmi, simulateGlp1Eligibility } from "@/lib/eligibility";
import { getSessionUser } from "@/lib/session";
import { onboardingSchema } from "@/lib/validations";

export async function saveOnboarding(body: unknown) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "PATIENT") return forbidden();

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
    where: { userId: user.id },
    create: {
      userId: user.id,
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
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true, appointments: { orderBy: { scheduledAt: "asc" }, take: 20 } },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const { passwordHash: _ph, ...safeUser } = dbUser;
  void _ph;
  return NextResponse.json({ user: safeUser });
}
