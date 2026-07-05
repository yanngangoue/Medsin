import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { requireNutritionnnisteSession } from "@/lib/nutritionniste/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return catchRouteError("nutritionniste/patients/GET", async () => {
    const session = await requireNutritionnnisteSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
    }

    // Patients avec programme de poids actif — cœur du suivi nutritionnel GLP-1
    const programs = await prisma.weightProgram.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
      take: 60,
      select: {
        id: true,
        status: true,
        startWeight: true,
        currentWeight: true,
        targetWeight: true,
        medication: true,
        currentDose: true,
        startDate: true,
        userId: true,
        user: {
          select: {
            id: true,
            prenom: true,
            name: true,
            email: true,
            profile: {
              select: { bmi: true, weightKg: true, eligibility: true },
            },
          },
        },
        checkIns: {
          orderBy: { recordedAt: "desc" },
          take: 1,
          select: {
            recordedAt: true,
            weight: true,
            energie: true,
            nausee: true,
            isEscalation: true,
          },
        },
      },
    });

    const patients = programs.map((p) => {
      const lastCheckIn = p.checkIns[0] ?? null;
      const weightLoss =
        p.startWeight && p.currentWeight
          ? Math.round((p.startWeight - p.currentWeight) * 10) / 10
          : null;
      return {
        programId: p.id,
        patientId: p.userId,
        prenom: p.user.prenom,
        nom: p.user.name,
        email: p.user.email,
        bmi: p.user.profile?.bmi ?? null,
        weightKg: p.user.profile?.weightKg ?? p.currentWeight,
        eligibility: p.user.profile?.eligibility ?? null,
        programStatus: p.status,
        medication: p.medication,
        currentDose: p.currentDose,
        startDate: p.startDate.toISOString(),
        weightLossKg: weightLoss,
        lastCheckIn: lastCheckIn
          ? {
              date: lastCheckIn.recordedAt.toISOString(),
              weight: lastCheckIn.weight,
              energie: lastCheckIn.energie,
              nausee: lastCheckIn.nausee,
              isEscalation: lastCheckIn.isEscalation,
            }
          : null,
      };
    });

    const withEscalation = patients.filter((p) => p.lastCheckIn?.isEscalation).length;

    return NextResponse.json({
      patients,
      stats: {
        total: patients.length,
        withEscalation,
        avgWeightLoss:
          patients.length > 0
            ? Math.round(
                (patients.reduce((s, p) => s + (p.weightLossKg ?? 0), 0) / patients.length) * 10,
              ) / 10
            : 0,
      },
    });
  });
}
