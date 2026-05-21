import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isDemoMode } from "@/lib/is-demo-mode";
import { demoGetQuestionnaire, demoUpsertQuestionnaire } from "@/lib/demo-store";
import { eligibilityFromQuestionnaire } from "@/lib/questionnaire-eligibility";
import { objectifLabel } from "@/lib/questionnaire-labels";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (isDemoMode()) {
    const q = demoGetQuestionnaire(session.user.id);
    return NextResponse.json(q ?? {});
  }
  const [q, profile] = await Promise.all([
    prisma.questionnaire.findUnique({ where: { userId: session.user.id } }),
    prisma.patientProfile.findUnique({ where: { userId: session.user.id } }),
  ]);
  return NextResponse.json({
    questionnaire: q ?? null,
    eligibility: profile?.eligibility ?? "PENDING",
    profile: profile
      ? {
          bmi: profile.bmi,
          weightKg: profile.weightKg,
          heightCm: profile.heightCm,
          onboardingDone: profile.onboardingDone,
        }
      : null,
  });
}

const schema = z.object({
  objectif: z.string(),
  poids: z.number().positive(),
  taille: z.number().positive(),
  glpAntecedent: z.boolean(),
  glpLequel: z.string().optional(),
  antecedents: z.array(z.string()).min(1),
  medicaments: z.boolean(),
  medicamentsDesc: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { bmi, status, medicalHistory } = eligibilityFromQuestionnaire({
    poids: parsed.data.poids,
    taille: parsed.data.taille,
    antecedents: parsed.data.antecedents,
  });
  const now = new Date();

  if (isDemoMode()) {
    const q = demoUpsertQuestionnaire(session.user.id, {
      ...parsed.data,
      imc: bmi,
      submittedAt: now,
    });
    return NextResponse.json(
      { questionnaire: q, eligibility: status, objectifLabel: objectifLabel(parsed.data.objectif) },
      { status: 201 },
    );
  }

  const userId = session.user.id;
  const [q] = await prisma.$transaction([
    prisma.questionnaire.upsert({
      where: { userId },
      update: { ...parsed.data, imc: bmi, submittedAt: now },
      create: { userId, ...parsed.data, imc: bmi, submittedAt: now },
    }),
    prisma.patientProfile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: session.user.prenom ?? session.user.name ?? "",
        weightKg: parsed.data.poids,
        heightCm: parsed.data.taille,
        bmi,
        medicalHistory,
        eligibility: status,
        onboardingDone: true,
        age: 30,
      },
      update: {
        weightKg: parsed.data.poids,
        heightCm: parsed.data.taille,
        bmi,
        medicalHistory,
        eligibility: status,
        onboardingDone: true,
      },
    }),
  ]);

  return NextResponse.json(
    {
      questionnaire: q,
      eligibility: status,
      objectifLabel: objectifLabel(parsed.data.objectif),
    },
    { status: 201 },
  );
}
