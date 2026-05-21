import type { EligibilityStatus, Prisma } from "@prisma/client";
import { GLP1_HEALTH_INFO_VERSION } from "@/lib/patient/glp1-dossier";

const STATUS_VALUES: EligibilityStatus[] = [
  "PENDING",
  "ELIGIBLE",
  "NOT_ELIGIBLE",
  "MEDICAL_REVIEW_REQUIRED",
];

export function parseEligibilityStatus(raw: string | null): EligibilityStatus | null {
  if (!raw) return null;
  return STATUS_VALUES.includes(raw as EligibilityStatus) ? (raw as EligibilityStatus) : null;
}

/** Profil avec évaluation GLP-1 enregistrée (healthInfo.version = 1). */
export function profileHasGlp1DossierWhere(): Prisma.PatientProfileWhereInput {
  return {
    healthInfo: {
      path: ["version"],
      equals: GLP1_HEALTH_INFO_VERSION,
    },
  };
}

export function buildAdminPatientsWhere(
  status: EligibilityStatus | null,
  queue: string | null,
  glp1Only: boolean,
): Prisma.UserWhereInput {
  const base: Prisma.UserWhereInput = { role: "PATIENT" };

  if (queue === "a_revoir") {
    return {
      ...base,
      profile: {
        is: {
          eligibility: "MEDICAL_REVIEW_REQUIRED",
          ...profileHasGlp1DossierWhere(),
        },
      },
    };
  }

  const profileParts: Prisma.PatientProfileWhereInput[] = [];
  if (glp1Only) profileParts.push(profileHasGlp1DossierWhere());

  if (!status && profileParts.length === 0) return base;

  if (!status) {
    return { ...base, profile: { is: profileParts[0] } };
  }

  if (status === "PENDING") {
    return {
      ...base,
      OR: [
        { profile: null },
        {
          profile: {
            is: {
              eligibility: "PENDING",
              ...(profileParts[0] ?? {}),
            },
          },
        },
      ],
    };
  }

  return {
    ...base,
    profile: {
      is: {
        eligibility: status,
        ...(profileParts[0] ?? {}),
      },
    },
  };
}
