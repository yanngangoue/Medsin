import type { EligibilityStatus } from "@prisma/client";

export function eligibilityLabelFr(status: EligibilityStatus): string {
  switch (status) {
    case "ELIGIBLE":
      return "Éligible";
    case "NOT_ELIGIBLE":
      return "Non éligible";
    case "MEDICAL_REVIEW_REQUIRED":
      return "Revue médicale nécessaire";
    default:
      return status;
  }
}

export function eligibilityBadgeClass(status: EligibilityStatus): string {
  switch (status) {
    case "ELIGIBLE":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "NOT_ELIGIBLE":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "MEDICAL_REVIEW_REQUIRED":
      return "bg-amber-50 text-amber-900 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}
