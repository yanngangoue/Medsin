import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { computeBmi, simulateGlp1Eligibility } from "../../lib/eligibility";
import { onboardingSchema } from "../../lib/validations";

export async function getMe(req: Request, res: Response) {
  const sub = req.auth?.sub;
  if (!sub) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: sub },
    include: {
      profile: true,
      appointments: { orderBy: { scheduledAt: "asc" }, take: 20 },
    },
  });

  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  const { passwordHash: _ph, ...safeUser } = user;
  void _ph;
  res.json({ user: safeUser });
}

export async function saveOnboarding(req: Request, res: Response) {
  const sub = req.auth?.sub;
  if (!sub) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }

  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { age, weightKg, heightCm, medicalHistory } = parsed.data;
  const bmi = computeBmi(weightKg, heightCm);
  const { status: eligibility } = simulateGlp1Eligibility({
    age,
    bmi,
    medicalHistory,
  });

  const profile = await prisma.patientProfile.upsert({
    where: { userId: sub },
    create: {
      userId: sub,
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

  res.json({ profile });
}
