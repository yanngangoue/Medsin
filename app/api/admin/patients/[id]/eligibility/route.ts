import { NextResponse } from "next/server";
import { catchRouteError } from "@/lib/api/catch-route-error";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaffRole } from "@/lib/session";
import { forbidden, unauthorized, badRequest } from "@/lib/api-errors";
import { patchEligibilitySchema } from "@/lib/schemas/clinical";
import { writeAuditLog } from "@/lib/audit";
import { createClinicalDecision, kindFromEligibility } from "@/lib/clinical/decisions";
import { notifyEligibilityDecision } from "@/lib/email/notify";
import type { ClinicalDecisionKind, PrescriptionMedication } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return catchRouteError("admin/patients/[id]/eligibility/PATCH", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
      if (!isStaffRole(user.role)) return forbidden();

      const { id } = await params;
      const body = await req.json().catch(() => null);
      const parsed = patchEligibilitySchema.safeParse(body);
      if (!parsed.success) return badRequest();

      const patient = await prisma.user.findFirst({
        where: { id, role: "PATIENT" },
        select: { id: true, email: true, prenom: true, name: true },
      });
      if (!patient) return badRequest("Patient introuvable");

      const existingProfile = await prisma.patientProfile.findUnique({
        where: { userId: id },
        select: { eligibility: true },
      });
      const oldStatus = existingProfile?.eligibility ?? "PENDING";

      const profile = await prisma.patientProfile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          fullName: patient.prenom || patient.name || "",
          eligibility: parsed.data.status,
          age: 0,
          weightKg: 0,
          heightCm: 0,
          bmi: 0,
          medicalHistory: "",
        },
        update: { eligibility: parsed.data.status },
      });

      if (oldStatus !== parsed.data.status || parsed.data.note) {
        await prisma.eligibilityHistory.create({
          data: {
            patientId: id,
            changedById: user.id,
            oldStatus,
            newStatus: parsed.data.status,
            note: parsed.data.note ?? null,
          },
        });
      }

      let kind: ClinicalDecisionKind = kindFromEligibility(parsed.data.status);
      if (parsed.data.issuePrescription && parsed.data.status === "ELIGIBLE") {
        kind = "PRESCRIPTION_ISSUED";
      }

      const decision = await createClinicalDecision({
        patientUserId: id,
        decidedByUserId: user.id,
        eligibility: parsed.data.status,
        kind,
        medication: (parsed.data.medication as PrescriptionMedication | undefined) ?? null,
        clinicalNote: parsed.data.note ?? null,
        patientMessage: parsed.data.patientMessage ?? null,
      });

      await writeAuditLog({
        userId: user.id,
        action: "admin_eligibility_update",
        entity: `${id}:${parsed.data.status}:${decision.id}`,
      });

      const prenom = patient.prenom || patient.name || "Patient";
      void notifyEligibilityDecision({
        userId: id,
        email: patient.email,
        prenom,
        eligibility: parsed.data.status,
        patientMessage: parsed.data.patientMessage,
        decisionId: decision.id,
      });

      return NextResponse.json({ profile, decision });
  });
}
