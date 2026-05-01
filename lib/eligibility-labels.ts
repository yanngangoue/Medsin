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
