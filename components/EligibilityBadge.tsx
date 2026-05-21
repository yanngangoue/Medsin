import type { EligibilityStatus } from "@prisma/client";
import { eligibilityBadgeClass, eligibilityLabelFr } from "@/lib/eligibility-labels";

export function EligibilityBadge({ status }: { status: EligibilityStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${eligibilityBadgeClass(status)}`}
    >
      {eligibilityLabelFr(status)}
    </span>
  );
}
