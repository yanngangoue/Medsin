import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaffRole } from "@/lib/session";
import { forbidden, unauthorized, badRequest } from "@/lib/api-errors";
import { createPrescriptionSchema } from "@/lib/schemas/clinical";
import { createClinicalDecision, listClinicalDecisions } from "@/lib/clinical/decisions";
import { notifyEligibilityDecision } from "@/lib/email/notify";
import { writeAuditLog } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return catchRouteError("admin/patients/[id]/clinical-decisions/GET", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
      if (!isStaffRole(user.role)) return forbidden();
    
      const { id } = await params;
      const decisions = await listClinicalDecisions(id);
      return NextResponse.json({ decisions });
  });
}

export async function POST(req: Request, { params }: Params) {
  return catchRouteError("admin/patients/[id]/clinical-decisions/POST", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
      if (!isStaffRole(user.role)) return forbidden();
    
      const { id } = await params;
      const body = await req.json().catch(() => null);
      const parsed = createPrescriptionSchema.safeParse(body);
      if (!parsed.success) return badRequest();
    
      const patient = await prisma.user.findFirst({
        where: { id, role: "PATIENT" },
        select: { id: true, email: true, prenom: true, name: true },
      });
      if (!patient) return badRequest("Patient introuvable");
    
      const fullName = patient.prenom || patient.name || "";
    
      await prisma.patientProfile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          fullName,
          eligibility: parsed.data.eligibility,
          age: 0,
          weightKg: 0,
          heightCm: 0,
          bmi: 0,
          medicalHistory: "",
        },
        update: { eligibility: parsed.data.eligibility },
      });
    
      const decision = await createClinicalDecision({
        patientUserId: id,
        decidedByUserId: user.id,
        eligibility: parsed.data.eligibility,
        kind: "PRESCRIPTION_ISSUED",
        medication: parsed.data.medication,
        clinicalNote: parsed.data.clinicalNote ?? null,
        patientMessage: parsed.data.patientMessage,
      });
    
      await writeAuditLog({
        userId: user.id,
        action: "clinical_prescription_issued",
        entity: `${id}:${decision.id}`,
      });
    
      void notifyEligibilityDecision({
        userId: id,
        email: patient.email,
        prenom: patient.prenom || patient.name || "Patient",
        eligibility: parsed.data.eligibility,
        patientMessage: parsed.data.patientMessage,
        decisionId: decision.id,
      });
    
      return NextResponse.json({ decision }, { status: 201 });
  });
}
