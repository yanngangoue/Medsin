import { NextResponse } from "next/server";
import type { DossierStatus, EligibilityStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessDossier } from "@/lib/medecin/dossier-access";
import { logAuditMedical, requestMeta } from "@/lib/medecin/audit";
import { notifyDossierDecision } from "@/lib/medecin/notify-decision";
import { requireMedecinApi } from "@/lib/medecin/require-medecin";
import { medecinDecisionSchema } from "@/lib/schemas/medecin";
import { forbidden, badRequest } from "@/lib/api-errors";

type Params = { params: Promise<{ id: string }> };

const FINAL_STATUSES: DossierStatus[] = ["APPROUVE", "REFUSE", "INFO_REQUISE", "EN_ATTENTE_CONSULTATION"];

function mapProfileEligibility(status: DossierStatus): EligibilityStatus {
  if (status === "APPROUVE" || status === "EN_ATTENTE_CONSULTATION") return "ELIGIBLE";
  if (status === "REFUSE" || status === "EXCLU_PRE_DIAGNOSTIC") return "NOT_ELIGIBLE";
  return "MEDICAL_REVIEW_REQUIRED";
}

function mapDecisionToDossierStatus(decision: DossierStatus): DossierStatus {
  if (decision === "APPROUVE") return "EN_ATTENTE_CONSULTATION";
  return decision;
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireMedecinApi();
  if ("error" in auth) return auth.error;
  if (auth.role !== "MEDECIN") return badRequest("Seul un médecin peut prendre une décision");

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = medecinDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const dossier = await prisma.dossierGlp1.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, email: true, prenom: true, name: true, profile: true } },
    },
  });

  if (!dossier) return badRequest("Dossier introuvable");
  if (!canAccessDossier(auth.role, auth.user.id, dossier)) return forbidden();
  if (FINAL_STATUSES.includes(dossier.status)) {
    return badRequest("Décision déjà enregistrée — modification impossible");
  }

  const newStatus = mapDecisionToDossierStatus(parsed.data.decision as DossierStatus);
  const oldProfileStatus = dossier.patient.profile?.eligibility ?? "PENDING";

  const updated = await prisma.dossierGlp1.update({
    where: { id },
    data: {
      status: newStatus,
      medecinId: auth.user.id,
      decisionDate: new Date(),
      notesMedecin: parsed.data.notesMedecin,
      motifRefus: parsed.data.motifRefus ?? null,
    },
  });

  await prisma.patientProfile.upsert({
    where: { userId: dossier.patientId },
    create: {
      userId: dossier.patientId,
      fullName: dossier.patient.prenom || dossier.patient.name || "",
      eligibility: mapProfileEligibility(newStatus),
      age: 0,
      weightKg: 0,
      heightCm: 0,
      bmi: 0,
      medicalHistory: "",
    },
    update: { eligibility: mapProfileEligibility(newStatus) },
  });

  await prisma.eligibilityHistory.create({
    data: {
      patientId: dossier.patientId,
      changedById: auth.user.id,
      oldStatus: oldProfileStatus,
      newStatus: mapProfileEligibility(newStatus),
      note: `[Décision médecin ${newStatus}] ${parsed.data.notesMedecin}`,
    },
  });

  const meta = requestMeta(req);
  await logAuditMedical({
    medecinId: auth.user.id,
    patientId: dossier.patientId,
    action: "DECISION_PRISE",
    details: {
      dossierId: id,
      decision: newStatus,
      notesLength: parsed.data.notesMedecin.length,
    },
    ...meta,
  });

  const medecin = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { prenom: true, name: true },
  });
  const medecinName = medecin?.prenom || medecin?.name || "Médecin";

  void notifyDossierDecision({
    patientId: dossier.patientId,
    patientEmail: dossier.patient.email,
    patientPrenom: dossier.patient.prenom || dossier.patient.name || "Patient",
    medecinName,
    status: newStatus,
    motifRefus: parsed.data.motifRefus,
    dossierId: id,
  });

  return NextResponse.json({ dossier: updated });
}
