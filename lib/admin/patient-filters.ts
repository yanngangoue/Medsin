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

export type DateFilterKey = "today" | "week" | "month";

export function parseDateFilter(raw: string | null): DateFilterKey | null {
  if (raw === "today" || raw === "week" || raw === "month") return raw;
  return null;
}

function createdAtFromDateFilter(filter: DateFilterKey): Date {
  const now = new Date();
  if (filter === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (filter === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  const d = new Date(now);
  d.setMonth(d.getMonth() - 1);
  return d;
}

export function buildAdminPatientsWhere(
  status: EligibilityStatus | null,
  queue: string | null,
  glp1Only: boolean,
  search?: string | null,
  dateFilter?: DateFilterKey | null,
): Prisma.UserWhereInput {
  const base: Prisma.UserWhereInput = { role: "PATIENT" };

  const and: Prisma.UserWhereInput[] = [base];

  if (search?.trim()) {
    const q = search.trim();
    and.push({
      OR: [
        { prenom: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (dateFilter) {
    and.push({ createdAt: { gte: createdAtFromDateFilter(dateFilter) } });
  }

  if (queue === "a_revoir") {
    and.push({
      profile: {
        is: {
          eligibility: "MEDICAL_REVIEW_REQUIRED",
          ...profileHasGlp1DossierWhere(),
        },
      },
    });
    return and.length === 1 ? base : { AND: and };
  }

  const profileParts: Prisma.PatientProfileWhereInput[] = [];
  if (glp1Only) profileParts.push(profileHasGlp1DossierWhere());

  if (status) {
    if (status === "PENDING") {
      and.push({
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
      });
    } else {
      and.push({
        profile: {
          is: {
            eligibility: status,
            ...(profileParts[0] ?? {}),
          },
        },
      });
    }
  } else if (profileParts.length > 0) {
    and.push({ profile: { is: profileParts[0] } });
  }

  return and.length === 1 ? base : { AND: and };
}
