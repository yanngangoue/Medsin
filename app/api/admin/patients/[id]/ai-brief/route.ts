import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaffRole } from "@/lib/session";
import { forbidden, unauthorized, badRequest } from "@/lib/api-errors";
import { parseGlp1HealthInfo } from "@/lib/patient/glp1-dossier";
import { generateGlp1DoctorBrief } from "@/lib/patient/glp1-doctor-brief";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  return catchRouteError("admin/patients/[id]/ai-brief/POST", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
      if (!isStaffRole(user.role)) return forbidden();
    
      const { id } = await params;
      const patient = await prisma.user.findFirst({
        where: { id, role: "PATIENT" },
        select: { id: true, prenom: true, name: true, profile: { select: { healthInfo: true } } },
      });
    
      if (!patient) return badRequest("Patient introuvable");
    
      const glp1 = parseGlp1HealthInfo(patient.profile?.healthInfo);
      if (!glp1) {
        return NextResponse.json(
          { error: "Aucune évaluation GLP-1 enregistrée pour ce patient." },
          { status: 404 },
        );
      }
    
      const label = patient.prenom || patient.name || "Patient";
    
      try {
        const brief = await generateGlp1DoctorBrief(glp1, label);
        return NextResponse.json({
          brief,
          disclaimer:
            "Texte d’aide à la revue généré automatiquement. Ne remplace pas le jugement clinique.",
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erreur inconnue";
        if (message.includes("ANTHROPIC_API_KEY")) {
          return NextResponse.json(
            { error: "Brief IA non configuré (ANTHROPIC_API_KEY manquante)." },
            { status: 503 },
          );
        }
        return NextResponse.json({ error: message }, { status: 502 });
      }
  });
}
