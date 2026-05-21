import type {
  ClinicalDecisionKind,
  EligibilityStatus,
  PrescriptionMedication,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function kindFromEligibility(status: EligibilityStatus): ClinicalDecisionKind {
  switch (status) {
    case "ELIGIBLE":
      return "ELIGIBILITY_ELIGIBLE";
    case "NOT_ELIGIBLE":
      return "ELIGIBILITY_NOT_ELIGIBLE";
    case "MEDICAL_REVIEW_REQUIRED":
      return "ELIGIBILITY_REVIEW_REQUIRED";
    default:
      return "PRESCRIPTION_DEFERRED";
  }
}

const MEDICATION_FR: Record<PrescriptionMedication, string> = {
  SEMAGLUTIDE: "Semaglutide",
  TIRZEPATIDE: "Tirzépatide",
  LIRAGLUTIDE: "Liraglutide",
  OTHER: "Autre traitement",
  NONE: "Aucun",
};

export function medicationLabel(m: PrescriptionMedication | null | undefined): string | null {
  if (!m) return null;
  return MEDICATION_FR[m] ?? m;
}

export type CreateClinicalDecisionInput = {
  patientUserId: string;
  decidedByUserId: string;
  eligibility: EligibilityStatus;
  kind?: ClinicalDecisionKind;
  medication?: PrescriptionMedication | null;
  clinicalNote?: string | null;
  patientMessage?: string | null;
};

export async function createClinicalDecision(input: CreateClinicalDecisionInput) {
  const kind = input.kind ?? kindFromEligibility(input.eligibility);
  return prisma.clinicalDecision.create({
    data: {
      patientUserId: input.patientUserId,
      decidedByUserId: input.decidedByUserId,
      kind,
      eligibility: input.eligibility,
      medication: input.medication ?? null,
      clinicalNote: input.clinicalNote?.trim() || null,
      patientMessage: input.patientMessage?.trim() || null,
    },
    include: {
      decidedBy: { select: { prenom: true, name: true, role: true } },
    },
  });
}

export async function getLatestClinicalDecision(patientUserId: string) {
  return prisma.clinicalDecision.findFirst({
    where: { patientUserId },
    orderBy: { createdAt: "desc" },
    include: {
      decidedBy: { select: { prenom: true, name: true, role: true } },
    },
  });
}

export async function listClinicalDecisions(patientUserId: string, limit = 20) {
  return prisma.clinicalDecision.findMany({
    where: { patientUserId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      decidedBy: { select: { prenom: true, name: true, role: true } },
    },
  });
}

export const KIND_FR: Record<ClinicalDecisionKind, string> = {
  ELIGIBILITY_ELIGIBLE: "Profil admissible",
  ELIGIBILITY_NOT_ELIGIBLE: "Non admissible",
  ELIGIBILITY_REVIEW_REQUIRED: "Revue médicale",
  PRESCRIPTION_ISSUED: "Prescription enregistrée",
  PRESCRIPTION_DEFERRED: "Décision différée",
};
