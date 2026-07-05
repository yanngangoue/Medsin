import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireNutritionnnisteSession } from "@/lib/nutritionniste/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const notesSchema = z.object({
  nutritionNotes: z.string().max(4000).optional(),
  dietaryPlan: z.string().max(4000).optional(),
  supplements: z.string().max(2000).optional(),
  nextReviewDate: z.string().optional(),
});

export async function GET(_req: Request, { params }: Params) {
  return catchRouteError("nutritionniste/patients/[id]/GET", async () => {
    const session = await requireNutritionnnisteSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id: patientId } = await params;

    const [user, weightProgram, recentCheckIns, questionnaire] = await Promise.all([
      prisma.user.findUnique({
        where: { id: patientId, role: "PATIENT" },
        select: {
          id: true,
          prenom: true,
          name: true,
          email: true,
          createdAt: true,
          profile: {
            select: {
              bmi: true,
              weightKg: true,
              heightCm: true,
              eligibility: true,
              healthInfo: true,
              age: true,
              gender: true,
            },
          },
        },
      }),
      prisma.weightProgram.findUnique({
        where: { userId: patientId },
        select: {
          id: true,
          status: true,
          startWeight: true,
          currentWeight: true,
          targetWeight: true,
          medication: true,
          currentDose: true,
          startDate: true,
          isActive: true,
        },
      }),
      prisma.weightCheckIn.findMany({
        where: { userId: patientId },
        orderBy: { recordedAt: "desc" },
        take: 12,
        select: {
          id: true,
          weight: true,
          energie: true,
          sommeil: true,
          nausee: true,
          notes: true,
          isEscalation: true,
          recordedAt: true,
        },
      }),
      prisma.medicalQuestionnaire.findFirst({
        where: { userId: patientId, status: "APPROVED" },
        orderBy: { approvedAt: "desc" },
        select: {
          id: true,
          medicalHistory: true,
          currentMedications: true,
          approvedAt: true,
          ipsNotes: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "Patient introuvable", code: "NOT_FOUND" }, { status: 404 });
    }

    // Notes nutritionniste stockées dans healthInfo JSON
    const healthInfo = (user.profile?.healthInfo ?? {}) as Record<string, unknown>;
    const nutritionData = {
      nutritionNotes: (healthInfo.nutritionNotes as string) ?? null,
      dietaryPlan: (healthInfo.dietaryPlan as string) ?? null,
      supplements: (healthInfo.supplements as string) ?? null,
      nextReviewDate: (healthInfo.nextReviewDate as string) ?? null,
    };

    return NextResponse.json({
      patient: {
        id: user.id,
        prenom: user.prenom,
        nom: user.name,
        email: user.email,
        age: user.profile?.age ?? null,
        gender: user.profile?.gender ?? null,
        bmi: user.profile?.bmi ?? null,
        weightKg: user.profile?.weightKg ?? null,
        heightCm: user.profile?.heightCm ?? null,
        eligibility: user.profile?.eligibility ?? null,
      },
      weightProgram,
      checkIns: recentCheckIns.map((c) => ({
        ...c,
        recordedAt: c.recordedAt.toISOString(),
      })),
      questionnaire: questionnaire
        ? {
            id: questionnaire.id,
            medicalHistory: questionnaire.medicalHistory,
            currentMedications: questionnaire.currentMedications,
            approvedAt: questionnaire.approvedAt?.toISOString() ?? null,
            ipsNotes: questionnaire.ipsNotes,
          }
        : null,
      nutritionData,
    });
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return catchRouteError("nutritionniste/patients/[id]/PATCH", async () => {
    const session = await requireNutritionnnisteSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id: patientId } = await params;

    const body: unknown = await req.json().catch(() => null);
    const parsed = notesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: patientId },
      select: { healthInfo: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil patient introuvable", code: "NOT_FOUND" }, { status: 404 });
    }

    const existing = (profile.healthInfo ?? {}) as Record<string, unknown>;
    const updated = {
      ...existing,
      ...(parsed.data.nutritionNotes !== undefined && { nutritionNotes: parsed.data.nutritionNotes }),
      ...(parsed.data.dietaryPlan !== undefined && { dietaryPlan: parsed.data.dietaryPlan }),
      ...(parsed.data.supplements !== undefined && { supplements: parsed.data.supplements }),
      ...(parsed.data.nextReviewDate !== undefined && { nextReviewDate: parsed.data.nextReviewDate }),
      nutritionUpdatedAt: new Date().toISOString(),
      nutritionUpdatedBy: session.user.id,
    };

    await prisma.patientProfile.update({
      where: { userId: patientId },
      data: { healthInfo: updated },
    });

    return NextResponse.json({ ok: true });
  });
}
