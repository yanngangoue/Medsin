import { NextResponse } from "next/server";
import { catchRouteError } from "@/lib/api/catch-route-error";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaffRole } from "@/lib/session";
import { forbidden, unauthorized } from "@/lib/api-errors";
import {
  buildAdminPatientsWhere,
  parseDateFilter,
  parseEligibilityStatus,
} from "@/lib/admin/patient-filters";
import { hasGlp1Dossier, parseGlp1HealthInfo } from "@/lib/patient/glp1-dossier";

export async function GET(req: Request) {
  return catchRouteError("admin/patients/GET", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
      if (!isStaffRole(user.role)) return forbidden();

      const { searchParams } = new URL(req.url);
      const status = parseEligibilityStatus(searchParams.get("status"));
      const queue = searchParams.get("queue");
      const glp1Only = searchParams.get("glp1") === "1";
      const search = searchParams.get("search");
      const dateFilter = parseDateFilter(searchParams.get("dateFilter"));
      const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
      const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "10")));
      const skip = (page - 1) * limit;

      const where = buildAdminPatientsWhere(status, queue, glp1Only, search, dateFilter);

      const [total, patients] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            prenom: true,
            name: true,
            email: true,
            createdAt: true,
            profile: {
              select: {
                bmi: true,
                eligibility: true,
                weightKg: true,
                heightCm: true,
                age: true,
                healthInfo: true,
                updatedAt: true,
              },
            },
            questionnaire: { select: { objectif: true, imc: true, submittedAt: true } },
          },
        }),
      ]);

      return NextResponse.json({
        page,
        limit,
        total,
        patients: patients.map((p) => {
          const glp1 = parseGlp1HealthInfo(p.profile?.healthInfo);
          return {
            id: p.id,
            name: p.prenom || p.name || "—",
            email: p.email,
            createdAt: p.createdAt,
            bmi: p.profile?.bmi ?? p.questionnaire?.imc ?? null,
            imc: p.profile?.bmi ?? p.questionnaire?.imc ?? null,
            eligibility: p.profile?.eligibility ?? "PENDING",
            objectif: p.questionnaire?.objectif ?? null,
            hasGlp1Dossier: hasGlp1Dossier(p.profile?.healthInfo),
            glp1SubmittedAt: glp1?.submittedAt ?? null,
            age: p.profile?.age ?? null,
            weightKg: p.profile?.weightKg ?? null,
          };
        }),
      });
  });
}
